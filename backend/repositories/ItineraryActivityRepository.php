<?php
declare(strict_types=1);

final class ItineraryActivityRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function findByDayIdForUser(int $dayId, int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT a.id, a.day_id, a.title, a.location_name, a.start_time, a.end_time, a.sort_order, a.notes, a.created_at, a.updated_at
             FROM itinerary_activities a
             INNER JOIN itinerary_days d ON d.id = a.day_id
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE a.day_id = :day_id AND t.user_id = :user_id
             ORDER BY a.sort_order ASC, a.start_time ASC, a.id ASC'
        );
        $stmt->execute(['day_id' => $dayId, 'user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findByIdForUser(int $activityId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT a.id, a.day_id, a.title, a.location_name, a.start_time, a.end_time, a.sort_order, a.notes, a.created_at, a.updated_at
             FROM itinerary_activities a
             INNER JOIN itinerary_days d ON d.id = a.day_id
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE a.id = :id AND t.user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute(['id' => $activityId, 'user_id' => $userId]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    /**
     * @param array{title: string, location_name: ?string, start_time: ?string, end_time: ?string, sort_order: int, notes: ?string} $data
     */
    public function create(int $dayId, array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO itinerary_activities (day_id, title, location_name, start_time, end_time, sort_order, notes)
             VALUES (:day_id, :title, :location_name, :start_time, :end_time, :sort_order, :notes)'
        );
        $stmt->execute([
            'day_id' => $dayId,
            'title' => $data['title'],
            'location_name' => $data['location_name'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'sort_order' => $data['sort_order'],
            'notes' => $data['notes'],
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param array{title: string, location_name: ?string, start_time: ?string, end_time: ?string, sort_order: int, notes: ?string} $data
     */
    public function update(int $activityId, int $userId, array $data): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE itinerary_activities a
             INNER JOIN itinerary_days d ON d.id = a.day_id
             INNER JOIN trips t ON t.id = d.trip_id
             SET a.title = :title, a.location_name = :location_name, a.start_time = :start_time,
                 a.end_time = :end_time, a.sort_order = :sort_order, a.notes = :notes, a.updated_at = CURRENT_TIMESTAMP
             WHERE a.id = :id AND t.user_id = :user_id'
        );
        $stmt->execute([
            'id' => $activityId,
            'user_id' => $userId,
            'title' => $data['title'],
            'location_name' => $data['location_name'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'sort_order' => $data['sort_order'],
            'notes' => $data['notes'],
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete(int $activityId, int $userId): bool
    {
        $stmt = $this->pdo->prepare(
            'DELETE a FROM itinerary_activities a
             INNER JOIN itinerary_days d ON d.id = a.day_id
             INNER JOIN trips t ON t.id = d.trip_id
             WHERE a.id = :id AND t.user_id = :user_id'
        );
        $stmt->execute(['id' => $activityId, 'user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }
}
