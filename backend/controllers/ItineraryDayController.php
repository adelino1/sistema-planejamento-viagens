<?php
declare(strict_types=1);

final class ItineraryDayController
{
    public function __construct(
        private AuthService $auth,
        private ItineraryDayService $days,
    ) {
    }

    /**
     * @param array<string, string> $params
     */
    public function indexByTrip(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $tripId = (int) ($params['trip_id'] ?? 0);
        $this->send($this->days->listForTrip((int) $user['id'], $tripId));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, string> $params
     */
    public function store(array $input, array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $tripId = (int) ($params['trip_id'] ?? 0);
        $this->send($this->days->createForTrip((int) $user['id'], $tripId, $input));
    }

    /**
     * @param array<string, string> $params
     */
    public function show(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->days->showForUser((int) $user['id'], $id));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, string> $params
     */
    public function update(array $input, array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->days->updateForUser((int) $user['id'], $id, $input));
    }

    /**
     * @param array<string, string> $params
     */
    public function destroy(array $params): void
    {
        $user = $this->auth->requireAuthenticatedUser();
        $id = (int) ($params['id'] ?? 0);
        $this->send($this->days->deleteForUser((int) $user['id'], $id));
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
