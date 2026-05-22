<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoloader simulation (since we don't have composer configured yet)
require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/TripController.php';

use App\Controllers\AuthController;
use App\Controllers\TripController;

// Basic Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$input = json_decode(file_get_contents('php://input'));

if ($uri === '/api/health') {
    echo json_encode(["status" => "ok", "message" => "TripNomad API is running"]);
    exit();
}

if ($uri === '/api/register' && $method === 'POST') {
    $controller = new AuthController();
    echo $controller->register($input);
    exit();
}

if ($uri === '/api/login' && $method === 'POST') {
    $controller = new AuthController();
    echo $controller->login($input);
    exit();
}

if ($uri === '/api/trips/sync' && $method === 'POST') {
    // Basic auth check (Mock extracting user ID from payload for now)
    $userId = $input->userId ?? null;
    $controller = new TripController();
    echo $controller->syncDraft($userId, $input);
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found"]);
