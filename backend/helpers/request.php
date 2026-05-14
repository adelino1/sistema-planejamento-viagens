<?php
declare(strict_types=1);

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    return is_array($decoded) ? $decoded : [];
}

/**
 * Normaliza o path do pedido removendo o prefixo do diretório público (compatível com XAMPP).
 * Ex.: /sistema-planejamento-viagens/backend/public/api/v1/health -> /api/v1/health
 */
function normalizeRequestPath(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (!is_string($path) || $path === '') {
        $path = '/';
    }

    $scriptName = (string) ($_SERVER['SCRIPT_NAME'] ?? '');
    $base = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

    if ($base !== '' && $base !== '/' && str_starts_with($path, $base)) {
        $path = substr($path, strlen($base)) ?: '/';
    }

    if ($path === '' || $path[0] !== '/') {
        $path = '/' . ltrim($path, '/');
    }

    return $path === '' ? '/' : $path;
}
