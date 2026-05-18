<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Exceptions\HttpException;

class BookingService
{
    private BookingRepository $repo;

    public function __construct()
    {
        $this->repo = new BookingRepository();
    }

    /**
     * Obtém reservas de uma viagem.
     */
    public function getBookingsByTrip(int $tripId, ?int $userId): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserTripOwner($tripId, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        return $this->repo->getByTrip($tripId);
    }

    /**
     * Cria nova reserva.
     */
    public function createBooking(
        int $tripId,
        ?int $userId,
        string $type,
        string $provider,
        ?string $confirmationCode,
        string $bookingDate,
        ?string $checkInDate,
        ?string $checkOutDate,
        ?string $notes
    ): array {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserTripOwner($tripId, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        if (empty($type) || empty($provider)) {
            throw new HttpException('Invalid booking data', 400);
        }

        return $this->repo->create($tripId, $type, $provider, $confirmationCode, $bookingDate, $checkInDate, $checkOutDate, $notes);
    }

    /**
     * Obtém uma reserva.
     */
    public function getBooking(int $id, ?int $userId): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        $booking = $this->repo->find($id);
        if (!$booking) {
            throw new HttpException('Booking not found', 404);
        }

        if (!$this->repo->isUserBookingOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        return $booking;
    }

    /**
     * Atualiza reserva.
     */
    public function updateBooking(int $id, ?int $userId, array $data): array
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserBookingOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        return $this->repo->update($id, $data);
    }

    /**
     * Elimina reserva.
     */
    public function deleteBooking(int $id, ?int $userId): void
    {
        if (!$userId) {
            throw new HttpException('Unauthorized', 401);
        }

        if (!$this->repo->isUserBookingOwner($id, $userId)) {
            throw new HttpException('Forbidden', 403);
        }

        $this->repo->delete($id);
    }
}
