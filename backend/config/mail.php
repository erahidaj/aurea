<?php

declare(strict_types=1);

require_once __DIR__ . '/environment.php';

$config = [
    'host' =>
        trim((string) getenv('MAIL_HOST')),

    'username' =>
        trim((string) getenv('MAIL_USERNAME')),

    'password' =>
        trim((string) getenv('MAIL_PASSWORD')),

    'port' =>
        (int) (
            getenv('MAIL_PORT') ?: 587
        ),

    'from_email' =>
        trim((string) getenv('MAIL_FROM')),

    'from_name' =>
        trim(
            (string) (
                getenv('MAIL_FROM_NAME') ?:
                'Star Hotel'
            )
        ),

    'owner_email' =>
        trim((string) getenv('MAIL_OWNER')),
];

$requiredValues = [
    'MAIL_HOST' =>
        $config['host'],

    'MAIL_USERNAME' =>
        $config['username'],

    'MAIL_PASSWORD' =>
        $config['password'],

    'MAIL_FROM' =>
        $config['from_email'],
];

foreach (
    $requiredValues as
    $environmentName => $value
) {
    if ($value === '') {
        throw new RuntimeException(
            "{$environmentName} is not configured."
        );
    }
}

if (
    !filter_var(
        $config['from_email'],
        FILTER_VALIDATE_EMAIL
    )
) {
    throw new RuntimeException(
        'MAIL_FROM is not a valid email address.'
    );
}

if (
    $config['owner_email'] !== '' &&
    !filter_var(
        $config['owner_email'],
        FILTER_VALIDATE_EMAIL
    )
) {
    throw new RuntimeException(
        'MAIL_OWNER is not a valid email address.'
    );
}

return $config;