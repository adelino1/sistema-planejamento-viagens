<?php
// backend/api/db.php

$host = 'localhost';
$db   = 'tripnomad';
$user = 'root';
$pass = ''; // Default XAMPP password is usually empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // In production, log error instead of throwing to user
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
?>
