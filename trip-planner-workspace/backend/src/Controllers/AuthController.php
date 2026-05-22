<?php

namespace App\Controllers;

use App\Config\Database;
use PDO;

class AuthController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function register($data) {
        if (empty($data->name) || empty($data->email) || empty($data->password)) {
            http_response_code(400);
            return json_encode(["error" => "Name, email and password are required"]);
        }

        $id = $this->generateUuid();
        $hash = password_hash($data->password, PASSWORD_BCRYPT);

        $query = "INSERT INTO users (id, name, email, password_hash) VALUES (:id, :name, :email, :password_hash)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password_hash", $hash);

        try {
            if ($stmt->execute()) {
                $token = base64_encode(json_encode(['id' => $id, 'email' => $data->email])); // Mock JWT
                http_response_code(201);
                return json_encode([
                    "message" => "User registered successfully",
                    "token" => $token,
                    "user" => ["id" => $id, "name" => $data->name, "email" => $data->email]
                ]);
            }
        } catch (\PDOException $e) {
            http_response_code(409);
            return json_encode(["error" => "Email already exists or database error"]);
        }
        
        http_response_code(500);
        return json_encode(["error" => "Unable to register user"]);
    }

    public function login($data) {
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            return json_encode(["error" => "Email and password are required"]);
        }

        $query = "SELECT id, name, email, password_hash FROM users WHERE email = :email LIMIT 0,1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data->password, $row['password_hash'])) {
                $token = base64_encode(json_encode(['id' => $row['id'], 'email' => $row['email']])); // Mock JWT
                http_response_code(200);
                return json_encode([
                    "message" => "Login successful",
                    "token" => $token,
                    "user" => ["id" => $row['id'], "name" => $row['name'], "email" => $row['email']]
                ]);
            }
        }

        http_response_code(401);
        return json_encode(["error" => "Invalid credentials"]);
    }

    private function generateUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
