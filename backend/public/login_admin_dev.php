<?php
/**
 * ⚠️  REMOVER EM PRODUÇÃO
 * 
 * Endpoint de login admin temporário para desenvolvimento.
 * Permite testar o painel admin sem depender da autenticação real.
 * Este ficheiro deve ser eliminado antes do deployment.
 */

declare(strict_types=1);

// Configurar headers CORS para localhost:4200
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Responder a preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas aceitar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido',
    ]);
    exit;
}

// Ler corpo do request
$input = json_decode((string) file_get_contents('php://input'), true) ?? [];

// Credenciais hardcoded para desenvolvimento
$validEmail = 'admin@viagens.com';
$validPassword = 'admin123';

// Validar credenciais
if (($input['email'] ?? '') === $validEmail && ($input['password'] ?? '') === $validPassword) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'token' => 'dev-admin-token-2024',
            'user' => [
                'id' => 0,
                'full_name' => 'Admin Dev',
                'email' => 'admin@viagens.com',
                'role' => 'admin',
                'preferred_lang' => 'pt',
                'theme' => 'dark',
            ],
        ],
    ]);
    exit;
}

// Credenciais inválidas
http_response_code(401);
echo json_encode([
    'success' => false,
    'message' => 'Credenciais inválidas',
]);
