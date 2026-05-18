<?php
require_once __DIR__ . '/../src/Utils/Database.php';

use App\Utils\Database;

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(str_replace('/sistema-planejamento-viagens/backend/api', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)), '/'));
$id = $pathParts[1] ?? null;

$db = Database::getConnection();

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single trip
            $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
            $stmt->execute([$id]);
            $trip = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($trip) {
                echo json_encode(['status' => 'success', 'data' => $trip]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Viagem não encontrada.']);
            }
        } else {
            // Get all trips
            // MOCK User ID 1 for now until auth is fully implemented
            $stmt = $db->prepare("SELECT * FROM trips WHERE user_id = 1 ORDER BY start_date ASC");
            $stmt->execute();
            $trips = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $trips]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['title']) || !isset($data['destination'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Dados inválidos. Titulo e destino são obrigatórios.']);
            exit;
        }
        
        $stmt = $db->prepare("INSERT INTO trips (user_id, title, destination, start_date, end_date, budget_aoa, cover_image) VALUES (1, ?, ?, ?, ?, ?, ?)");
        try {
            $stmt->execute([
                $data['title'],
                $data['destination'],
                $data['start_date'] ?? date('Y-m-d'),
                $data['end_date'] ?? date('Y-m-d', strtotime('+7 days')),
                $data['budget_aoa'] ?? 0,
                $data['cover_image'] ?? null
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Viagem criada com sucesso.', 'id' => $db->lastInsertId()]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro ao criar viagem.', 'error' => $e->getMessage()]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
        break;
}
