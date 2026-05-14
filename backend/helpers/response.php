<?php
declare(strict_types=1);

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    try {
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        http_response_code(500);
        echo '{"success":false,"message":"Falha ao serializar resposta JSON.","errors":["json_encode_failed"]}';
    }
}

function successResponse(array $data = [], string $message = 'Success', int $statusCode = 200): void
{
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data,
    ], $statusCode);
}

function errorResponse(string $message = 'Error', array $errors = [], int $statusCode = 400): void
{
    jsonResponse([
        'success' => false,
        'message' => $message,
        'errors' => $errors,
    ], $statusCode);
}
