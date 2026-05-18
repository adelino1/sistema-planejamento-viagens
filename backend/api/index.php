<?php
/**
 * Ponto de entrada da API do Sistema de Planejamento de Viagens
 * Arquitetura: Serviços e Controladores Simples (Sem framework pesado)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Mudar em produção
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Resposta para pre-flight requests do CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Roteamento Básico
// Supondo que a API está em /sistema-planejamento-viagens/backend/api/
$basePath = '/sistema-planejamento-viagens/backend/api';
$route = str_replace($basePath, '', $requestUri);

// Split path elements
$pathParts = explode('/', trim($route, '/'));
$resource = $pathParts[0] ?? '';

try {
    switch ($resource) {
        case '':
            echo json_encode([
                'status' => 'success',
                'message' => 'Bem-vindo à API do Sistema de Planejamento de Viagens (Foco Angola)',
                'currency' => 'AOA',
                'timestamp' => time()
            ]);
            break;

        case 'users':
            echo json_encode(['status' => 'info', 'message' => 'Endpoint de usuários em construção.']);
            break;

        case 'trips':
            require_once __DIR__ . '/trips.php';
            break;

        case 'expenses':
            require_once __DIR__ . '/expenses.php';
            break;

        case 'ai-assistant':
            require_once __DIR__ . '/ai-assistant.php';
            break;

        default:
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Endpoint não encontrado.']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro interno no servidor.',
        'error' => $e->getMessage()
    ]);
}
