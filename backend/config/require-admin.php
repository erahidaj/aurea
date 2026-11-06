<?php

declare(strict_types=1);

require_once __DIR__ . '/session.php';

function rejectUnauthorized(): never
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $cookieParameters = session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            [
                'expires' => time() - 42000,
                'path' => $cookieParameters['path'],
                'domain' => $cookieParameters['domain'],
                'secure' => $cookieParameters['secure'],
                'httponly' => $cookieParameters['httponly'],
                'samesite' =>
                    $cookieParameters['samesite'] ?? 'Strict',
            ]
        );
    }

    session_destroy();

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Nuk jeni i autorizuar.',
    ]);

    exit;
}

function requireAdmin(bool $checkCsrf = false): void
{
    startSecureSession();

    $adminId = $_SESSION['admin_id'] ?? null;
    $adminRole = $_SESSION['admin_role'] ?? null;
    $lastActivity = $_SESSION['last_activity'] ?? 0;

    $savedUserAgent = $_SESSION['user_agent'] ?? '';

    $currentUserAgent = hash(
        'sha256',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );

    $sessionExpired =
        !is_int($lastActivity) ||
        time() - $lastActivity > 1800;

    if (
        !$adminId ||
        $adminRole !== 'admin' ||
        $sessionExpired ||
        !hash_equals($savedUserAgent, $currentUserAgent)
    ) {
        rejectUnauthorized();
    }

    $_SESSION['last_activity'] = time();

    if ($checkCsrf) {
        $savedToken = $_SESSION['csrf_token'] ?? '';
        $requestToken =
            $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

        if (
            $savedToken === '' ||
            $requestToken === '' ||
            !hash_equals($savedToken, $requestToken)
        ) {
            http_response_code(403);

            echo json_encode([
                'success' => false,
                'message' => 'Token sigurie i pavlefshëm.',
            ]);

            exit;
        }
    }
}