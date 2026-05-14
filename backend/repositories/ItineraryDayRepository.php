<?php
declare(strict_types=1);

final class ItineraryDayRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function findByTripIdForUser(int $tripId, int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT d.id, d.trip_id, d.day_date, d.sort_order, d.notes, d.created_at, d.updated_at
             FROM itinerary_days d
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE d.trip_id = :trip_id AND t.user_id = :user_id
             ORDER BY d.day_date ASC, d.sort_order ASC, d.id ASC'
        );
        $stmt->execute(['trip_id' => $tripId, 'user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findByIdForUser(int $dayId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT d.id, d.trip_id, d.day_date, d.sort_order, d.notes, d.created_at, d.updated_at
             FROM itinerary_days d
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE d.id = :id AND t.user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute(['id' => $dayId, 'user_id' => $userId]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    /**
     * @return array<string, mixed>|null Trip bounds for validation
     */
    public function getTripBoundsForDay(int $tripId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT start_date, end_date FROM trips WHERE id = :id AND user_id = :user_id LIMIT 1'
        );
        $stmt->execute(['id' => $tripId, 'user_id' => $userId]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    /**
     * @param array{day_date: string, sort_order: int, notes: ?string} $data
     */
    public function create(int $tripId, array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO itinerary_days (trip_id, day_date, sort_order, notes)
             VALUES (:trip_id, :day_date, :sort_order, :notes)'
        );
        $stmt->execute([
            'trip_id' => $tripId,
            'day_date' => $data['day_date'],
            'sort_order' => $data['sort_order'],
            'notes' => $data['notes'],
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param array{day_date: string, sort_order: int, notes: ?string} $data
     */
    public function update(int $dayId, int $userId, array $data): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE itinerary_days d
             INNER JOIN trips t ON t.id = d.trip_id
             SET d.day_date = :day_date, d.sort_order = :sort_order, d.notes = :notes, d.updated_at = CURRENT_TIMESTAMP
             WHERE d.id = :id AND t.user_id = :user_id'
        );
        $stmt->execute([
            'id' => $dayId,
            'user_id' => $userId,
            'day_date' => $data['day_date'],
            'sort_order' => $data['sort_order'],
            'notes' => $data['notes'],
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete(int $dayId, int $userId): bool
    {
        $stmt = $this->pdo->prepare(
            'DELETE d FROM itinerary_days d
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE d.id = :id AND t.user_id = :user_id'
        );
        $stmt->execute(['id' => $dayId, 'user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }
}
