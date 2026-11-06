<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/require-admin.php';

applyCors(['GET', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

requireAdmin();

echo json_encode([
    'success' => true,
    'admin' => [
        'id' => (int) $_SESSION['admin_id'],
        'email' => $_SESSION['admin_email'],
        'role' => $_SESSION['admin_role'],
    ],
    'csrfToken' => $_SESSION['csrf_token'],
]);