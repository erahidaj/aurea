<?php

declare(strict_types=1);

require_once __DIR__ . '/environment.php';

function applyCors(array $allowedMethods): void
{
    $allowedOrigins = array_filter(array_map('trim', explode(',',
        getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173'
    )));

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Origin not allowed.',
        ]);

        exit;
    }

    if ($origin !== '') {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header(
        'Access-Control-Allow-Methods: ' .
        implode(', ', $allowedMethods)
    );

    header(
        'Access-Control-Allow-Headers: Content-Type, X-CSRF-Token'
    );

    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}