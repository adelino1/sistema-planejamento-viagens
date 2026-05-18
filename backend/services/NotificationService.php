<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\NotificationRepository;
use App\Exceptions\HttpException;

class NotificationService
{
    private NotificationRepository $repository;

    public function __construct(NotificationRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllNotifications(int $userId, ?bool $read = null, int $limit = 50): array
    {
        return $this->repository->findByUserId($userId, $read, $limit);
    }

    public function getNotification(int $id, int $userId): array
    {
        $notification = $this->repository->findById($id, $userId);
        if (!$notification) {
            throw new HttpException('Notification not found', 404);
        }
        return $notification;
    }

    public function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): array {
        // Validate notification type
        $validTypes = ['info', 'success', 'warning', 'error', 'trip', 'expense', 'system'];
        if (!in_array($type, $validTypes)) {
            throw new HttpException('Invalid notification type. Must be: ' . implode(', ', $validTypes), 400);
        }

        return $this->repository->create($userId, $type, $title, $message, $link);
    }

    public function markAsRead(int $id, int $userId): array
    {
        $notification = $this->repository->findById($id, $userId);
        if (!$notification) {
            throw new HttpException('Notification not found', 404);
        }

        $this->repository->markAsRead($id, $userId);
        return $this->repository->findById($id, $userId);
    }

    public function markAllAsRead(int $userId): int
    {
        return $this->repository->markAllAsRead($userId);
    }

    public function deleteNotification(int $id, int $userId): void
    {
        $notification = $this->repository->findById($id, $userId);
        if (!$notification) {
            throw new HttpException('Notification not found', 404);
        }

        $this->repository->delete($id, $userId);
    }

    public function getUnreadCount(int $userId): int
    {
        return $this->repository->getUnreadCount($userId);
    }
}
