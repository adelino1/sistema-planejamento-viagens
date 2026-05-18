<?php
require_once __DIR__ . '/../src/Utils/Database.php';

use App\Utils\Database;

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(str_replace('/sistema-planejamento-viagens/backend/api', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)), '/'));
$trip_id = $_GET['trip_id'] ?? null;

$db = Database::getConnection();

switch ($method) {
    case 'GET':
        if ($trip_id) {
            $stmt = $db->prepare("
                SELECT e.*, u.name as payer_name 
                FROM expenses e 
                LEFT JOIN users u ON e.payer_user_id = u.id 
                WHERE e.trip_id = ? 
                ORDER BY e.date DESC
            ");
            $stmt->execute([$trip_id]);
            $expenses = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Calculo do total do orçamento
            $stmtTotal = $db->prepare("SELECT budget_aoa FROM trips WHERE id = ?");
            $stmtTotal->execute([$trip_id]);
            $budget = $stmtTotal->fetchColumn() ?: 0;
            
            $totalSpent = array_sum(array_column($expenses, 'amount_aoa'));
            
            echo json_encode([
                'status' => 'success', 
                'data' => [
                    'expenses' => $expenses,
                    'summary' => [
                        'budget_aoa' => $budget,
                        'total_spent_aoa' => $totalSpent,
                        'remaining_aoa' => $budget - $totalSpent
                    ]
                ]
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID da viagem não fornecido.']);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['trip_id']) || !isset($data['amount_aoa']) || !isset($data['description'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Dados inválidos.']);
            exit;
        }
        
        $payer_id = $data['payer_user_id'] ?? 1; // MOCK User 1
        
        $stmt = $db->prepare("
            INSERT INTO expenses (trip_id, payer_user_id, description, amount_aoa, original_amount, original_currency, date, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        try {
            $stmt->execute([
                $data['trip_id'],
                $payer_id,
                $data['description'],
                $data['amount_aoa'],
                $data['original_amount'] ?? $data['amount_aoa'],
                $data['original_currency'] ?? 'AOA',
                $data['date'] ?? date('Y-m-d'),
                $data['category'] ?? 'other'
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Despesa registada com sucesso.', 'id' => $db->lastInsertId()]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro ao registar despesa.', 'error' => $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
        break;
}
