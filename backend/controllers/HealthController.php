<?php
declare(strict_types=1);

require_once __DIR__ . '/../services/HealthService.php';

final class HealthController
{
    public function __construct(private readonly HealthService $healthService)
    {
    }

    public function ping(): void
    {
        successResponse([
            'service' => 'travel-planning-api',
            'version' => '0.1.0',
            'timestamp' => gmdate('c'),
        ], 'API online.');
    }

    /**
     * Verifica se a API consegue executar uma query simples na MySQL.
     */
    public function status(): void
    {
        try {
            $db = $this->healthService->databasePing();
            successResponse(array_merge($db, [
                'api' => 'ok',
                'timestamp' => gmdate('c'),
            ]), 'API e base de dados operacionais.');
        } catch (Throwable $e) {
            errorResponse('Falha na ligação à base de dados.', ['database_unreachable'], 503);
        }
    }
}
