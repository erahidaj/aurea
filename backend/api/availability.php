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

function availabilityError(
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

function validateInteger(
    mixed $value,
    int $minimum,
    int $maximum
): ?int {
    $validated = filter_var(
        $value,
        FILTER_VALIDATE_INT,
        [
            'options' => [
                'min_range' => $minimum,
                'max_range' => $maximum,
            ],
        ]
    );

    if ($validated === false) {
        return null;
    }

    return (int) $validated;
}

function parseAvailabilityDate(
    string $value
): ?DateTimeImmutable {
    $date = DateTimeImmutable::createFromFormat(
        '!Y-m-d',
        $value
    );

    if (
        !$date ||
        $date->format('Y-m-d') !== $value
    ) {
        return null;
    }

    return $date;
}

$data = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($data)) {
    availabilityError(
        'Të dhënat janë të pavlefshme.',
        400
    );
}

$checkInValue = trim(
    (string) ($data['checkIn'] ?? '')
);

$checkOutValue = trim(
    (string) ($data['checkOut'] ?? '')
);

$checkIn = parseAvailabilityDate(
    $checkInValue
);

$checkOut = parseAvailabilityDate(
    $checkOutValue
);

$roomsRequested = validateInteger(
    $data['rooms'] ?? 1,
    1,
    20
);

$adults = validateInteger(
    $data['adults'] ?? 1,
    1,
    100
);

$children = validateInteger(
    $data['children'] ?? 0,
    0,
    100
);

$infants = validateInteger(
    $data['infants'] ?? 0,
    0,
    100
);

/*
|--------------------------------------------------------------------------
| Dhoma e ardhur nga Home, Rooms ose Room Details
|--------------------------------------------------------------------------
|
| roomId është opsional.
|
| Nëse roomId është null:
| kontrollohen të gjitha dhomat.
|
| Nëse roomId ka një vlerë:
| kontrollohet vetëm dhoma e zgjedhur.
|
*/

$roomId = null;

if (
    isset($data['roomId']) &&
    $data['roomId'] !== '' &&
    $data['roomId'] !== null
) {
    $roomId = validateInteger(
        $data['roomId'],
        1,
        2147483647
    );

    if ($roomId === null) {
        availabilityError(
            'Dhoma e zgjedhur është e pavlefshme.'
        );
    }
}

if (!$checkIn || !$checkOut) {
    availabilityError(
        'Zgjidh data të vlefshme.'
    );
}

$today = new DateTimeImmutable('today');

if ($checkIn < $today) {
    availabilityError(
        'Data e hyrjes nuk mund të jetë në të kaluarën.'
    );
}

if ($checkOut <= $checkIn) {
    availabilityError(
        'Data e daljes duhet të jetë pas datës së hyrjes.'
    );
}

if (
    $roomsRequested === null ||
    $adults === null ||
    $children === null ||
    $infants === null
) {
    availabilityError(
        'Kontrollo numrin e dhomave dhe vizitorëve.'
    );
}

$nights = (int) $checkIn
    ->diff($checkOut)
    ->format('%a');

if ($nights < 1 || $nights > 365) {
    availabilityError(
        'Kohëzgjatja e qëndrimit është e pavlefshme.'
    );
}

try {
    $database = getDatabaseConnection();

    /*
    |--------------------------------------------------------------------------
    | Query bazë
    |--------------------------------------------------------------------------
    */

    $query = '
        SELECT
            r.id,
            r.slug,
            r.price,
            r.inventory_count,

            COALESCE(
                SUM(b.rooms_count),
                0
            ) AS reserved_count

        FROM rooms AS r

        LEFT JOIN bookings AS b
            ON b.room_id = r.id
            AND b.status = "confirmed"
            AND b.check_in < :check_out
            AND b.check_out > :check_in

        WHERE r.available = 1
    ';

    /*
    |--------------------------------------------------------------------------
    | Filtro vetëm dhomën e zgjedhur
    |--------------------------------------------------------------------------
    */

    if ($roomId !== null) {
        $query .= '
            AND r.id = :room_id
        ';
    }

    $query .= '
        GROUP BY
            r.id,
            r.slug,
            r.price,
            r.inventory_count

        HAVING (
            r.inventory_count -
            COALESCE(
                SUM(b.rooms_count),
                0
            )
        ) >= :rooms_requested

        ORDER BY r.price ASC
    ';

    $statement = $database->prepare($query);

    $statement->bindValue(
        ':check_in',
        $checkIn->format('Y-m-d'),
        PDO::PARAM_STR
    );

    $statement->bindValue(
        ':check_out',
        $checkOut->format('Y-m-d'),
        PDO::PARAM_STR
    );

    $statement->bindValue(
        ':rooms_requested',
        $roomsRequested,
        PDO::PARAM_INT
    );

    if ($roomId !== null) {
        $statement->bindValue(
            ':room_id',
            $roomId,
            PDO::PARAM_INT
        );
    }

    $statement->execute();

    $databaseRooms = $statement->fetchAll(
        PDO::FETCH_ASSOC
    );

    $availableRooms = array_map(
        static function (
            array $room
        ) use (
            $roomsRequested,
            $nights
        ): array {
            $inventory = (int) $room[
                'inventory_count'
            ];

            $reserved = (int) $room[
                'reserved_count'
            ];

            $availableCount = max(
                0,
                $inventory - $reserved
            );

            $pricePerNight = (float) $room[
                'price'
            ];

            return [
                'id' => (int) $room['id'],

                'slug' => (string) $room['slug'],

                'price' => $pricePerNight,

                'inventoryCount' => $inventory,

                'reservedCount' => $reserved,

                'availableCount' => $availableCount,

                'requestedRooms' => $roomsRequested,

                'nights' => $nights,

                'totalPrice' =>
                    $pricePerNight *
                    $nights *
                    $roomsRequested,
            ];
        },
        $databaseRooms
    );

    echo json_encode([
        'success' => true,

        'search' => [
            'checkIn' =>
                $checkIn->format('Y-m-d'),

            'checkOut' =>
                $checkOut->format('Y-m-d'),

            'nights' => $nights,

            'rooms' => $roomsRequested,

            'adults' => $adults,

            'children' => $children,

            'infants' => $infants,

            'roomId' => $roomId,
        ],

        'rooms' => $availableRooms,
    ]);
} catch (Throwable $error) {
    error_log(
        'Availability search failed: ' .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Disponueshmëria nuk mund të kontrollohej.',
    ]);
}