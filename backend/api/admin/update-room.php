<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/require-admin.php';

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

$id = filter_var(
    $data['id'] ?? null,
    FILTER_VALIDATE_INT,
    [
        'options' => [
            'min_range' => 1,
        ],
    ]
);

$price = filter_var(
    $data['price'] ?? null,
    FILTER_VALIDATE_FLOAT
);

$available = $data['available'] ?? null;

if (
    $id === false ||
    $price === false ||
    $price < 0 ||
    $price > 100000 ||
    !is_bool($available)
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Kontrollo çmimin dhe disponueshmërinë.',
    ]);

    exit;
}

try {
    $database = getDatabaseConnection();

    $statement = $database->prepare(
        'UPDATE rooms
         SET
            price = :price,
            available = :available
         WHERE id = :id'
    );

    $statement->execute([
        'price' => $price,
        'available' => $available ? 1 : 0,
        'id' => $id,
    ]);

    if ($statement->rowCount() === 0) {
        $checkRoom = $database->prepare(
            'SELECT id FROM rooms WHERE id = :id'
        );

        $checkRoom->execute(['id' => $id]);

        if (!$checkRoom->fetch()) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Dhoma nuk u gjet.',
            ]);

            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Dhoma u përditësua me sukses.',
        'room' => [
            'id' => (int) $id,
            'price' => (float) $price,
            'available' => $available,
        ],
    ]);
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Ndryshimi nuk mund të ruhej.',
    ]);
}