<?php
declare(strict_types=1);

final class AuthController
{
    public function __construct(private AuthService $authService)
    {
    }

    public function register(array $input): void
    {
        $this->send($this->authService->register($input));
    }

    public function login(array $input): void
    {
        $this->send($this->authService->login($input));
    }

    public function logout(): void
    {
        $this->send($this->authService->logout());
    }

    public function me(): void
    {
        $this->send($this->authService->me());
    }

    public function forgotPassword(array $input): void
    {
        $this->send($this->authService->requestPasswordReset($input));
    }

    public function resetPassword(array $input): void
    {
        $this->send($this->authService->resetPassword($input));
    }

    /**
     * @param array{ok: bool, message?: string, errors?: array<int|string, string>, status?: int, data?: array<string, mixed>} $result
     */
    private function send(array $result): void
    {
        if (($result['ok'] ?? false) === true) {
            successResponse($result['data'] ?? [], (string) ($result['message'] ?? 'Success'), (int) ($result['status'] ?? 200));
            return;
        }

        errorResponse(
            (string) ($result['message'] ?? 'Error'),
            $result['errors'] ?? [],
            (int) ($result['status'] ?? 400)
        );
    }
}
