<?php
require_once '../cors.php';
require_once '../db.php';

// Simple middleware to check token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$token = $matches[1];
$payload = json_decode(base64_decode($token), true);

if (!$payload || !isset($payload['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$userId = $payload['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['destination']) || !isset($data['days'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid trip data format"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert Trip
    $stmt = $pdo->prepare("INSERT INTO trips (user_id, title, destination, start_date, end_date) VALUES (?, ?, ?, ?, ?)");
    $title = "Viagem para " . $data['destination'];
    $startDate = isset($data['startDate']) ? $data['startDate'] : null;
    $endDate = isset($data['endDate']) ? $data['endDate'] : null;
    
    $stmt->execute([$userId, $title, $data['destination'], $startDate, $endDate]);
    $tripId = $pdo->lastInsertId();

    // 2. Insert Days and Items
    if (is_array($data['days'])) {
        foreach ($data['days'] as $dayIndex => $day) {
            $dayDate = isset($day['date']) ? $day['date'] : date('Y-m-d', strtotime("+$dayIndex days"));
            
            $stmtDay = $pdo->prepare("INSERT INTO trip_days (trip_id, day_date, day_index) VALUES (?, ?, ?)");
            $stmtDay->execute([$tripId, $dayDate, $dayIndex + 1]);
            $dayId = $pdo->lastInsertId();

            if (isset($day['items']) && is_array($day['items'])) {
                foreach ($day['items'] as $itemIndex => $item) {
                    $stmtItem = $pdo->prepare("INSERT INTO trip_items (trip_day_id, title, category, location_lat, location_lng, order_index) VALUES (?, ?, ?, ?, ?, ?)");
                    $title = isset($item['title']) ? $item['title'] : 'Atividade';
                    $category = isset($item['category']) ? $item['category'] : 'custom';
                    $lat = isset($item['lat']) ? $item['lat'] : null;
                    $lng = isset($item['lng']) ? $item['lng'] : null;
                    
                    $stmtItem->execute([$dayId, $title, $category, $lat, $lng, $itemIndex + 1]);
                }
            }
        }
    }

    $pdo->commit();

    echo json_encode([
        "message" => "Trip synchronized successfully",
        "trip_id" => $tripId
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Failed to synchronize trip: " . $e->getMessage()]);
}
?>
