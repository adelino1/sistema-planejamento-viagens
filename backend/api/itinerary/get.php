<?php
require_once '../cors.php';
require_once '../db.php';

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

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Trip ID required"]);
    exit;
}

$tripId = (int)$_GET['id'];

try {
    // Check if trip belongs to user
    $stmt = $pdo->prepare("SELECT * FROM trips WHERE id = ? AND user_id = ?");
    $stmt->execute([$tripId, $userId]);
    $trip = $stmt->fetch();

    if (!$trip) {
        http_response_code(404);
        echo json_encode(["error" => "Trip not found or access denied"]);
        exit;
    }

    // Fetch Days
    $stmtDays = $pdo->prepare("SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_index ASC");
    $stmtDays->execute([$tripId]);
    $days = $stmtDays->fetchAll();

    // Fetch Items for all days
    $stmtItems = $pdo->prepare("SELECT i.* FROM trip_items i JOIN trip_days d ON i.trip_day_id = d.id WHERE d.trip_id = ? ORDER BY d.day_index, i.order_index ASC");
    $stmtItems->execute([$tripId]);
    $allItems = $stmtItems->fetchAll();

    // Organize items into days
    $daysArray = [];
    foreach ($days as $day) {
        $dayItems = [];
        foreach ($allItems as $item) {
            if ($item['trip_day_id'] === $day['id']) {
                $dayItems[] = [
                    'id' => $item['id'],
                    'title' => $item['title'],
                    'category' => $item['category'],
                    'startTime' => $item['start_time'],
                    'lat' => $item['location_lat'],
                    'lng' => $item['location_lng'],
                    'cost' => $item['cost_estimate'],
                    'notes' => $item['notes']
                ];
            }
        }
        $daysArray[] = [
            'id' => $day['id'],
            'date' => $day['day_date'],
            'index' => $day['day_index'],
            'items' => $dayItems
        ];
    }

    echo json_encode([
        "trip" => [
            'id' => (int)$trip['id'],
            'userId' => (int)$trip['user_id'],
            'destination' => $trip['destination'],
            'title' => $trip['title'],
            'startDate' => $trip['start_date'],
            'endDate' => $trip['end_date'],
            'coverImage' => $trip['cover_image'],
            'days' => $daysArray
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch trip details"]);
}
?>
