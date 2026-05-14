<?php
declare(strict_types=1);

final class ItineraryActivityController
{
    public function __construct(
        private AuthService $auth,
        private ItineraryActivityService $activities,
    ) {
    }

    /**
     * @param array<string, string> $params
     */
    public function indexByDay(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $dayId = (int) ($params['day_id'] ?? 0);
        $this->send($this->activities->listForDay((int) $user['id'], $dayId));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, string> $params
     */
    public function store(array $input, array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $dayId = (int) ($params['day_id'] ?? 0);
        $this->send($this->activities->createForDay((int) $user['id'], $dayId, $input));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, string> $params
     */
    public function update(array $input, array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->activities->updateForUser((int) $user['id'], $id, $input));
    }

    /**
     * @param array<string, string> $params
     */
    public function destroy(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->activities->deleteForUser((int) $user['id'], $id));
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
