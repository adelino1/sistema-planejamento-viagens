<?php
namespace App\Utils;

class Database {
    private static $host = '127.0.0.1';
    private static $db_name = 'travel_planner_db';
    private static $username = 'root'; // Padrão XAMPP
    private static $password = ''; // Padrão XAMPP
    private static $conn;

    public static function getConnection() {
        if (self::$conn === null) {
            try {
                self::$conn = new \PDO("mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4", self::$username, self::$password);
                self::$conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            } catch(\PDOException $exception) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Erro na conexão com a base de dados: " . $exception->getMessage()]);
                exit;
            }
        }
        return self::$conn;
    }
}
