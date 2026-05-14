<?php
declare(strict_types=1);

require_once __DIR__ . '/../helpers/database.php';

/**
 * Serviço mínimo para verificar conectividade à base de dados.
 */
final class HealthService
{
    public function databasePing(): array
    {
        $pdo = getPdoConnection();
        $pdo->query('SELECT 1');

        return [
            'database' => 'ok',
        ];
    }
}
