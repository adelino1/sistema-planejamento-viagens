<?php
declare(strict_types=1);

namespace App\Repositories;

class ExpenseRepository
{
    /**
     * Verifica se o utilizador é dono da viagem.
     */
    public function isUserTripOwner(int $tripId, int $userId): bool
    {
        global $db;
        $stmt = $db->prepare('SELECT 1 FROM trips WHERE id = ? AND user_id = ?');
        $stmt->execute([$tripId, $userId]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Verifica se o utilizador é dono da despesa.
     */
    public function isUserExpenseOwner(int $expenseId, int $userId): bool
    {
        global $db;
        $stmt = $db->prepare('
            SELECT 1 FROM expenses e
            JOIN trips t ON e.trip_id = t.id
            WHERE e.id = ? AND t.user_id = ?
        ');
        $stmt->execute([$expenseId, $userId]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Lista despesas de uma viagem.
     */
    public function getByTrip(int $tripId): array
    {
        global $db;
        $stmt = $db->prepare('
            SELECT id, trip_id, category, amount, currency, description, expense_date, is_estimated, created_at, updated_at
            FROM expenses
            WHERE trip_id = ?
            ORDER BY expense_date DESC
        ');
        $stmt->execute([$tripId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Cria despesa.
     */
    public function create(
        int $tripId,
        string $category,
        float $amount,
        string $currency,
        ?string $description,
        string $expenseDate,
        bool $isEstimated
    ): array {
        global $db;
        $stmt = $db->prepare('
            INSERT INTO expenses (trip_id, category, amount, currency, description, expense_date, is_estimated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $tripId,
            $category,
            $amount,
            $currency,
            $description,
            $expenseDate,
            (int) $isEstimated,
        ]);

        return $this->find((int) $db->lastInsertId());
    }

    /**
     * Obtém despesa por ID.
     */
    public function find(int $id): array
    {
        global $db;
        $stmt = $db->prepare('
            SELECT id, trip_id, category, amount, currency, description, expense_date, is_estimated, created_at, updated_at
            FROM expenses
            WHERE id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Atualiza despesa.
     */
    public function update(int $id, array $data): array
    {
        global $db;

        $allowed = ['category', 'amount', 'currency', 'description', 'expense_date', 'is_estimated'];
        $updates = [];
        $values = [];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = ?";
                $values[] = $field === 'is_estimated' ? (int) $data[$field] : $data[$field];
            }
        }

        if (empty($updates)) {
            return $this->find($id);
        }

        $values[] = $id;
        $query = 'UPDATE expenses SET ' . implode(', ', $updates) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';

        $stmt = $db->prepare($query);
        $stmt->execute($values);

        return $this->find($id);
    }

    /**
     * Elimina despesa.
     */
    public function delete(int $id): void
    {
        global $db;
        $stmt = $db->prepare('DELETE FROM expenses WHERE id = ?');
        $stmt->execute([$id]);
    }
}
