<?php
declare(strict_types=1);

require_once __DIR__ . '/../exceptions/HttpException.php';

final class TripService
{
    private const STATUSES = ['draft', 'planned', 'ongoing', 'completed', 'cancelled'];

    public function __construct(
        private TripRepository $trips,
        private ItineraryDayRepository $days,
        private ItineraryActivityRepository $activities,
    ) {
    }

    /**
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function listForUser(int $userId): array
    {
        $rows = $this->trips->findAllByUserId($userId);

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => ['trips' => array_map([$this, 'formatTrip'], $rows)],
            'status' => 200,
        ];
    }

    /**
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function getDetailForUser(int $userId, int $tripId): array
    {
        $trip = $this->trips->findByIdForUser($tripId, $userId);
        if ($trip === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        $dayRows = $this->days->findByTripIdForUser($tripId, $userId);
        $daysOut = [];
        foreach ($dayRows as $day) {
            $acts = $this->activities->findByDayIdForUser((int) $day['id'], $userId);
            $daysOut[] = [
                'day' => $this->formatDay($day),
                'activities' => array_map([$this, 'formatActivity'], $acts),
            ];
        }

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => [
                'trip' => $this->formatTrip($trip),
                'itinerary_days' => $daysOut,
            ],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function createForUser(int $userId, array $input): array
    {
        $data = $this->normalizeTripInput($input);
        $this->assertDateOrder($data['start_date'], $data['end_date']);

        $id = $this->trips->create($userId, $data);
        $trip = $this->trips->findByIdForUser($id, $userId);
        if ($trip === null) {
            throw new HttpException('Erro ao criar viagem.', 500, ['create_failed']);
        }

        return [
            'ok' => true,
            'message' => 'Viagem criada.',
            'data' => ['trip' => $this->formatTrip($trip)],
            'status' => 201,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function updateForUser(int $userId, int $tripId, array $input): array
    {
        if ($this->trips->findByIdForUser($tripId, $userId) === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        $data = $this->normalizeTripInput($input);
        $this->assertDateOrder($data['start_date'], $data['end_date']);

        if (!$this->trips->update($tripId, $userId, $data)) {
            throw new HttpException('Não foi possível atualizar.', 400, ['update_failed']);
        }

        $trip = $this->trips->findByIdForUser($tripId, $userId);
        if ($trip === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        return [
            'ok' => true,
            'message' => 'Viagem atualizada.',
            'data' => ['trip' => $this->formatTrip($trip)],
            'status' => 200,
        ];
    }

    public function deleteForUser(int $userId, int $tripId): array
    {
        if (!$this->trips->delete($tripId, $userId)) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        return [
            'ok' => true,
            'message' => 'Viagem eliminada.',
            'data' => [],
            'status' => 200,
        ];
    }

    private function assertDateOrder(string $start, string $end): void
    {
        if ($start > $end) {
            throw new HttpException('Datas inválidas.', 422, ['end_date must be on or after start_date']);
        }
    }

    /**
     * @param array<string, mixed> $input
     * @return array{name: string, country: string, city: string, start_date: string, end_date: string, budget_amount: string, budget_currency: string, description: ?string, status: string}
     */
    private function normalizeTripInput(array $input): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $country = trim((string) ($input['country'] ?? ''));
        $city = trim((string) ($input['city'] ?? ''));
        $start = trim((string) ($input['start_date'] ?? ''));
        $end = trim((string) ($input['end_date'] ?? ''));
        $budget = $input['budget_amount'] ?? 0;
        $currency = strtoupper(trim((string) ($input['budget_currency'] ?? 'EUR')));
        if (strlen($currency) !== 3) {
            $currency = 'EUR';
        }
        $description = isset($input['description']) ? (trim((string) $input['description']) ?: null) : null;
        $status = trim((string) ($input['status'] ?? 'draft'));
        if (!in_array($status, self::STATUSES, true)) {
            $status = 'draft';
        }

        if ($name === '' || $country === '' || $city === '' || $start === '' || $end === '') {
            throw new HttpException('Campos obrigatórios em falta.', 422, ['name, country, city, start_date, end_date are required']);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $end)) {
            throw new HttpException('Formato de data inválido (use YYYY-MM-DD).', 422, ['invalid_date_format']);
        }

        $budgetAmount = is_numeric($budget) ? number_format((float) $budget, 2, '.', '') : '0.00';

        return [
            'name' => $name,
            'country' => $country,
            'city' => $city,
            'start_date' => $start,
            'end_date' => $end,
            'budget_amount' => $budgetAmount,
            'budget_currency' => $currency,
            'description' => $description,
            'status' => $status,
        ];
    }

    /**
     * @param array<string, mixed> $row
     */
    private function formatTrip(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'user_id' => (int) $row['user_id'],
            'name' => (string) $row['name'],
            'country' => (string) $row['country'],
            'city' => (string) $row['city'],
            'start_date' => (string) $row['start_date'],
            'end_date' => (string) $row['end_date'],
            'budget_amount' => (string) $row['budget_amount'],
            'budget_currency' => (string) $row['budget_currency'],
            'description' => $row['description'],
            'status' => (string) $row['status'],
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
        ];
    }

    /**
     * @param array<string, mixed> $row
     */
    private function formatDay(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'trip_id' => (int) $row['trip_id'],
            'day_date' => (string) $row['day_date'],
            'sort_order' => (int) $row['sort_order'],
            'notes' => $row['notes'],
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
        ];
    }

    /**
     * @param array<string, mixed> $row
     */
    private function formatActivity(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'day_id' => (int) $row['day_id'],
            'title' => (string) $row['title'],
            'location_name' => $row['location_name'],
            'start_time' => $row['start_time'],
            'end_time' => $row['end_time'],
            'sort_order' => (int) $row['sort_order'],
            'notes' => $row['notes'],
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
        ];
    }
}
