<?php

declare(strict_types=1);

function loadEnvironmentFile(string $filePath): void
{
    if (!is_file($filePath) || !is_readable($filePath)) {
        return;
    }

    $lines = file(
        $filePath,
        FILE_IGNORE_NEW_LINES |
        FILE_SKIP_EMPTY_LINES
    );

    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        if (
            $line === '' ||
            str_starts_with($line, '#')
        ) {
            continue;
        }

        $separatorPosition = strpos($line, '=');

        if ($separatorPosition === false) {
            continue;
        }

        $name = trim(
            substr(
                $line,
                0,
                $separatorPosition
            )
        );

        $value = trim(
            substr(
                $line,
                $separatorPosition + 1
            )
        );

        if ($name === '') {
            continue;
        }

        if (
            strlen($value) >= 2 &&
            (
                (
                    $value[0] === '"' &&
                    $value[
                        strlen($value) - 1
                    ] === '"'
                ) ||
                (
                    $value[0] === "'" &&
                    $value[
                        strlen($value) - 1
                    ] === "'"
                )
            )
        ) {
            $value = substr(
                $value,
                1,
                -1
            );
        }

        /*
         * Variablat reale të serverit kanë përparësi.
         * .env përdoret vetëm kur ato nuk ekzistojnë.
         */
        if (getenv($name) !== false) {
            continue;
        }

        putenv("{$name}={$value}");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

loadEnvironmentFile(
    dirname(__DIR__) . '/.env'
);