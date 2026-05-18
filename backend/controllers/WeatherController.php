<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\WeatherService;

/**
 * API de Clima / Previsão do Tempo (integração com OpenWeatherMap).
 * Não requer autenticação (cache público).
 */
class WeatherController
{
    private WeatherService $service;

    public function __construct()
    {
        $this->service = new WeatherService();
    }

    /**
     * GET /api/v1/weather/current?city=&country=
     */
    public function current(): void
    {
        $city = $_GET['city'] ?? null;
        $country = $_GET['country'] ?? null;

        if (!$city) {
            http_response_code(400);
            echo json_encode(['error' => 'city parameter required']);
            return;
        }

        $weather = $this->service->getCurrentWeather($city, $country);
        echo json_encode(['data' => $weather]);
    }

    /**
     * GET /api/v1/weather/forecast?city=&days=7
     */
    public function forecast(): void
    {
        $city = $_GET['city'] ?? null;
        $days = (int) ($_GET['days'] ?? 7);

        if (!$city) {
            http_response_code(400);
            echo json_encode(['error' => 'city parameter required']);
            return;
        }

        $forecast = $this->service->getForecast($city, $days);
        echo json_encode(['data' => $forecast]);
    }

    /**
     * POST /api/v1/weather/batch
     * Batch de múltiplas cidades.
     */
    public function batch(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $cities = $body['cities'] ?? [];

        if (empty($cities)) {
            http_response_code(400);
            echo json_encode(['error' => 'cities array required']);
            return;
        }

        $results = $this->service->getMultipleCities($cities);
        echo json_encode(['data' => $results, 'count' => count($results)]);
    }
}
