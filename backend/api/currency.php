<?php
// backend/api/currency.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'GET') {
    // Mock de taxas de câmbio baseadas no USD
    $rates = [
        "USD" => 1.00,
        "EUR" => 0.92,
        "GBP" => 0.79,
        "AOA" => 832.50, // Kwanza Angolano
        "BRL" => 4.95,   // Real Brasileiro
        "ZAR" => 19.10,  // Rand Sul Africano
        "JPY" => 150.25, // Iene Japonês
        "CNY" => 7.19,   // Yuan Chinês
        "INR" => 82.85,  // Rupia Indiana
        "CHF" => 0.88,   // Franco Suíço
    ];

    echo json_encode([
        "status" => "success",
        "base" => "USD",
        "rates" => $rates
    ]);
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido."]);
}
