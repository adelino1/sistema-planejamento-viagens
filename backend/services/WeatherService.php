<?php
declare(strict_types=1);

require_once __DIR__ . '/../exceptions/HttpException.php';

/**
 * Integração com OpenWeatherMap API.
 * Requer variável de ambiente: OPENWEATHER_API_KEY
 */
final class WeatherService
{
    private string $apiKey;
    private string $apiUrl = 'https://api.openweathermap.org/data/2.5';
    private array $cache = [];
    private int $cacheTTL = 3600; // 1 hora

    public function __construct()
    {
        $this->apiKey = getenv('OPENWEATHER_API_KEY') ?: '';
        if (!$this->apiKey) {
            throw new HttpException('Weather API not configured', 500);
        }
    }

    /**
     * Obtém clima atual.
     */
    public function getCurrentWeather(string $city, ?string $country = null): array
    {
        $cacheKey = "weather_current_{$city}";
        
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        $location = $city . ($country ? ",{$country}" : '');
        
        $data = [
            'q' => $location,
            'appid' => $this->apiKey,
            'units' => 'metric',
        ];

        $response = $this->makeRequest('/weather', $data);

        $result = [
            'city' => $response['name'] ?? $city,
            'country' => $response['sys']['country'] ?? $country,
            'temperature' => $response['main']['temp'] ?? 0,
            'humidity' => $response['main']['humidity'] ?? 0,
            'windSpeed' => $response['wind']['speed'] ?? 0,
            'description' => $response['weather'][0]['description'] ?? 'unknown',
            'icon' => $response['weather'][0]['icon'] ?? '01d',
        ];

        $this->cache[$cacheKey] = $result;
        return $result;
    }

    /**
     * Obtém previsão para os próximos dias.
     */
    public function getForecast(string $city, int $days = 7): array
    {
        $cacheKey = "weather_forecast_{$city}_{$days}";
        
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        $data = [
            'q' => $city,
            'appid' => $this->apiKey,
            'units' => 'metric',
            'cnt' => min($days * 8, 120), // 3-hour intervals
        ];

        $response = $this->makeRequest('/forecast', $data);

        $forecast = [];
        foreach ($response['list'] ?? [] as $item) {
            $forecast[] = [
                'date' => $item['dt_txt'] ?? '',
                'temperature' => $item['main']['temp'] ?? 0,
                'humidity' => $item['main']['humidity'] ?? 0,
                'description' => $item['weather'][0]['description'] ?? '',
            ];
        }

        $this->cache[$cacheKey] = $forecast;
        return $forecast;
    }

    /**
     * Obtém clima para múltiplas cidades.
     */
    public function getMultipleCities(array $cities): array
    {
        $results = [];
        foreach ($cities as $city) {
            try {
                $results[] = $this->getCurrentWeather($city);
            } catch (\Exception $e) {
                // Skip city on error
            }
        }
        return $results;
    }

    /**
     * Faz request à API.
     */
    private function makeRequest(string $endpoint, array $params): array
    {
        $url = $this->apiUrl . $endpoint . '?' . http_build_query($params);

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
            ]
        ]);

        $response = @file_get_contents($url, false, $context);

        if (!$response) {
            throw new HttpException('Weather service unavailable', 503);
        }

        $data = json_decode($response, true);
        
        if ($data['cod'] ?? '200' !== '200') {
            throw new HttpException($data['message'] ?? 'Weather API error', 400);
        }

        return $data;
    }
}
