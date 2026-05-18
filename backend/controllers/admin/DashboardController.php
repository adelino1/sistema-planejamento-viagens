<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Services\AdminService;

/**
 * Dashboard admin.
 * Requer autenticação e role = 'admin'.
 */
class DashboardController
{
    private AdminService $service;

    public function __construct()
    {
        $this->service = new AdminService();
    }

    /**
     * GET /api/v1/admin/dashboard/stats
     */
    public function stats(): void
    {
        $stats = $this->service->getStatistics();
        echo json_encode(['data' => $stats]);
    }

    /**
     * GET /api/v1/admin/dashboard/recent-users
     */
    public function recentUsers(): void
    {
        $limit = (int) ($_GET['limit'] ?? 10);
        $users = $this->service->getRecentUsers($limit);
        echo json_encode(['data' => $users]);
    }

    /**
     * GET /api/v1/admin/dashboard/recent-trips
     */
    public function recentTrips(): void
    {
        $limit = (int) ($_GET['limit'] ?? 10);
        $trips = $this->service->getRecentTrips($limit);
        echo json_encode(['data' => $trips]);
    }
}
