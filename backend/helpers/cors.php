<?php
declare(strict_types=1);

/**
 * Cabeçalhos CORS (lista branca de origens).
 * Mantido em helpers para não confundir com autenticação de pedidos.
 */
function applyCorsHeaders(array $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}
