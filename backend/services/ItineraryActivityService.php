<?php
declare(strict_types=1);

require_once __DIR__ . '/../exceptions/HttpException.php';

final class ItineraryActivityService
{
    public function __construct(
        private ItineraryActivityRepository $activities,
        private ItineraryDayRepository $days,
    ) {
    }

    /**
     * @return array{ok: true, message: string, data: array<string, mixed>, status: int}
     */
    public function listForDay(int $userId, int $dayId): array
    {
        if ($this->days->findByIdForUser($dayId, $userId) === null) {
            throw new HttpException('Dia não encontrado.', 404, ['not_found']);
        }

        $rows = $this->activities->findByDayIdForUser($dayId, $userId);

        return [
            'ok' => true,
            'message' => 'OK',
            'data' => ['activities' => array_map([$this, 'formatActivity'], $rows)],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     */
    public function createForDay(int $userId, int $dayId, array $input): array
    {
        if ($this->days->findByIdForUser($dayId, $userId) === null) {
            throw new HttpException('Dia não encontrado.', 404, ['not_found']);
        }

        $data = $this->normalizeActivityInput($input);
        $id = $this->activities->create($dayId, $data);
        $row = $this->activities->findByIdForUser($id, $userId);
        if ($row === null) {
            throw new HttpException('Erro ao criar atividade.', 500, ['create_failed']);
        }

        return [
            'ok' => true,
            'message' => 'Atividade criada.',
            'data' => ['activity' => $this->formatActivity($row)],
            'status' => 201,
        ];
    }

    /**
     * @param array<string, mixed> $input
     */
    public function updateForUser(int $userId, int $activityId, array $input): array
    {
        if ($this->activities->findByIdForUser($activityId, $userId) === null) {
            throw new HttpException('Atividade não encontrada.', 404, ['not_found']);
        }

        $data = $this->normalizeActivityInput($input);
        if (!$this->activities->update($activityId, $userId, $data)) {
            throw new HttpException('Não foi possível atualizar.', 400, ['update_failed']);
        }

        $row = $this->activities->findByIdForUser($activityId, $userId);

        return [
            'ok' => true,
            'message' => 'Atividade atualizada.',
            'data' => ['activity' => $this->formatActivity($row ?? [])],
            'status' => 200,
        ];
    }

    public function deleteForUser(int $userId, int $activityId): array
    {
        if (!$this->activities->delete($activityId, $userId)) {
            throw new HttpException('Atividade não encontrada.', 404, ['not_found']);
        }

        return [
            'ok' => true,
            'message' => 'Atividade eliminada.',
            'data' => [],
            'status' => 200,
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{title: string, location_name: ?string, start_time: ?string, end_time: ?string, sort_order: int, notes: ?string}
     */
    private function normalizeActivityInput(array $input): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        if ($title === '') {
            throw new HttpException('O título da atividade é obrigatório.', 422, ['title required']);
        }

        $loc = trim((string) ($input['location_name'] ?? ''));
        $locationName = $loc !== '' ? $loc : null;

        $st = trim((string) ($input['start_time'] ?? ''));
        $en = trim((string) ($input['end_time'] ?? ''));
        $startTime = $st !== '' ? $st : null;
        $endTime = $en !== '' ? $en : null;

        if ($startTime !== null && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $startTime)) {
            throw new HttpException('start_time inválido (HH:MM ou HH:MM:SS).', 422, ['invalid start_time']);
        }
        if ($endTime !== null && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $endTime)) {
            throw new HttpException('end_time inválido.', 422, ['invalid end_time']);
        }

        $sort = max(0, (int) ($input['sort_order'] ?? 0));
        $notes = isset($input['notes']) ? (trim((string) $input['notes']) ?: null) : null;

        return [
            'title' => $title,
            'location_name' => $locationName,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'sort_order' => $sort,
            'notes' => $notes,
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
