<?php
declare(strict_types=1);

final class SessionRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(int $userId, string $tokenHash, ?string $userAgent, ?string $ipAddress, string $expiresAt): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO user_sessions (user_id, token_hash, user_agent, ip_address, expires_at, revoked_at)
             VALUES (:user_id, :token_hash, :user_agent, :ip_address, :expires_at, NULL)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'user_agent' => $userAgent,
            'ip_address' => $ipAddress,
            'expires_at' => $expiresAt,
        ]);
    }

    public function revokeByTokenHash(string $tokenHash): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE user_sessions
             SET revoked_at = CURRENT_TIMESTAMP
             WHERE token_hash = :token_hash AND revoked_at IS NULL'
        );
        $stmt->execute(['token_hash' => $tokenHash]);
    }

    public function revokeAllActiveForUserId(int $userId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE user_sessions
             SET revoked_at = CURRENT_TIMESTAMP
             WHERE user_id = :user_id AND revoked_at IS NULL'
        );
        $stmt->execute(['user_id' => $userId]);
    }

    /**
     * @return array<string, mixed>|null Utilizador + metadados de sessão
     */
    public function findActiveUserByTokenHash(string $tokenHash): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT u.id, u.email, u.full_name, u.role, u.preferred_lang, u.theme, u.is_active,
                    s.id AS session_id, s.expires_at AS session_expires_at
             FROM user_sessions s
             INNER JOIN users u ON u.id = s.user_id
             WHERE s.token_hash = :token_hash
               AND s.revoked_at IS NULL
               AND s.expires_at > NOW()
               AND u.is_active = 1
             LIMIT 1'
        );
        $stmt->execute(['token_hash' => $tokenHash]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }
}
