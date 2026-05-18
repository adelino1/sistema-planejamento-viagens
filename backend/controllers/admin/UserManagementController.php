<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Services\AdminUserService;
use App\Exceptions\HttpException;

/**
 * Gestão de utilizadores (admin).
 * Requer autenticação e role = 'admin'.
 */
class UserManagementController
{
    private AdminUserService $service;

    public function __construct()
    {
        $this->service = new AdminUserService();
    }

    /**
     * GET /api/v1/admin/users
     */
    public function index(): void
    {
        $page = (int) ($_GET['page'] ?? 1);
        $limit = (int) ($_GET['limit'] ?? 20);
        $result = $this->service->getAllUsers($page, $limit);
        echo json_encode($result);
    }

    /**
     * GET /api/v1/admin/users/{id}
     */
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $user = $this->service->getUser($id);
        echo json_encode(['data' => $user]);
    }

    /**
     * PUT /api/v1/admin/users/{id}
     */
    public function update(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $user = $this->service->updateUser($id, $body);
        echo json_encode(['data' => $user]);
    }

    /**
     * DELETE /api/v1/admin/users/{id}
     */
    public function destroy(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $this->service->deleteUser($id);
        echo json_encode(['message' => 'User deleted']);
    }

    /**
     * PATCH /api/v1/admin/users/{id}/deactivate
     */
    public function deactivate(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $this->service->deactivateUser($id);
        echo json_encode(['message' => 'User deactivated']);
    }

    /**
     * PATCH /api/v1/admin/users/{id}/activate
     */
    public function activate(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $this->service->activateUser($id);
        echo json_encode(['message' => 'User activated']);
    }
}
