<?php
require_once '../cors.php';
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$name = trim($data['name']);
$email = trim($data['email']);
$password = $data['password'];

// Basic validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

// Hash password and insert
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $passwordHash]);
    $userId = $pdo->lastInsertId();

    // Create a simple token for demonstration purposes. In a real app, use JWT.
    $token = base64_encode(json_encode(["user_id" => $userId, "email" => $email, "time" => time()]));

    echo json_encode([
        "message" => "User registered successfully",
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email
        ],
        "token" => $token
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed"]);
}
?>
