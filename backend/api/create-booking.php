<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

applyCors(['POST', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

function sendBookingError(
    string $message,
    int $statusCode = 422
): never {
    http_response_code($statusCode);

    echo json_encode([
        'success' => false,
        'message' => $message,
    ]);

    exit;
}

function readPositiveInteger(
    mixed $value,
    int $minimum,
    int $maximum
): ?int {
    $validatedValue = filter_var(
        $value,
        FILTER_VALIDATE_INT,
        [
            'options' => [
                'min_range' => $minimum,
                'max_range' => $maximum,
            ],
        ]
    );

    if ($validatedValue === false) {
        return null;
    }

    return (int) $validatedValue;
}

function parseBookingDate(string $value): ?DateTimeImmutable
{
    $formats = ['!d/m/Y', '!Y-m-d'];

    foreach ($formats as $format) {
        $date = DateTimeImmutable::createFromFormat(
            $format,
            $value
        );

        if (!$date) {
            continue;
        }

        $expectedFormat =
            $format === '!d/m/Y'
                ? 'd/m/Y'
                : 'Y-m-d';

        if ($date->format($expectedFormat) === $value) {
            return $date;
        }
    }

    return null;
}

function generateBookingCode(): string
{
    return sprintf(
        'SH-%s-%s',
        date('Ymd'),
        strtoupper(bin2hex(random_bytes(3)))
    );
}

$requestBody = file_get_contents('php://input');

if ($requestBody === false || $requestBody === '') {
    sendBookingError(
        'Nuk u dërguan të dhëna.',
        400
    );
}

$data = json_decode($requestBody, true);

if (!is_array($data)) {
    sendBookingError(
        'Të dhënat e rezervimit janë të pavlefshme.',
        400
    );
}

$guest = $data['guest'] ?? null;
$booking = $data['booking'] ?? null;

if (!is_array($guest) || !is_array($booking)) {
    sendBookingError(
        'Të dhënat e rezervimit mungojnë.',
        400
    );
}

$guestName = trim((string) ($guest['fullName'] ?? ''));
$guestEmail = strtolower(
    trim((string) ($guest['email'] ?? ''))
);
$guestPhone = trim((string) ($guest['phone'] ?? ''));

if (
    mb_strlen($guestName) < 2 ||
    mb_strlen($guestName) > 150
) {
    sendBookingError(
        'Vendos një emër të vlefshëm.'
    );
}

if (
    !filter_var(
        $guestEmail,
        FILTER_VALIDATE_EMAIL
    ) ||
    mb_strlen($guestEmail) > 190
) {
    sendBookingError(
        'Vendos një email të vlefshëm.'
    );
}

if (mb_strlen($guestPhone) > 30) {
    sendBookingError(
        'Numri i telefonit është shumë i gjatë.'
    );
}

$roomId = readPositiveInteger(
    $booking['roomId'] ?? null,
    1,
    1000000
);

$roomsCount = readPositiveInteger(
    $booking['rooms'] ?? 1,
    1,
    20
);

$adults = readPositiveInteger(
    $booking['adults'] ?? 1,
    1,
    100
);

$children = readPositiveInteger(
    $booking['children'] ?? 0,
    0,
    100
);

$infants = readPositiveInteger(
    $booking['infants'] ?? 0,
    0,
    100
);

if ($roomId === null) {
    sendBookingError(
        'Zgjidh një dhomë për rezervimin.'
    );
}

if (
    $roomsCount === null ||
    $adults === null ||
    $children === null ||
    $infants === null
) {
    sendBookingError(
        'Kontrollo numrin e dhomave dhe të vizitorëve.'
    );
}

$checkInValue = trim(
    (string) ($booking['checkInDate'] ?? '')
);

$checkOutValue = trim(
    (string) ($booking['checkOutDate'] ?? '')
);

$checkIn = parseBookingDate($checkInValue);
$checkOut = parseBookingDate($checkOutValue);

if (!$checkIn || !$checkOut) {
    sendBookingError(
        'Datat e rezervimit janë të pavlefshme.'
    );
}

$today = new DateTimeImmutable('today');

if ($checkIn < $today) {
    sendBookingError(
        'Data e hyrjes nuk mund të jetë në të kaluarën.'
    );
}

if ($checkOut <= $checkIn) {
    sendBookingError(
        'Data e daljes duhet të jetë pas datës së hyrjes.'
    );
}

$nights = (int) $checkIn
    ->diff($checkOut)
    ->format('%a');

if ($nights < 1 || $nights > 365) {
    sendBookingError(
        'Kohëzgjatja e rezervimit është e pavlefshme.'
    );
}

try {
    $database = getDatabaseConnection();

    $roomStatement = $database->prepare(
        'SELECT
            id,
            slug,
            price,
            available
         FROM rooms
         WHERE id = :id
         LIMIT 1'
    );

    $roomStatement->execute([
        'id' => $roomId,
    ]);

    $room = $roomStatement->fetch();

    if (!$room) {
        sendBookingError(
            'Dhoma nuk u gjet.',
            404
        );
    }

    if ((int) $room['available'] !== 1) {
        sendBookingError(
            'Kjo dhomë nuk është aktualisht e disponueshme.',
            409
        );
    }

    /*
     * Çmimi merret nga MySQL.
     * Nuk përdorim çmimin ose totalin e dërguar nga React-i.
     */
    $pricePerNight = (float) $room['price'];

    $totalPrice =
        $pricePerNight *
        $nights *
        $roomsCount;

    $bookingCode = generateBookingCode();

    $database->beginTransaction();

    $insertStatement = $database->prepare(
        'INSERT INTO bookings (
            booking_code,
            room_id,
            room_name,
            guest_name,
            guest_email,
            guest_phone,
            check_in,
            check_out,
            nights,
            rooms_count,
            adults,
            children,
            infants,
            price_per_night,
            total_price,
            status
         ) VALUES (
            :booking_code,
            :room_id,
            :room_name,
            :guest_name,
            :guest_email,
            :guest_phone,
            :check_in,
            :check_out,
            :nights,
            :rooms_count,
            :adults,
            :children,
            :infants,
            :price_per_night,
            :total_price,
            :status
         )'
    );

    $insertStatement->execute([
        'booking_code' => $bookingCode,
        'room_id' => (int) $room['id'],
        'room_name' => $room['slug'],
        'guest_name' => $guestName,
        'guest_email' => $guestEmail,

        'guest_phone' =>
            $guestPhone !== ''
                ? $guestPhone
                : null,

        'check_in' =>
            $checkIn->format('Y-m-d'),

        'check_out' =>
            $checkOut->format('Y-m-d'),

        'nights' => $nights,
        'rooms_count' => $roomsCount,
        'adults' => $adults,
        'children' => $children,
        'infants' => $infants,

        'price_per_night' =>
            number_format(
                $pricePerNight,
                2,
                '.',
                ''
            ),

        'total_price' =>
            number_format(
                $totalPrice,
                2,
                '.',
                ''
            ),

        'status' => 'pending',
    ]);

    $bookingId = (int) $database->lastInsertId();

    $database->commit();

    http_response_code(201);

    echo json_encode([
        'success' => true,
        'message' =>
            'Kërkesa e rezervimit u regjistrua me sukses.',

        'booking' => [
            'id' => $bookingId,
            'code' => $bookingCode,
            'status' => 'pending',
            'pricePerNight' => $pricePerNight,
            'nights' => $nights,
            'rooms' => $roomsCount,
            'totalPrice' => $totalPrice,
        ],
    ]);
} catch (Throwable $error) {
    if (
        isset($database) &&
        $database instanceof PDO &&
        $database->inTransaction()
    ) {
        $database->rollBack();
    }

    error_log(
        'Booking creation failed: ' .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Rezervimi nuk mund të ruhej. Provo përsëri.',
    ]);
}