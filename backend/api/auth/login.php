<?php
require_once '../cors.php';
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing credentials"]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $token = base64_encode(json_encode(["user_id" => $user['id'], "email" => $user['email'], "time" => time()]));
    
    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email']
        ],
        "token" => $token
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
}
?>
