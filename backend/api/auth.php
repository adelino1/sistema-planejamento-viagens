<?php
require_once __DIR__ . '/../src/Utils/Database.php';

use App\Utils\Database;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Função simples para gerar JWT mock ou token real (Base64 simplificado sem assinatura avançada, apropriado p/ protótipos sem libs externas)
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (86400 * 7); // 7 dias
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'segredo_super_seguro_para_viagens', true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'register') {
        $name = $input['name'] ?? '';
        $surname = $input['surname'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $country = $input['country'] ?? '';
        $language = $input['language'] ?? 'pt';
        $currency = $input['currency'] ?? 'USD';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Dados inválidos."]);
            exit;
        }

        try {
            $conn = Database::getConnection();
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Email já registado."]);
                exit;
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (name, surname, email, password_hash, country, language, currency) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $surname, $email, $hashedPassword, $country, $language, $currency]);
            $userId = $conn->lastInsertId();

            $token = generateJWT(['id' => $userId, 'email' => $email]);

            echo json_encode([
                "status" => "success",
                "message" => "Utilizador registado com sucesso.",
                "token" => $token,
                "user" => [
                    "id" => $userId, 
                    "name" => $name, 
                    "surname" => $surname,
                    "email" => $email,
                    "country" => $country,
                    "language" => $language,
                    "currency" => $currency
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Erro interno."]);
        }
    } elseif ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Credenciais ausentes."]);
            exit;
        }

        try {
            $conn = Database::getConnection();
            $stmt = $conn->prepare("SELECT id, name, surname, email, password_hash, country, language, currency, profile_image FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password_hash'])) {
                $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);
                echo json_encode([
                    "status" => "success",
                    "message" => "Login efetuado com sucesso.",
                    "token" => $token,
                    "user" => [
                        "id" => $user['id'], 
                        "name" => $user['name'], 
                        "surname" => $user['surname'],
                        "email" => $user['email'],
                        "country" => $user['country'],
                        "language" => $user['language'],
                        "currency" => $user['currency'],
                        "profile_image" => $user['profile_image']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Email ou palavra-passe incorretos."]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Erro interno."]);
        }
    } elseif ($action === 'recover') {
        $email = $input['email'] ?? '';
        if (!$email) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email necessário para recuperação."]);
            exit;
        }

        try {
            $conn = Database::getConnection();
            $stmt = $conn->prepare("SELECT id, email FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($user) {
                // Simula o envio de email retornando o token de reset no JSON para fins de teste no frontend
                $resetToken = bin2hex(random_bytes(16));
                echo json_encode([
                    "status" => "success",
                    "message" => "Instruções de recuperação enviadas para o seu email.",
                    "mock_reset_token" => $resetToken // Apenas para debug/academico
                ]);
            } else {
                // Mensagem genérica por segurança
                echo json_encode([
                    "status" => "success",
                    "message" => "Se o email existir na nossa base de dados, receberá as instruções."
                ]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Erro interno."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Ação de autenticação não encontrada."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido."]);
}
