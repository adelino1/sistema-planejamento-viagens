<?php
declare(strict_types=1);

require_once __DIR__ . '/Env.php';

$envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
loadEnvFile($envPath);
