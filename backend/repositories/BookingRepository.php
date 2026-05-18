<?php
declare(strict_types=1);

namespace App\Repositories;

class BookingRepository
{
    /**
     * Verifica se o utilizador é dono da viagem.
     */
    public function isUserTripOwner(int $tripId, int $userId): bool
    {
        global $db;
        $stmt = $db->prepare('SELECT 1 FROM trips WHERE id = ? AND user_id = ?');
        $stmt->execute([$tripId, $userId]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Verifica se o utilizador é dono da reserva.
     */
    public function isUserBookingOwner(int $bookingId, int $userId): bool
    {
        global $db;
        $stmt = $db->prepare('
            SELECT 1 FROM bookings b
            JOIN trips t ON b.trip_id = t.id
            WHERE b.id = ? AND t.user_id = ?
        ');
        $stmt->execute([$bookingId, $userId]);
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Lista reservas de uma viagem.
     */
    public function getByTrip(int $tripId): array
    {
        global $db;
        $stmt = $db->prepare('
            SELECT id, trip_id, type, provider, confirmation_code, booking_date, check_in_date, check_out_date, notes, created_at, updated_at
            FROM bookings
            WHERE trip_id = ?
            ORDER BY booking_date DESC
        ');
        $stmt->execute([$tripId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Cria reserva.
     */
    public function create(
        int $tripId,
        string $type,
        string $provider,
        ?string $confirmationCode,
        string $bookingDate,
        ?string $checkInDate,
        ?string $checkOutDate,
        ?string $notes
    ): array {
        global $db;
        $stmt = $db->prepare('
            INSERT INTO bookings (trip_id, type, provider, confirmation_code, booking_date, check_in_date, check_out_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $tripId,
            $type,
            $provider,
            $confirmationCode,
            $bookingDate,
            $checkInDate,
            $checkOutDate,
            $notes,
        ]);

        return $this->find((int) $db->lastInsertId());
    }

    /**
     * Obtém reserva por ID.
     */
    public function find(int $id): array
    {
        global $db;
        $stmt = $db->prepare('
            SELECT id, trip_id, type, provider, confirmation_code, booking_date, check_in_date, check_out_date, notes, created_at, updated_at
            FROM bookings
            WHERE id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Atualiza reserva.
     */
    public function update(int $id, array $data): array
    {
        global $db;

        $allowed = ['type', 'provider', 'confirmation_code', 'booking_date', 'check_in_date', 'check_out_date', 'notes'];
        $updates = [];
        $values = [];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($updates)) {
            return $this->find($id);
        }

        $values[] = $id;
        $query = 'UPDATE bookings SET ' . implode(', ', $updates) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';

        $stmt = $db->prepare($query);
        $stmt->execute($values);

        return $this->find($id);
    }

    /**
     * Elimina reserva.
     */
    public function delete(int $id): void
    {
        global $db;
        $stmt = $db->prepare('DELETE FROM bookings WHERE id = ?');
        $stmt->execute([$id]);
    }
}
