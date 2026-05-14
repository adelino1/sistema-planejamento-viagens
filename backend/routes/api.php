<?php
declare(strict_types=1);

/**
 * Rotas REST versionadas.
 * - action: [ControllerClass, methodName]
 * - requiresAuth: Bearer válido (validação em index.php antes do controller)
 */
return [
    ['method' => 'GET', 'path' => '/api/v1/health', 'action' => ['HealthController', 'ping']],
    ['method' => 'GET', 'path' => '/api/v1/status', 'action' => ['HealthController', 'status']],

    ['method' => 'POST', 'path' => '/api/v1/auth/register', 'action' => ['AuthController', 'register']],
    ['method' => 'POST', 'path' => '/api/v1/auth/login', 'action' => ['AuthController', 'login']],
    ['method' => 'POST', 'path' => '/api/v1/auth/logout', 'action' => ['AuthController', 'logout'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/auth/me', 'action' => ['AuthController', 'me'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/auth/forgot-password', 'action' => ['AuthController', 'forgotPassword']],
    ['method' => 'POST', 'path' => '/api/v1/auth/reset-password', 'action' => ['AuthController', 'resetPassword']],

    ['method' => 'GET', 'path' => '/api/v1/trips', 'action' => ['TripController', 'index'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/trips', 'action' => ['TripController', 'store'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/trips/{id}', 'action' => ['TripController', 'show'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/trips/{id}', 'action' => ['TripController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/trips/{id}', 'action' => ['TripController', 'destroy'], 'requiresAuth' => true],

    ['method' => 'GET', 'path' => '/api/v1/trips/{trip_id}/itinerary-days', 'action' => ['ItineraryDayController', 'indexByTrip'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/trips/{trip_id}/itinerary-days', 'action' => ['ItineraryDayController', 'store'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/itinerary-days/{id}', 'action' => ['ItineraryDayController', 'show'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/itinerary-days/{id}', 'action' => ['ItineraryDayController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/itinerary-days/{id}', 'action' => ['ItineraryDayController', 'destroy'], 'requiresAuth' => true],

    ['method' => 'GET', 'path' => '/api/v1/itinerary-days/{day_id}/activities', 'action' => ['ItineraryActivityController', 'indexByDay'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/itinerary-days/{day_id}/activities', 'action' => ['ItineraryActivityController', 'store'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/itinerary-activities/{id}', 'action' => ['ItineraryActivityController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/itinerary-activities/{id}', 'action' => ['ItineraryActivityController', 'destroy'], 'requiresAuth' => true],
];
