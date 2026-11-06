<?php

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'http://localhost:5173',
    'https://example.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);

    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = getDatabaseConnection();

    $statement = $database->query(
        'SELECT id, slug, price, available
         FROM rooms
         ORDER BY id'
    );

    echo json_encode([
        'success' => true,
        'rooms' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Rooms could not be loaded.',
    ]);
}