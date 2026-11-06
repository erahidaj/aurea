<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';

applyCors(['POST', 'OPTIONS']);
startSecureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

$data = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid request.',
    ]);

    exit;
}

$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !is_string($password) ||
    $password === ''
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Vendos email-in dhe password-in.',
    ]);

    exit;
}

try {
    $database = getDatabaseConnection();

    $statement = $database->prepare(
        'SELECT
            id,
            email,
            password_hash,
            role,
            failed_attempts,
            locked_until
         FROM admins
         WHERE email = :email
         LIMIT 1'
    );

    $statement->execute([
        'email' => $email,
    ]);

    $admin = $statement->fetch();

    if ($admin && $admin['locked_until']) {
        $lockedUntil = new DateTimeImmutable(
            $admin['locked_until']
        );

        $now = new DateTimeImmutable();

        if ($lockedUntil > $now) {
            http_response_code(429);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Shumë tentativa. Provo përsëri pas 15 minutash.',
            ]);

            exit;
        }

        $resetLock = $database->prepare(
            'UPDATE admins
             SET failed_attempts = 0, locked_until = NULL
             WHERE id = :id'
        );

        $resetLock->execute([
            'id' => $admin['id'],
        ]);

        $admin['failed_attempts'] = 0;
        $admin['locked_until'] = null;
    }

    if (
        !$admin ||
        !password_verify(
            $password,
            $admin['password_hash']
        )
    ) {
        if ($admin) {
            $failedAttempts =
                (int) $admin['failed_attempts'] + 1;

            $lockedUntil =
                $failedAttempts >= 5
                    ? date('Y-m-d H:i:s', time() + 900)
                    : null;

            $updateFailure = $database->prepare(
                'UPDATE admins
                 SET
                    failed_attempts = :failed_attempts,
                    locked_until = :locked_until
                 WHERE id = :id'
            );

            $updateFailure->execute([
                'failed_attempts' => $failedAttempts,
                'locked_until' => $lockedUntil,
                'id' => $admin['id'],
            ]);
        }

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Email ose password i gabuar.',
        ]);

        exit;
    }

    session_regenerate_id(true);

    $_SESSION['admin_id'] = (int) $admin['id'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_role'] = $admin['role'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['last_activity'] = time();
    $_SESSION['user_agent'] = hash(
        'sha256',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );

    $updateSuccess = $database->prepare(
        'UPDATE admins
         SET
            failed_attempts = 0,
            locked_until = NULL,
            last_login_at = NOW()
         WHERE id = :id'
    );

    $updateSuccess->execute([
        'id' => $admin['id'],
    ]);

    echo json_encode([
        'success' => true,
        'admin' => [
            'id' => (int) $admin['id'],
            'email' => $admin['email'],
            'role' => $admin['role'],
        ],
        'csrfToken' => $_SESSION['csrf_token'],
    ]);
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Login failed.',
    ]);
}