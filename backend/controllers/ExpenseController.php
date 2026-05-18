<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\ExpenseService;
use App\Exceptions\HttpException;

/**
 * CRUD de Despesas (Expenses).
 * Requer autenticação Bearer e ownership de viagem.
 */
class ExpenseController
{
    private ExpenseService $service;

    public function __construct()
    {
        $this->service = new ExpenseService();
    }

    /**
     * GET /api/v1/trips/{trip_id}/expenses
     * Lista despesas de uma viagem.
     */
    public function indexByTrip(): void
    {
        $tripId = (int) ($_GET['trip_id'] ?? 0);
        if (!$tripId) {
            throw new HttpException('trip_id required', 400);
        }

        $userId = $_SESSION['user_id'] ?? null;
        $expenses = $this->service->getExpensesByTrip($tripId, $userId);

        echo json_encode(['data' => $expenses, 'count' => count($expenses)]);
    }

    /**
     * POST /api/v1/trips/{trip_id}/expenses
     * Cria nova despesa.
     */
    public function store(): void
    {
        $tripId = (int) ($_GET['trip_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!$tripId) {
            throw new HttpException('trip_id required', 400);
        }

        $expense = $this->service->createExpense(
            $tripId,
            $userId,
            $body['category'] ?? '',
            (float) ($body['amount'] ?? 0),
            $body['currency'] ?? 'EUR',
            $body['description'] ?? null,
            $body['expense_date'] ?? date('Y-m-d'),
            (bool) ($body['is_estimated'] ?? true)
        );

        http_response_code(201);
        echo json_encode(['data' => $expense]);
    }

    /**
     * GET /api/v1/expenses/{id}
     */
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        $expense = $this->service->getExpense($id, $userId);
        echo json_encode(['data' => $expense]);
    }

    /**
     * PUT /api/v1/expenses/{id}
     */
    public function update(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $expense = $this->service->updateExpense($id, $userId, $body);
        echo json_encode(['data' => $expense]);
    }

    /**
     * DELETE /api/v1/expenses/{id}
     */
    public function destroy(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        $this->service->deleteExpense($id, $userId);
        echo json_encode(['message' => 'Expense deleted']);
    }
}
