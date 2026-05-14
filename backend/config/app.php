<?php
declare(strict_types=1);

/**
 * Configuração geral da API (PHP puro).
 * Valores podem ser sobrescritos por variáveis de ambiente (.env).
 */
return [
    'name' => 'Travel Planning API',
    'env' => getenv('APP_ENV') ?: 'local',
    'debug' => filter_var(getenv('APP_DEBUG') ?: '0', FILTER_VALIDATE_BOOLEAN),
    'session_ttl_hours' => max(1, (int) (getenv('SESSION_TTL_HOURS') ?: 168)),
    'password_reset_ttl_minutes' => max(5, (int) (getenv('PASSWORD_RESET_TTL_MINUTES') ?: 60)),
    'cors_allowed_origins' => array_values(array_filter(array_map(
        static fn (string $item): string => trim($item),
        explode(',', (string) (getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:4200,http://127.0.0.1:4200'))
    ))),
];
