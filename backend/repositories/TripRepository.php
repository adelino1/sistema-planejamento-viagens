<?php
declare(strict_types=1);

final class TripRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function findAllByUserId(int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, user_id, name, country, city, start_date, end_date, budget_amount, budget_currency,
                    description, status, created_at, updated_at
             FROM trips
             WHERE user_id = :user_id
             ORDER BY start_date DESC, id DESC'
        );
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findByIdForUser(int $tripId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, user_id, name, country, city, start_date, end_date, budget_amount, budget_currency,
                    description, status, created_at, updated_at
             FROM trips
             WHERE id = :id AND user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute(['id' => $tripId, 'user_id' => $userId]);
        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    /**
     * @param array{name: string, country: string, city: string, start_date: string, end_date: string, budget_amount: float|string, budget_currency: string, description: ?string, status: string} $data
     */
    public function create(int $userId, array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO trips (user_id, name, country, city, start_date, end_date, budget_amount, budget_currency, description, status)
             VALUES (:user_id, :name, :country, :city, :start_date, :end_date, :budget_amount, :budget_currency, :description, :status)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'name' => $data['name'],
            'country' => $data['country'],
            'city' => $data['city'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'budget_amount' => $data['budget_amount'],
            'budget_currency' => $data['budget_currency'],
            'description' => $data['description'],
            'status' => $data['status'],
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(int $tripId, int $userId, array $data): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE trips SET
                name = :name,
                country = :country,
                city = :city,
                start_date = :start_date,
                end_date = :end_date,
                budget_amount = :budget_amount,
                budget_currency = :budget_currency,
                description = :description,
                status = :status,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = :id AND user_id = :user_id'
        );
        $stmt->execute([
            'id' => $tripId,
            'user_id' => $userId,
            'name' => $data['name'],
            'country' => $data['country'],
            'city' => $data['city'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'budget_amount' => $data['budget_amount'],
            'budget_currency' => $data['budget_currency'],
            'description' => $data['description'],
            'status' => $data['status'],
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete(int $tripId, int $userId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM trips WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $tripId, 'user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }
}
