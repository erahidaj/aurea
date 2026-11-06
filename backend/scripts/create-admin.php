<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../config/database.php';
echo "Local admin email: ";
$email = trim((string) fgets(STDIN));
echo "Local admin password (visible input, at least 12 characters): ";
$password = rtrim((string) fgets(STDIN), "\r\n");
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
    fwrite(STDERR, "Use a valid email and at least 12 password characters.\n");
    exit(1);
}
try {
    $query = getDatabaseConnection()->prepare(
        'INSERT INTO admins (email, password_hash, role) VALUES (:email, :hash, :role)'
    );
    $query->execute(['email' => strtolower($email),
        'hash' => password_hash($password, PASSWORD_DEFAULT), 'role' => 'admin']);
    echo "Local admin created. No credentials are written to source files.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "Could not create admin. Check database configuration and duplicate email.\n");
    exit(1);
}
