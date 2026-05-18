<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\ExpenseRepository;
use App\Exceptions\HttpException;

class ExpenseService
{
    private ExpenseRepository $repo;

    public function __construct()
    {
        $this->repo = new ExpenseRepository();
    }

    /**
     * Obtém despesas de uma viagem (verificando ownership).
     */
    public function getExpensesByTrip(int $tripId, ?int $userId): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        // Verificar se o utilizador é dono da viagem
        $isOwner = $this->repo->isUserTripOwner($tripId, $userId);
        if (!$isOwner) {
            throw new HttpException('Forbidden', 403);
        }

        return $this->repo->getByTrip($tripId);
    }

    /**
     * Cria nova despesa.
     */
    public function createExpense(
        int $tripId,
        ?int $userId,
        string $category,
        float $amount,
        string $currency,
        ?string $description,
        string $expenseDate,
        bool $isEstimated
    ): array {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserTripOwner($tripId, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        if (empty($category) || $amount < 0) {
            throw new HttpException('Invalid expense data', 400);
        }

        return $this->repo->create($tripId, $category, $amount, $currency, $description, $expenseDate, $isEstimated);
    }

    /**
     * Obtém uma despesa.
     */
    public function getExpense(int $id, ?int $userId): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $expense = $this->repo->find($id);
        if (!$expense) {
            throw new HttpException('Expense not found', 404);
        }

        if (!$this->repo->isUserExpenseOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        return $expense;
    }

    /**
     * Atualiza despesa.
     */
    public function updateExpense(int $id, ?int $userId, array $data): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserExpenseOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        return $this->repo->update($id, $data);
    }

    /**
     * Elimina despesa.
     */
    public function deleteExpense(int $id, ?int $userId): void
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserExpenseOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        $this->repo->delete($id);
    }
}
