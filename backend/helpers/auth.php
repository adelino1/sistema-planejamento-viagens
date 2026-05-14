<?php
declare(strict_types=1);

/**
 * Extrai token Bearer do cabeçalho Authorization.
 */
function getBearerToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['Authorization']
        ?? null;
    if (!is_string($header) || $header === '') {
        return null;
    }

    if (preg_match('/Bearer\s+(\S+)/i', $header, $matches) !== 1) {
        return null;
    }

    $token = trim($matches[1]);

    return $token !== '' ? $token : null;
}

function hashOpaqueToken(string $plainToken): string
{
    return hash('sha256', $plainToken);
}
