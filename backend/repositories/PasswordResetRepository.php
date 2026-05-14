<?php
declare(strict_types=1);

final class PasswordResetRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(int $userId, string $tokenHash, string $expiresAt): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at)
             VALUES (:user_id, :token_hash, :expires_at, NULL)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findValidByTokenHash(string $tokenHash): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, user_id, token_hash, expires_at, used_at
             FROM password_reset_tokens
             WHERE token_hash = :token_hash
               AND used_at IS NULL
               AND expires_at > NOW()
             LIMIT 1'
        );
        $stmt->execute(['token_hash' => $tokenHash]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    public function markUsed(int $tokenId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :id'
        );
        $stmt->execute(['id' => $tokenId]);
    }
}
