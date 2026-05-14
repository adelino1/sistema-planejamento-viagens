<?php
declare(strict_types=1);

/**
 * Ligação à base de dados MySQL (XAMPP).
 * Credenciais via .env / variáveis de ambiente do Apache.
 */
return [
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_DATABASE') ?: 'travel_planning',
    'username' => getenv('DB_USERNAME') ?: 'root',
    'password' => getenv('DB_PASSWORD') !== false ? (string) getenv('DB_PASSWORD') : '',
    'charset' => 'utf8mb4',
];
