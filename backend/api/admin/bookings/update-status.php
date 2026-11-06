<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/require-admin.php';

applyCors(['POST', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

requireAdmin(true);

$data = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Të dhënat janë të pavlefshme.',
    ]);

    exit;
}

$bookingId = filter_var(
    $data['bookingId'] ?? null,
    FILTER_VALIDATE_INT,
    [
        'options' => [
            'min_range' => 1,
        ],
    ]
);

$status = trim(
    (string) ($data['status'] ?? '')
);

$adminNotes = trim(
    (string) ($data['adminNotes'] ?? '')
);

$allowedStatuses = [
    'confirmed',
    'rejected',
    'cancelled',
    'completed',
];

if ($bookingId === false) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Rezervimi është i pavlefshëm.',
    ]);

    exit;
}

if (!in_array($status, $allowedStatuses, true)) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Statusi është i pavlefshëm.',
    ]);

    exit;
}

if (mb_strlen($adminNotes) > 2000) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Shënimi është shumë i gjatë.',
    ]);

    exit;
}

try {
    $database = getDatabaseConnection();

    $bookingStatement = $database->prepare(
        'SELECT
            id,
            booking_code,
            room_name,
            guest_name,
            guest_email,
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
         FROM bookings
         WHERE id = :id
         LIMIT 1'
    );

    $bookingStatement->execute([
        'id' => $bookingId,
    ]);

    $booking = $bookingStatement->fetch();

    if (!$booking) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Rezervimi nuk u gjet.',
        ]);

        exit;
    }

    $updateStatement = $database->prepare(
        'UPDATE bookings
         SET
            status = :status,
            admin_notes = :admin_notes
         WHERE id = :id'
    );

    $updateStatement->execute([
        'status' => $status,
        'admin_notes' =>
            $adminNotes !== ''
                ? $adminNotes
                : null,
        'id' => $bookingId,
    ]);

    $statusLabels = [
        'confirmed' => 'Confirmed',
        'rejected' => 'Rejected',
        'cancelled' => 'Cancelled',
        'completed' => 'Completed',
    ];

    $statusMessages = [
        'confirmed' =>
            'Your reservation request has been confirmed.',

        'rejected' =>
            'Unfortunately, your reservation request could not be confirmed.',

        'cancelled' =>
            'Your reservation has been cancelled.',

        'completed' =>
            'Your stay has been marked as completed.',
    ];

    $emailSent = false;
    $emailWarning = null;

    try {
        $mailConfig = require __DIR__ .
            '/../../../config/mail.php';

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = $mailConfig['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $mailConfig['username'];
        $mail->Password = $mailConfig['password'];
        $mail->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = (int) $mailConfig['port'];
        $mail->CharSet = 'UTF-8';

        $mail->setFrom(
            $mailConfig['from_email'],
            $mailConfig['from_name']
        );

        $mail->addAddress(
            $booking['guest_email'],
            $booking['guest_name']
        );

        $safeGuestName = htmlspecialchars(
            $booking['guest_name'],
            ENT_QUOTES,
            'UTF-8'
        );

        $safeBookingCode = htmlspecialchars(
            $booking['booking_code'],
            ENT_QUOTES,
            'UTF-8'
        );

        $safeRoomName = htmlspecialchars(
            $booking['room_name'],
            ENT_QUOTES,
            'UTF-8'
        );

        $safeAdminNotes = nl2br(
            htmlspecialchars(
                $adminNotes,
                ENT_QUOTES,
                'UTF-8'
            )
        );

        $statusLabel = $statusLabels[$status];
        $statusMessage = $statusMessages[$status];

        $mail->isHTML(true);

        $mail->Subject =
            "Reservation {$statusLabel} - " .
            $booking['booking_code'];

        $mail->Body = "
            <div style='margin:0;padding:30px;background:#f7f5f2;font-family:Arial,sans-serif;color:#181818'>
                <div style='max-width:640px;margin:auto;background:#ffffff;border:1px solid #ece7e1;border-radius:16px;overflow:hidden'>
                    <div style='padding:26px 30px;background:#181818;color:#ffffff'>
                        <h1 style='margin:0;font-size:24px'>
                            Star Hotel
                        </h1>

                        <p style='margin:7px 0 0;color:#d7b08b'>
                            Reservation {$statusLabel}
                        </p>
                    </div>

                    <div style='padding:30px'>
                        <p>Hello {$safeGuestName},</p>

                        <p>{$statusMessage}</p>

                        <div style='margin:24px 0;padding:20px;background:#f7f5f2;border-radius:12px'>
                            <p>
                                <strong>Booking code:</strong>
                                {$safeBookingCode}
                            </p>

                            <p>
                                <strong>Room:</strong>
                                {$safeRoomName}
                            </p>

                            <p>
                                <strong>Check-in:</strong>
                                {$booking['check_in']}
                            </p>

                            <p>
                                <strong>Check-out:</strong>
                                {$booking['check_out']}
                            </p>

                            <p>
                                <strong>Nights:</strong>
                                {$booking['nights']}
                            </p>

                            <p>
                                <strong>Total:</strong>
                                €{$booking['total_price']}
                            </p>
                        </div>
        ";

        if ($adminNotes !== '') {
            $mail->Body .= "
                <div style='margin:20px 0;padding:16px;border-left:3px solid #c39a72;background:#faf8f5'>
                    <strong>Message from the hotel:</strong>
                    <p>{$safeAdminNotes}</p>
                </div>
            ";
        }

        $mail->Body .= "
                        <p>
                            If you have any questions, reply to this email.
                        </p>

                        <p>
                            Kind regards,<br>
                            <strong>Star Hotel</strong>
                        </p>
                    </div>
                </div>
            </div>
        ";

        $mail->AltBody =
            "Hello {$booking['guest_name']},\n\n" .
            "{$statusMessage}\n\n" .
            "Booking code: {$booking['booking_code']}\n" .
            "Room: {$booking['room_name']}\n" .
            "Check-in: {$booking['check_in']}\n" .
            "Check-out: {$booking['check_out']}\n" .
            "Nights: {$booking['nights']}\n" .
            "Total: €{$booking['total_price']}\n\n" .
            (
                $adminNotes !== ''
                    ? "Hotel message: {$adminNotes}\n\n"
                    : ''
            ) .
            "Kind regards,\nStar Hotel";

        $mail->send();
        $emailSent = true;
    } catch (Exception $emailError) {
        $emailWarning =
            'Statusi u ruajt, por email-i nuk u dërgua.';

        error_log(
            'Booking status email failed: ' .
            $emailError->getMessage()
        );
    }

    echo json_encode([
        'success' => true,
        'message' =>
            $emailSent
                ? 'Statusi u ndryshua dhe email-i iu dërgua klientit.'
                : $emailWarning,

        'emailSent' => $emailSent,

        'booking' => [
            'id' => (int) $bookingId,
            'status' => $status,
            'adminNotes' =>
                $adminNotes !== ''
                    ? $adminNotes
                    : null,
        ],
    ]);
} catch (Throwable $error) {
    error_log(
        'Booking status update failed: ' .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Statusi i rezervimit nuk mund të ndryshohej.',
    ]);
}