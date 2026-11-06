<?php
// Local PHP development server only; expose /api, never the repository root.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$root = realpath(__DIR__ . '/api');
$file = realpath(__DIR__ . $path);
if (is_string($path) && str_starts_with($path, '/api/') && $file !== false
    && str_starts_with($file, $root . DIRECTORY_SEPARATOR)
    && is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
    require $file;
    return true;
}
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => 'Not found.']);
