<?php
// backend/api/destinations.php

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
    
    $continentId = $_GET['continent'] ?? null;
    $search = $_GET['q'] ?? null;

    $query = "
        SELECT 
            d.id, d.name, d.description, d.average_cost as price, 
            d.cover_image as img, d.local_language as language, 
            d.local_currency as currency, d.best_time_to_visit as bestTime, 
            d.transport_tips as tips,
            c.name as country, c.code as country_code,
            co.name as continent
        FROM destinations d
        JOIN countries c ON d.country_id = c.id
        JOIN continents co ON c.continent_id = co.id
        WHERE 1=1
    ";

    $params = [];

    if ($continentId) {
        $query .= " AND co.id = ?";
        $params[] = $continentId;
    }

    if ($search) {
        $query .= " AND (d.name LIKE ? OR c.name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $destinations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    // Format fields appropriately for the frontend
    $formattedDestinations = array_map(function($d) {
        return [
            'id' => $d['id'],
            'name' => $d['name'],
            'country' => $d['country'],
            'continent' => $d['continent'],
            'img' => $d['img'],
            'price' => $d['price'],
            'description' => $d['description'],
            'language' => $d['language'],
            'currency' => $d['currency'],
            'bestTime' => $d['bestTime'],
            'tips' => $d['tips']
        ];
    }, $destinations);

    echo json_encode([
        "status" => "success",
        "data" => $formattedDestinations
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro ao buscar destinos.", "error" => $e->getMessage()]);
}
