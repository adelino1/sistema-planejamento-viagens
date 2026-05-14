<?php
declare(strict_types=1);

require_once __DIR__ . '/../helpers/bootstrap.php';
require_once __DIR__ . '/../helpers/request.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/router.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../exceptions/HttpException.php';
require_once __DIR__ . '/../repositories/UserRepository.php';
require_once __DIR__ . '/../repositories/SessionRepository.php';
require_once __DIR__ . '/../repositories/PasswordResetRepository.php';
require_once __DIR__ . '/../repositories/TripRepository.php';
require_once __DIR__ . '/../repositories/ItineraryDayRepository.php';
require_once __DIR__ . '/../repositories/ItineraryActivityRepository.php';
require_once __DIR__ . '/../services/HealthService.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../services/TripService.php';
require_once __DIR__ . '/../services/ItineraryDayService.php';
require_once __DIR__ . '/../services/ItineraryActivityService.php';
require_once __DIR__ . '/../controllers/HealthController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/TripController.php';
require_once __DIR__ . '/../controllers/ItineraryDayController.php';
require_once __DIR__ . '/../controllers/ItineraryActivityController.php';

$appConfig = require __DIR__ . '/../config/app.php';
$routes = require __DIR__ . '/../routes/api.php';

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestPath = normalizeRequestPath();
$requestBody = getJsonInput();

applyCorsHeaders($appConfig['cors_allowed_origins']);

if ($requestMethod === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $healthService = new HealthService();
    $healthController = new HealthController($healthService);

    $matchedRoute = null;
    $routeParams = null;

    foreach ($routes as $route) {
        if (($route['method'] ?? '') !== $requestMethod) {
            continue;
        }

        $params = matchRoute((string) ($route['path'] ?? ''), $requestPath);
        if ($params === null) {
            continue;
        }

        $matchedRoute = $route;
        $routeParams = $params;
        break;
    }

    if ($matchedRoute === null || $routeParams === null) {
        errorResponse('Recurso não encontrado.', ['not_found'], 404);
        exit;
    }

    /** @var array{0: string, 1: string} $actionTuple */
    $actionTuple = $matchedRoute['action'];
    [$controllerName, $action] = $actionTuple;

    $skipDatabase = $controllerName === 'HealthController' && $action === 'ping';

    $authService = null;
    $authController = null;
    $tripController = null;
    $itineraryDayController = null;
    $itineraryActivityController = null;

    if (!$skipDatabase) {
        $pdo = getPdoConnection();
        $userRepository = new UserRepository($pdo);
        $sessionRepository = new SessionRepository($pdo);
        $passwordResetRepository = new PasswordResetRepository($pdo);
        $authService = new AuthService($pdo, $userRepository, $sessionRepository, $passwordResetRepository, $appConfig);
        $authController = new AuthController($authService);

        $tripRepository = new TripRepository($pdo);
        $itineraryDayRepository = new ItineraryDayRepository($pdo);
        $itineraryActivityRepository = new ItineraryActivityRepository($pdo);
        $tripService = new TripService($tripRepository, $itineraryDayRepository, $itineraryActivityRepository);
        $itineraryDayService = new ItineraryDayService($itineraryDayRepository, $tripRepository);
        $itineraryActivityService = new ItineraryActivityService($itineraryActivityRepository, $itineraryDayRepository);
        $tripController = new TripController($authService, $tripService);
        $itineraryDayController = new ItineraryDayController($authService, $itineraryDayService);
        $itineraryActivityController = new ItineraryActivityController($authService, $itineraryActivityService);
    }

    if (!empty($matchedRoute['requiresAuth'])) {
        if (!$authService instanceof AuthService) {
            errorResponse('Configuração de rota inválida.', [], 500);
            exit;
        }
        if ($authService->getAuthenticatedUser() === null) {
            errorResponse('Não autorizado.', ['token inválido, expirado ou em falta.'], 401);
            exit;
        }
    }

    $controllers = [
        'HealthController' => $healthController,
    ];

    if ($authController instanceof AuthController) {
        $controllers['AuthController'] = $authController;
    }
    if ($tripController instanceof TripController) {
        $controllers['TripController'] = $tripController;
    }
    if ($itineraryDayController instanceof ItineraryDayController) {
        $controllers['ItineraryDayController'] = $itineraryDayController;
    }
    if ($itineraryActivityController instanceof ItineraryActivityController) {
        $controllers['ItineraryActivityController'] = $itineraryActivityController;
    }

    $controller = $controllers[$controllerName] ?? null;

    if ($controller === null || !method_exists($controller, $action)) {
        errorResponse('Ação da rota não configurada.', [], 500);
        exit;
    }

    try {
        dispatchController($controller, $action, $requestMethod, $requestBody, $routeParams);
    } catch (HttpException $e) {
        errorResponse($e->getMessage(), $e->errors, $e->statusCode);
    }
    exit;
} catch (Throwable $exception) {
    $debug = filter_var($appConfig['debug'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $payload = ['unexpected_error'];
    if ($debug) {
        $payload['detail'] = $exception->getMessage();
    }
    errorResponse('Erro interno do servidor.', $payload, 500);
}
