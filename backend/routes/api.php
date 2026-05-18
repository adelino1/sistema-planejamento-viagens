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

    // Despesas
    ['method' => 'GET', 'path' => '/api/v1/trips/{trip_id}/expenses', 'action' => ['ExpenseController', 'indexByTrip'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/trips/{trip_id}/expenses', 'action' => ['ExpenseController', 'store'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/expenses/{id}', 'action' => ['ExpenseController', 'show'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/expenses/{id}', 'action' => ['ExpenseController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/expenses/{id}', 'action' => ['ExpenseController', 'destroy'], 'requiresAuth' => true],

    // Reservas
    ['method' => 'GET', 'path' => '/api/v1/trips/{trip_id}/bookings', 'action' => ['BookingController', 'indexByTrip'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/trips/{trip_id}/bookings', 'action' => ['BookingController', 'store'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/bookings/{id}', 'action' => ['BookingController', 'show'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/bookings/{id}', 'action' => ['BookingController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/bookings/{id}', 'action' => ['BookingController', 'destroy'], 'requiresAuth' => true],

    // Clima / Previsão
    ['method' => 'GET', 'path' => '/api/v1/weather/current', 'action' => ['WeatherController', 'current']],
    ['method' => 'GET', 'path' => '/api/v1/weather/forecast', 'action' => ['WeatherController', 'forecast']],
    ['method' => 'POST', 'path' => '/api/v1/weather/batch', 'action' => ['WeatherController', 'batch']],

    // Admin - Dashboard
    ['method' => 'GET', 'path' => '/api/v1/admin/dashboard/stats', 'action' => ['Admin\DashboardController', 'stats'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'GET', 'path' => '/api/v1/admin/dashboard/recent-users', 'action' => ['Admin\DashboardController', 'recentUsers'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'GET', 'path' => '/api/v1/admin/dashboard/recent-trips', 'action' => ['Admin\DashboardController', 'recentTrips'], 'requiresAuth' => true, 'requiresAdmin' => true],

    // Admin - Gestão de Utilizadores
    ['method' => 'GET', 'path' => '/api/v1/admin/users', 'action' => ['Admin\UserManagementController', 'index'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'GET', 'path' => '/api/v1/admin/users/{id}', 'action' => ['Admin\UserManagementController', 'show'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'PUT', 'path' => '/api/v1/admin/users/{id}', 'action' => ['Admin\UserManagementController', 'update'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/admin/users/{id}', 'action' => ['Admin\UserManagementController', 'destroy'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'PATCH', 'path' => '/api/v1/admin/users/{id}/deactivate', 'action' => ['Admin\UserManagementController', 'deactivate'], 'requiresAuth' => true, 'requiresAdmin' => true],
    ['method' => 'PATCH', 'path' => '/api/v1/admin/users/{id}/activate', 'action' => ['Admin\UserManagementController', 'activate'], 'requiresAuth' => true, 'requiresAdmin' => true],

    // Favoritos
    ['method' => 'GET', 'path' => '/api/v1/favorites', 'action' => ['FavoriteController', 'index'], 'requiresAuth' => true],
    ['method' => 'POST', 'path' => '/api/v1/favorites', 'action' => ['FavoriteController', 'store'], 'requiresAuth' => true],
    ['method' => 'GET', 'path' => '/api/v1/favorites/{id}', 'action' => ['FavoriteController', 'show'], 'requiresAuth' => true],
    ['method' => 'PUT', 'path' => '/api/v1/favorites/{id}', 'action' => ['FavoriteController', 'update'], 'requiresAuth' => true],
    ['method' => 'DELETE', 'path' => '/api/v1/favorites/{id}', 'action' => ['FavoriteController', 'destroy'], 'requiresAuth' => true],
];
