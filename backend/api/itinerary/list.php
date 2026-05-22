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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $trips = $stmt->fetchAll();

    // Format for Angular frontend compatibility
    $formattedTrips = array_map(function($trip) {
        return [
            'id' => (int)$trip['id'],
            'userId' => (int)$trip['user_id'],
            'destination' => $trip['destination'],
            'country' => '...', // Could map from DB or frontend
            'countryCode' => 'UN',
            'flag' => '🌍',
            'startDate' => $trip['start_date'] ?? date('Y-m-d'),
            'endDate' => $trip['end_date'] ?? date('Y-m-d', strtotime('+7 days')),
            'description' => $trip['title'],
            'budget' => 0,
            'currency' => 'USD',
            'status' => 'planned',
            'coverImage' => $trip['cover_image'] ?? 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop',
            'isFavorite' => false,
            'participants' => 1,
            'activities' => [],
            'lat' => 0,
            'lon' => 0,
            'createdAt' => $trip['created_at'],
            'updatedAt' => $trip['updated_at']
        ];
    }, $trips);

    echo json_encode(["trips" => $formattedTrips]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch trips: " . $e->getMessage()]);
}
?>
