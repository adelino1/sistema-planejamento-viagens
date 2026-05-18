<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;

/**
 * Serviços de administração (estatísticas, gestão).
 */
class AdminService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    /**
     * Retorna estatísticas gerais do sistema.
     */
    public function getStatistics(): array
    {
        global $db;

        return [
            'totalUsers' => $this->getTotalUsers(),
            'activeUsers' => $this->getActiveUsers(),
            'totalTrips' => $this->getTotalTrips(),
            'totalExpenses' => $this->getTotalExpenses(),
            'averageTripsPerUser' => $this->getAverageTripsPerUser(),
        ];
    }

    /**
     * Retorna utilizadores registados recentemente.
     */
    public function getRecentUsers(int $limit = 10): array
    {
        global $db;

        $stmt = $db->prepare('
            SELECT id, full_name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ?
        ');
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Retorna viagens criadas recentemente.
     */
    public function getRecentTrips(int $limit = 10): array
    {
        global $db;

        $stmt = $db->prepare('
            SELECT t.id, t.name, t.country, t.city, u.full_name, t.created_at
            FROM trips t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT ?
        ');
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getTotalUsers(): int
    {
        global $db;
        return (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    }

    private function getActiveUsers(): int
    {
        global $db;
        return (int) $db->query('SELECT COUNT(*) FROM users WHERE is_active = 1')->fetchColumn();
    }

    private function getTotalTrips(): int
    {
        global $db;
        return (int) $db->query('SELECT COUNT(*) FROM trips')->fetchColumn();
    }

    private function getTotalExpenses(): string
    {
        global $db;
        return $db->query('SELECT SUM(amount) FROM expenses')->fetchColumn() ?? '0';
    }

    private function getAverageTripsPerUser(): float
    {
        $total = $this->getTotalTrips();
        $users = $this->getTotalUsers();
        return $users > 0 ? round($total / $users, 2) : 0;
    }
}
