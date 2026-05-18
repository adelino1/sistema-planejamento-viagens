<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;

class NotificationRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByUserId(int $userId, ?bool $read = null, int $limit = 50): array
    {
        $sql = "
            SELECT id, user_id, type, title, message, link, is_read, created_at
            FROM notifications
            WHERE user_id = :user_id
        ";
        
        $params = ['user_id' => $userId];

        if ($read !== null) {
            $sql .= " AND is_read = :is_read";
            $params['is_read'] = $read ? 1 : 0;
        }

        $sql .= " ORDER BY created_at DESC LIMIT :limit";

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, type, title, message, link, is_read, created_at
            FROM notifications
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): array {
        $stmt = $this->pdo->prepare("
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (:user_id, :type, :title, :message, :link)
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
        ]);

        return $this->findById((int) $this->pdo->lastInsertId(), $userId);
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function markAllAsRead(int $userId): int
    {
        $stmt = $this->pdo->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE user_id = :user_id AND is_read = 0
        ");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->rowCount();
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM notifications
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function getUnreadCount(int $userId): int
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = :user_id AND is_read = 0
        ");
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($result['count'] ?? 0);
    }
}
