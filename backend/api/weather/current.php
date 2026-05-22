<?php
require_once '../cors.php';

// Try to get the API Key from environment or hardcode for now (User hasn't provided one)
// If empty, it falls back to Mock mode.
$API_KEY = ""; 

if (!isset($_GET['city'])) {
    http_response_code(400);
    echo json_encode(["error" => "City parameter is required"]);
    exit;
}

$city = trim($_GET['city']);

if (empty($API_KEY)) {
    // MOCK DATA since we don't have the API Key yet
    // Simulating OpenWeatherMap response format
    $mockResponse = [
        "coord" => ["lon" => -0.1257, "lat" => 51.5085],
        "weather" => [
            [
                "id" => 800,
                "main" => "Clear",
                "description" => "céu limpo",
                "icon" => "01d"
            ]
        ],
        "main" => [
            "temp" => 25.5,
            "feels_like" => 26.2,
            "temp_min" => 22.0,
            "temp_max" => 28.0,
            "pressure" => 1012,
            "humidity" => 50
        ],
        "name" => $city,
        "sys" => ["country" => "MockCountry"]
    ];

    // Sometimes we want to simulate rain for testing the AI
    if (strtolower($city) === 'london' || strtolower($city) === 'londres') {
        $mockResponse['weather'][0] = ["id" => 500, "main" => "Rain", "description" => "chuva leve", "icon" => "10d"];
        $mockResponse['main']['temp'] = 15.0;
        $mockResponse['main']['humidity'] = 80;
    }

    echo json_encode([
        "source" => "mock",
        "data" => $mockResponse
    ]);
    exit;
}

// REAL INTEGRATION (Uncommented and ready when API key is available)
$url = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($city) . "&appid=" . $API_KEY . "&units=metric&lang=pt";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo json_encode([
        "source" => "real",
        "data" => json_decode($response, true)
    ]);
} else {
    http_response_code($httpCode);
    echo json_encode(["error" => "Failed to fetch weather data"]);
}
?>
