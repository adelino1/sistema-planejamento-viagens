<?php
declare(strict_types=1);

require_once __DIR__ . '/../exceptions/HttpException.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/password_reset_log.php';

final class AuthService
{
    public function __construct(
        private PDO $pdo,
        private UserRepository $users,
        private SessionRepository $sessions,
        private PasswordResetRepository $passwordResets,
        private array $appConfig
    ) {
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function register(array $input): array
    {
        $fullName = trim((string) ($input['full_name'] ?? ''));
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');

        if ($fullName === '' || $email === '' || $password === '') {
            return [
                'ok' => false,
                'message' => 'Campos obrigatórios em falta.',
                'errors' => ['full_name, email e password são obrigatórios.'],
                'status' => 422,
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'ok' => false,
                'message' => 'Email inválido.',
                'errors' => ['email inválido.'],
                'status' => 422,
            ];
        }

        if (strlen($password) < 8) {
            return [
                'ok' => false,
                'message' => 'Palavra-passe fraca.',
                'errors' => ['password deve ter pelo menos 8 caracteres.'],
                'status' => 422,
            ];
        }

        if ($this->users->findByEmail($email) !== null) {
            return [
                'ok' => false,
                'message' => 'Email já registado.',
                'errors' => ['email deve ser único.'],
                'status' => 409,
            ];
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $this->pdo->beginTransaction();

        try {
            $userId = $this->users->create($fullName, $email, $hash, 'user');
            $user = $this->users->findById($userId);
            if ($user === null) {
                throw new RuntimeException('Utilizador não encontrado após insert.');
            }

            $token = $this->persistSessionToken($userId);
            $this->pdo->commit();

            return [
                'ok' => true,
                'message' => 'Conta criada com sucesso.',
                'data' => [
                    'token' => $token,
                    'user' => $this->serializeUser($user),
                ],
                'status' => 201,
            ];
        } catch (Throwable) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            return [
                'ok' => false,
                'message' => 'Erro ao criar conta.',
                'errors' => ['tente novamente ou contacte o suporte.'],
                'status' => 500,
            ];
        }
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function login(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');

        if ($email === '' || $password === '') {
            return [
                'ok' => false,
                'message' => 'Credenciais em falta.',
                'errors' => ['email e password são obrigatórios.'],
                'status' => 422,
            ];
        }

        $user = $this->users->findByEmail($email);
        if ($user === null || !password_verify($password, (string) $user['password_hash'])) {
            return [
                'ok' => false,
                'message' => 'Credenciais inválidas.',
                'errors' => ['email ou password incorretos.'],
                'status' => 401,
            ];
        }

        if ((int) $user['is_active'] !== 1) {
            return [
                'ok' => false,
                'message' => 'Conta desativada.',
                'errors' => ['contacte o suporte.'],
                'status' => 403,
            ];
        }

        $this->pdo->beginTransaction();

        try {
            $token = $this->persistSessionToken((int) $user['id']);
            $this->pdo->commit();
        } catch (Throwable) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            return [
                'ok' => false,
                'message' => 'Erro ao iniciar sessão.',
                'errors' => ['tente novamente.'],
                'status' => 500,
            ];
        }

        return [
            'ok' => true,
            'message' => 'Sessão iniciada.',
            'data' => [
                'token' => $token,
                'user' => $this->serializeUser($user),
            ],
            'status' => 200,
        ];
    }

    /**
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function logout(): array
    {
        $plain = getBearerToken();
        if ($plain === null) {
            return [
                'ok' => false,
                'message' => 'Token em falta.',
                'errors' => ['Authorization Bearer obrigatório.'],
                'status' => 401,
            ];
        }

        $this->sessions->revokeByTokenHash(hashOpaqueToken($plain));

        return [
            'ok' => true,
            'message' => 'Sessão terminada.',
            'data' => [],
            'status' => 200,
        ];
    }

    /**
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function me(): array
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            return [
                'ok' => false,
                'message' => 'Não autorizado.',
                'errors' => ['token inválido ou expirado.'],
                'status' => 401,
            ];
        }

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => ['user' => $user],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function requestPasswordReset(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'ok' => false,
                'message' => 'Email inválido.',
                'errors' => ['indique um email válido.'],
                'status' => 422,
            ];
        }

        $debug = (bool) ($this->appConfig['debug'] ?? false);

        $user = $this->users->findByEmail($email);
        if ($user !== null) {
            $plain = bin2hex(random_bytes(32));
            $hash = hashOpaqueToken($plain);
            $minutes = (int) ($this->appConfig['password_reset_ttl_minutes'] ?? 60);
            $expiresAt = date('Y-m-d H:i:s', strtotime('+' . $minutes . ' minutes'));
            $this->passwordResets->create((int) $user['id'], $hash, $expiresAt);

            if ($debug) {
                logPasswordResetTokenForDebug($email, $plain);
            }
        }

        return [
            'ok' => true,
            'message' => 'Se o email existir, foi gerado um token de recuperação.',
            'data' => [],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>}
     */
    public function resetPassword(array $input): array
    {
        $token = trim((string) ($input['token'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        if ($token === '' || $password === '') {
            return [
                'ok' => false,
                'message' => 'Dados em falta.',
                'errors' => ['token e password são obrigatórios.'],
                'status' => 422,
            ];
        }

        if (strlen($password) < 8) {
            return [
                'ok' => false,
                'message' => 'Palavra-passe fraca.',
                'errors' => ['password deve ter pelo menos 8 caracteres.'],
                'status' => 422,
            ];
        }

        $row = $this->passwordResets->findValidByTokenHash(hashOpaqueToken($token));
        if ($row === null) {
            return [
                'ok' => false,
                'message' => 'Token inválido ou expirado.',
                'errors' => ['solicite nova recuperação.'],
                'status' => 400,
            ];
        }

        $userId = (int) $row['user_id'];
        $newHash = password_hash($password, PASSWORD_DEFAULT);

        $this->pdo->beginTransaction();

        try {
            $this->users->updatePasswordHash($userId, $newHash);
            $this->passwordResets->markUsed((int) $row['id']);
            $this->sessions->revokeAllActiveForUserId($userId);
            $this->pdo->commit();
        } catch (Throwable) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            return [
                'ok' => false,
                'message' => 'Erro ao atualizar palavra-passe.',
                'errors' => ['tente novamente.'],
                'status' => 500,
            ];
        }

        return [
            'ok' => true,
            'message' => 'Palavra-passe atualizada. Inicie sessão novamente.',
            'data' => [],
            'status' => 200,
        ];
    }

    /**
     * @return array<string, mixed>|null Utilizador autenticado (sem password_hash).
     */
    public function getAuthenticatedUser(): ?array
    {
        $plain = getBearerToken();
        if ($plain === null) {
            return null;
        }

        $row = $this->sessions->findActiveUserByTokenHash(hashOpaqueToken($plain));
        if ($row === null) {
            return null;
        }

        return $this->serializeUser($row);
    }

    /**
     * @return array<string, mixed>
     */
    public function requireAuthenticatedUser(): array
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            throw new HttpException('Não autorizado.', 401, ['token inválido, expirado ou em falta.']);
        }

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    public function requireAdminUser(): array
    {
        $user = $this->requireAuthenticatedUser();
        if (($user['role'] ?? '') !== 'admin') {
            throw new HttpException('Acesso reservado a administradores.', 403, ['forbidden']);
        }

        return $user;
    }

    /**
     * Cria registo de sessão e devolve o token em texto claro (só para entregar ao cliente uma vez).
     */
    private function persistSessionToken(int $userId): string
    {
        $plain = bin2hex(random_bytes(32));
        $hash = hashOpaqueToken($plain);
        $hours = (int) ($this->appConfig['session_ttl_hours'] ?? 168);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+' . $hours . ' hours'));
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 255) : null;
        $ip = isset($_SERVER['REMOTE_ADDR']) ? substr((string) $_SERVER['REMOTE_ADDR'], 0, 45) : null;
        $this->sessions->create($userId, $hash, $userAgent, $ip, $expiresAt);

        return $plain;
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function serializeUser(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => (string) $row['email'],
            'full_name' => (string) $row['full_name'],
            'role' => (string) $row['role'],
            'preferred_lang' => (string) $row['preferred_lang'],
            'theme' => (string) $row['theme'],
        ];
    }
}
