<?php
// backend/api/destination_detail.php

require_once __DIR__ . '/../src/Utils/Database.php';

use App\Utils\Database;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $conn = Database::getConnection();
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID do destino não fornecido."]);
        exit;
    }

    // Get basic destination data
    $query = "
        SELECT 
            d.*,
            c.name as country, c.code as country_code,
            co.name as continent
        FROM destinations d
        JOIN countries c ON d.country_id = c.id
        JOIN continents co ON c.continent_id = co.id
        WHERE d.id = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    $destination = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$destination) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Destino não encontrado."]);
        exit;
    }

    // Get Hotels (mock integration since we didn't populate them in mock_data.sql yet, let's just fetch if they exist)
    $stmtHotels = $conn->prepare("SELECT * FROM hotels WHERE destination_id = ?");
    $stmtHotels->execute([$id]);
    $hotels = $stmtHotels->fetchAll(\PDO::FETCH_ASSOC);

    // Get Restaurants
    $stmtRest = $conn->prepare("SELECT * FROM restaurants WHERE destination_id = ?");
    $stmtRest->execute([$id]);
    $restaurants = $stmtRest->fetchAll(\PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "info" => $destination,
            "hotels" => $hotels,
            "restaurants" => $restaurants
        ]
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro interno.", "error" => $e->getMessage()]);
}
