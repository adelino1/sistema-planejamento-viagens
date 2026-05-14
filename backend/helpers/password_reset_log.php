<?php
declare(strict_types=1);

/**
 * Registo local do token de recuperação (APENAS com APP_DEBUG).
 * Nunca devolver o token na resposta HTTP JSON.
 */
function logPasswordResetTokenForDebug(string $email, string $plainToken): void
{
    $baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'logs';
    if (!is_dir($baseDir) && !mkdir($baseDir, 0755, true) && !is_dir($baseDir)) {
        error_log('[password-reset] Falha ao criar diretório de logs.');
        return;
    }

    $line = sprintf("[%s] email=%s token=%s\n", gmdate('c'), $email, $plainToken);
    $path = $baseDir . DIRECTORY_SEPARATOR . 'password-reset-debug.log';
    file_put_contents($path, $line, FILE_APPEND | LOCK_EX);
}
