<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/require-admin.php';

applyCors(['GET', 'OPTIONS']);

header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
);

header('Pragma: no-cache');
header('Expires: 0');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

requireAdmin();

$allowedStatuses = [
    'pending',
    'confirmed',
    'rejected',
    'cancelled',
    'completed',
];

$status = trim(
    (string) ($_GET['status'] ?? '')
);

if (
    $status !== '' &&
    !in_array($status, $allowedStatuses, true)
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Statusi është i pavlefshëm.',
    ]);

    exit;
}

try {
    $database = getDatabaseConnection();

    $query = '
        SELECT
            id,
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
            status,
            admin_notes,
            created_at,
            updated_at
        FROM bookings
    ';

    $parameters = [];

    if ($status !== '') {
        $query .= ' WHERE status = :status';

        $parameters['status'] = $status;
    }

    $query .= '
        ORDER BY
            CASE status
                WHEN "pending" THEN 1
                WHEN "confirmed" THEN 2
                WHEN "cancelled" THEN 3
                WHEN "rejected" THEN 4
                WHEN "completed" THEN 5
                ELSE 6
            END,
            created_at DESC
    ';

    $statement = $database->prepare($query);
    $statement->execute($parameters);

    $bookings = array_map(
        static function (array $booking): array {
            return [
                'id' => (int) $booking['id'],

                'bookingCode' =>
                    $booking['booking_code'],

                'roomId' =>
                    $booking['room_id'] !== null
                        ? (int) $booking['room_id']
                        : null,

                'roomName' =>
                    $booking['room_name'],

                'guestName' =>
                    $booking['guest_name'],

                'guestEmail' =>
                    $booking['guest_email'],

                'guestPhone' =>
                    $booking['guest_phone'],

                'checkIn' =>
                    $booking['check_in'],

                'checkOut' =>
                    $booking['check_out'],

                'nights' =>
                    (int) $booking['nights'],

                'roomsCount' =>
                    (int) $booking['rooms_count'],

                'adults' =>
                    (int) $booking['adults'],

                'children' =>
                    (int) $booking['children'],

                'infants' =>
                    (int) $booking['infants'],

                'pricePerNight' =>
                    (float) $booking['price_per_night'],

                'totalPrice' =>
                    (float) $booking['total_price'],

                'status' =>
                    $booking['status'],

                'adminNotes' =>
                    $booking['admin_notes'],

                'createdAt' =>
                    $booking['created_at'],

                'updatedAt' =>
                    $booking['updated_at'],
            ];
        },
        $statement->fetchAll()
    );

    $statisticsStatement = $database->query(
        'SELECT
            COUNT(*) AS total,
            SUM(status = "pending") AS pending,
            SUM(status = "confirmed") AS confirmed,
            SUM(status = "rejected") AS rejected,
            SUM(status = "cancelled") AS cancelled,
            SUM(status = "completed") AS completed
         FROM bookings'
    );

    $statistics = $statisticsStatement->fetch();

    echo json_encode([
        'success' => true,

        'bookings' => $bookings,

        'statistics' => [
            'total' =>
                (int) ($statistics['total'] ?? 0),

            'pending' =>
                (int) ($statistics['pending'] ?? 0),

            'confirmed' =>
                (int) ($statistics['confirmed'] ?? 0),

            'rejected' =>
                (int) ($statistics['rejected'] ?? 0),

            'cancelled' =>
                (int) ($statistics['cancelled'] ?? 0),

            'completed' =>
                (int) ($statistics['completed'] ?? 0),
        ],
    ]);
} catch (Throwable $error) {
    error_log(
        'Admin bookings list failed: ' .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Rezervimet nuk mund të ngarkoheshin.',
    ]);
}