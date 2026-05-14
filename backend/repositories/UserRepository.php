<?php
declare(strict_types=1);

final class UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, email, password_hash, full_name, role, preferred_lang, theme, is_active, created_at, updated_at
             FROM users
             WHERE email = :email
             LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, email, password_hash, full_name, role, preferred_lang, theme, is_active, created_at, updated_at
             FROM users
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    public function create(string $fullName, string $email, string $passwordHash, string $role = 'user'): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (email, password_hash, full_name, role, preferred_lang, theme, is_active)
             VALUES (:email, :password_hash, :full_name, :role, :preferred_lang, :theme, 1)'
        );
        $stmt->execute([
            'email' => $email,
            'password_hash' => $passwordHash,
            'full_name' => $fullName,
            'role' => $role,
            'preferred_lang' => 'pt',
            'theme' => 'system',
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function updatePasswordHash(int $userId, string $passwordHash): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE users SET password_hash = :password_hash, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
        );
        $stmt->execute([
            'password_hash' => $passwordHash,
            'id' => $userId,
        ]);
    }
}
