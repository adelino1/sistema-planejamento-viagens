<?php
declare(strict_types=1);

final class TripController
{
    public function __construct(
        private AuthService $auth,
        private TripService $trips,
    ) {
    }

    public function index(): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $this->send($this->trips->listForUser((int) $user['id']));
    }

    /**
     * @param array<string, string> $params
     */
    public function show(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->trips->getDetailForUser((int) $user['id'], $id));
    }

    public function store(array $input): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $this->send($this->trips->createForUser((int) $user['id'], $input));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, string> $params
     */
    public function update(array $input, array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->trips->updateForUser((int) $user['id'], $id, $input));
    }

    /**
     * @param array<string, string> $params
     */
    public function destroy(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->trips->deleteForUser((int) $user['id'], $id));
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
