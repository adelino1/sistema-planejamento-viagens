<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\FavoriteService;
use App\Exceptions\HttpException;

/**
 * CRUD de Favoritos (Favorites).
 * Requer autenticação Bearer.
 */
class FavoriteController
{
    private FavoriteService $service;

    public function __construct()
    {
        $this->service = new FavoriteService();
    }

    /**
     * GET /api/v1/favorites
     * Lista todos os favoritos do utilizador.
     */
    public function index(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $favorites = $this->service->getAllFavorites($userId);
        echo json_encode(['data' => $favorites, 'count' => count($favorites)]);
    }

    /**
     * GET /api/v1/favorites/{id}
     * Obtém um favorito específico.
     */
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $favorite = $this->service->getFavorite($id, $userId);
        echo json_encode(['data' => $favorite]);
    }

    /**
     * POST /api/v1/favorites
     * Cria um novo favorito.
     */
    public function store(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $favorite = $this->service->createFavorite(
            $userId,
            $body['favorite_type'] ?? 'place',
            $body['label'] ?? '',
            $body['country'] ?? null,
            $body['city'] ?? null,
            $body['latitude'] ?? null,
            $body['longitude'] ?? null,
            $body['metadata'] ?? null
        );

        http_response_code(201);
        echo json_encode(['data' => $favorite]);
    }

    /**
     * PUT /api/v1/favorites/{id}
     * Atualiza um favorito.
     */
    public function update(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $favorite = $this->service->updateFavorite(
            $id,
            $userId,
            $body['label'] ?? null,
            $body['country'] ?? null,
            $body['city'] ?? null,
            $body['latitude'] ?? null,
            $body['longitude'] ?? null,
            $body['metadata'] ?? null
        );

        echo json_encode(['data' => $favorite]);
    }

    /**
     * DELETE /api/v1/favorites/{id}
     * Elimina um favorito.
     */
    public function destroy(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $this->service->deleteFavorite($id, $userId);
        echo json_encode(['message' => 'Favorite deleted']);
    }
}
