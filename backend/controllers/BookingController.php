<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\BookingService;
use App\Exceptions\HttpException;

/**
 * CRUD de Reservas (Bookings).
 * Requer autenticação Bearer.
 */
class BookingController
{
    private BookingService $service;

    public function __construct()
    {
        $this->service = new BookingService();
    }

    /**
     * GET /api/v1/trips/{trip_id}/bookings
     */
    public function indexByTrip(): void
    {
        $tripId = (int) ($_GET['trip_id'] ?? 0);
        if (!$tripId) {
            throw new HttpException('trip_id required', 400);
        }

        $userId = $_SESSION['user_id'] ?? null;
        $bookings = $this->service->getBookingsByTrip($tripId, $userId);

        echo json_encode(['data' => $bookings, 'count' => count($bookings)]);
    }

    /**
     * POST /api/v1/trips/{trip_id}/bookings
     */
    public function store(): void
    {
        $tripId = (int) ($_GET['trip_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!$tripId) {
            throw new HttpException('trip_id required', 400);
        }

        $booking = $this->service->createBooking(
            $tripId,
            $userId,
            $body['type'] ?? '',
            $body['provider'] ?? '',
            $body['confirmation_code'] ?? null,
            $body['booking_date'] ?? date('Y-m-d'),
            $body['check_in_date'] ?? null,
            $body['check_out_date'] ?? null,
            $body['notes'] ?? null
        );

        http_response_code(201);
        echo json_encode(['data' => $booking]);
    }

    /**
     * GET /api/v1/bookings/{id}
     */
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        $booking = $this->service->getBooking($id, $userId);
        echo json_encode(['data' => $booking]);
    }

    /**
     * PUT /api/v1/bookings/{id}
     */
    public function update(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $booking = $this->service->updateBooking($id, $userId, $body);
        echo json_encode(['data' => $booking]);
    }

    /**
     * DELETE /api/v1/bookings/{id}
     */
    public function destroy(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        $this->service->deleteBooking($id, $userId);
        echo json_encode(['message' => 'Booking deleted']);
    }
}
