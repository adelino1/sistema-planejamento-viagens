<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;
use App\Exceptions\HttpException;

/**
 * Gestão de utilizadores (admin).
 */
class AdminUserService
{
    private UserRepository $repo;

    public function __construct()
    {
        $this->repo = new UserRepository();
    }

    /**
     * Lista todos os utilizadores (paginado).
     */
    public function getAllUsers(int $page = 1, int $limit = 20): array
    {
        global $db;

        $offset = ($page - 1) * $limit;

        $stmt = $db->prepare('
            SELECT id, full_name, email, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ');
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, \PDO::PARAM_INT);
        $stmt->execute();

        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $total = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();

        return [
            'data' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ]
        ];
    }

    /**
     * Obtém um utilizador.
     */
    public function getUser(int $id): array
    {
        $user = $this->repo->findById($id);
        if (!$user) {
            throw new HttpException('User not found', 404);
        }
        unset($user['password_hash']);
        return $user;
    }

    /**
     * Atualiza utilizador.
     */
    public function updateUser(int $id, array $data): array
    {
        if (!$this->repo->findById($id)) {
            throw new HttpException('User not found', 404);
        }

        global $db;

        $allowed = ['full_name', 'preferred_lang', 'theme'];
        $updates = [];
        $values = [];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($updates)) {
            return $this->getUser($id);
        }

        $values[] = $id;
        $query = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';

        $stmt = $db->prepare($query);
        $stmt->execute($values);

        return $this->getUser($id);
    }

    /**
     * Elimina utilizador.
     */
    public function deleteUser(int $id): void
    {
        if (!$this->repo->findById($id)) {
            throw new HttpException('User not found', 404);
        }

        global $db;
        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
    }

    /**
     * Desativa utilizador.
     */
    public function deactivateUser(int $id): void
    {
        if (!$this->repo->findById($id)) {
            throw new HttpException('User not found', 404);
        }

        global $db;
        $stmt = $db->prepare('UPDATE users SET is_active = 0 WHERE id = ?');
        $stmt->execute([$id]);
    }

    /**
     * Ativa utilizador.
     */
    public function activateUser(int $id): void
    {
        if (!$this->repo->findById($id)) {
            throw new HttpException('User not found', 404);
        }

        global $db;
        $stmt = $db->prepare('UPDATE users SET is_active = 1 WHERE id = ?');
        $stmt->execute([$id]);
    }
}
