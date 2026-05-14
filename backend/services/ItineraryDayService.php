<?php
declare(strict_types=1);

require_once __DIR__ . '/../exceptions/HttpException.php';

final class ItineraryDayService
{
    public function __construct(
        private ItineraryDayRepository $days,
        private TripRepository $trips,
    ) {
    }

    /**
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function listForTrip(int $userId, int $tripId): array
    {
        if ($this->trips->findByIdForUser($tripId, $userId) === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        $rows = $this->days->findByTripIdForUser($tripId, $userId);

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => ['itinerary_days' => array_map(static fn (array $r): array => [
                'id' => (int) $r['id'],
                'trip_id' => (int) $r['trip_id'],
                'day_date' => (string) $r['day_date'],
                'sort_order' => (int) $r['sort_order'],
                'notes' => $r['notes'],
                'created_at' => (string) $r['created_at'],
                'updated_at' => (string) $r['updated_at'],
            ], $rows)],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function createForTrip(int $userId, int $tripId, array $input): array
    {
        $bounds = $this->days->getTripBoundsForDay($tripId, $userId);
        if ($bounds === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        $data = $this->normalizeDayInput($input);
        $this->assertDayInBounds($data['day_date'], (string) $bounds['start_date'], (string) $bounds['end_date']);

        try {
            $id = $this->days->create($tripId, $data);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'Duplicate')) {
                throw new HttpException('Já existe um dia com esta data nesta viagem.', 409, ['duplicate_day']);
            }
            throw $e;
        }

        $row = $this->days->findByIdForUser($id, $userId);
        if ($row === null) {
            throw new HttpException('Erro ao criar dia.', 500, ['create_failed']);
        }

        return [
            'ok' => true,
            'message' => 'Dia adicionado ao itinerário.',
            'data' => ['itinerary_day' => $this->formatDay($row)],
            'status' => 201,
        ];
    }

    /**
     * @param array<string, mixed> $input
     */
    public function updateForUser(int $userId, int $dayId, array $input): array
    {
        $existing = $this->days->findByIdForUser($dayId, $userId);
        if ($existing === null) {
            throw new HttpException('Dia não encontrado.', 404, ['not_found']);
        }

        $bounds = $this->days->getTripBoundsForDay((int) $existing['trip_id'], $userId);
        if ($bounds === null) {
            throw new HttpException('Viagem não encontrada.', 404, ['not_found']);
        }

        $data = $this->normalizeDayInput($input);
        $this->assertDayInBounds($data['day_date'], (string) $bounds['start_date'], (string) $bounds['end_date']);

        try {
            if (!$this->days->update($dayId, $userId, $data)) {
                throw new HttpException('Não foi possível atualizar.', 400, ['update_failed']);
            }
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'Duplicate')) {
                throw new HttpException('Já existe um dia com esta data nesta viagem.', 409, ['duplicate_day']);
            }
            throw $e;
        }

        $row = $this->days->findByIdForUser($dayId, $userId);

        return [
            'ok' => true,
            'message' => 'Dia atualizado.',
            'data' => ['itinerary_day' => $this->formatDay($row ?? [])],
            'status' => 200,
        ];
    }

    public function deleteForUser(int $userId, int $dayId): array
    {
        if (!$this->days->delete($dayId, $userId)) {
            throw new HttpException('Dia não encontrado.', 404, ['not_found']);
        }

        return [
            'ok' => true,
            'message' => 'Dia eliminado.',
            'data' => [],
            'status' => 200,
        ];
    }

    public function showForUser(int $userId, int $dayId): array
    {
        $row = $this->days->findByIdForUser($dayId, $userId);
        if ($row === null) {
            throw new HttpException('Dia não encontrado.', 404, ['not_found']);
        }

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => ['itinerary_day' => $this->formatDay($row)],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{day_date: string, sort_order: int, notes: ?string}
     */
    private function normalizeDayInput(array $input): array
    {
        $dayDate = trim((string) ($input['day_date'] ?? ''));
        if ($dayDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dayDate)) {
            throw new HttpException('day_date inválido (YYYY-MM-DD).', 422, ['invalid day_date']);
        }

        $sort = (int) ($input['sort_order'] ?? 0);
        $notes = isset($input['notes']) ? (trim((string) $input['notes']) ?: null) : null;

        return [
            'day_date' => $dayDate,
            'sort_order' => max(0, $sort),
            'notes' => $notes,
        ];
    }

    private function assertDayInBounds(string $dayDate, string $start, string $end): void
    {
        if ($dayDate < $start || $dayDate > $end) {
            throw new HttpException('A data do dia tem de estar dentro do intervalo da viagem.', 422, ['day_outside_trip_range']);
        }
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
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
}
