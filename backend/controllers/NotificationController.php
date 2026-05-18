<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\NotificationService;
use App\Exceptions\HttpException;

/**
 * CRUD de Notificações (Notifications).
 * Requer autenticação Bearer.
 */
class NotificationController
{
    private NotificationService $service;

    public function __construct()
    {
        $this->service = new NotificationService();
    }

    /**
     * GET /api/v1/notifications
     * Lista todas as notificações do utilizador.
     */
    public function index(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $read = isset($_GET['read']) ? filter_var($_GET['read'], FILTER_VALIDATE_BOOLEAN) : null;
        $limit = (int) ($_GET['limit'] ?? 50);

        $notifications = $this->service->getAllNotifications($userId, $read, $limit);
        echo json_encode(['data' => $notifications, 'count' => count($notifications)]);
    }

    /**
     * GET /api/v1/notifications/unread-count
     * Obtém o número de notificações não lidas.
     */
    public function unreadCount(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $count = $this->service->getUnreadCount($userId);
        echo json_encode(['data' => ['count' => $count]]);
    }

    /**
     * GET /api/v1/notifications/{id}
     * Obtém uma notificação específica.
     */
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $notification = $this->service->getNotification($id, $userId);
        echo json_encode(['data' => $notification]);
    }

    /**
     * POST /api/v1/notifications
     * Cria uma nova notificação.
     */
    public function store(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $notification = $this->service->createNotification(
            $userId,
            $body['type'] ?? 'info',
            $body['title'] ?? '',
            $body['message'] ?? '',
            $body['link'] ?? null
        );

        http_response_code(201);
        echo json_encode(['data' => $notification]);
    }

    /**
     * PUT /api/v1/notifications/{id}/read
     * Marca uma notificação como lida.
     */
    public function markAsRead(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $notification = $this->service->markAsRead($id, $userId);
        echo json_encode(['data' => $notification]);
    }

    /**
     * PUT /api/v1/notifications/read-all
     * Marca todas as notificações como lidas.
     */
    public function markAllAsRead(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $count = $this->service->markAllAsRead($userId);
        echo json_encode(['data' => ['marked_count' => $count]]);
    }

    /**
     * DELETE /api/v1/notifications/{id}
     * Elimina uma notificação.
     */
    public function destroy(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $this->service->deleteNotification($id, $userId);
        echo json_encode(['message' => 'Notification deleted']);
    }
}
