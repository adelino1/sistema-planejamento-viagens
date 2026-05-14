<?php
declare(strict_types=1);

/**
 * Cria utilizador administrador (CLI).
 *
 * Uso (PowerShell):
 *   & "C:\xampp\php\php.exe" scripts/seed_admin.php admin@local.dev "Admin123!" "Administrador"
 */

require_once __DIR__ . '/../helpers/bootstrap.php';
require_once __DIR__ . '/../helpers/database.php';
require_once __DIR__ . '/../repositories/UserRepository.php';

$email = $argv[1] ?? 'admin@local.dev';
$password = $argv[2] ?? 'Admin123!';
$fullName = $argv[3] ?? 'Administrador';

$email = strtolower(trim($email));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Email inválido.\n");
    exit(1);
}

if (strlen($password) < 8) {
    fwrite(STDERR, "Password deve ter pelo menos 8 caracteres.\n");
    exit(1);
}

$pdo = getPdoConnection();
$repo = new UserRepository($pdo);

if ($repo->findByEmail($email) !== null) {
    fwrite(STDERR, "Email já existe: {$email}\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$repo->create($fullName, $email, $hash, 'admin');

echo "Administrador criado: {$email}\n";
