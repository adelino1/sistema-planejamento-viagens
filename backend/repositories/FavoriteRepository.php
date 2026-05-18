<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;

class FavoriteRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, favorite_type, label, country, city, latitude, longitude, metadata_json, created_at
            FROM favorites
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        ");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, favorite_type, label, country, city, latitude, longitude, metadata_json, created_at
            FROM favorites
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(
        int $userId,
        string $favoriteType,
        string $label,
        ?string $country = null,
        ?string $city = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?array $metadata = null
    ): array {
        $stmt = $this->pdo->prepare("
            INSERT INTO favorites (user_id, favorite_type, label, country, city, latitude, longitude, metadata_json)
            VALUES (:user_id, :favorite_type, :label, :country, :city, :latitude, :longitude, :metadata_json)
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'favorite_type' => $favoriteType,
            'label' => $label,
            'country' => $country,
            'city' => $city,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'metadata_json' => $metadata ? json_encode($metadata) : null,
        ]);

        return $this->findById((int) $this->pdo->lastInsertId(), $userId);
    }

    public function update(
        int $id,
        int $userId,
        ?string $label = null,
        ?string $country = null,
        ?string $city = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?array $metadata = null
    ): ?array {
        $fields = [];
        $params = ['id' => $id, 'user_id' => $userId];

        if ($label !== null) {
            $fields[] = 'label = :label';
            $params['label'] = $label;
        }
        if ($country !== null) {
            $fields[] = 'country = :country';
            $params['country'] = $country;
        }
        if ($city !== null) {
            $fields[] = 'city = :city';
            $params['city'] = $city;
        }
        if ($latitude !== null) {
            $fields[] = 'latitude = :latitude';
            $params['latitude'] = $latitude;
        }
        if ($longitude !== null) {
            $fields[] = 'longitude = :longitude';
            $params['longitude'] = $longitude;
        }
        if ($metadata !== null) {
            $fields[] = 'metadata_json = :metadata_json';
            $params['metadata_json'] = json_encode($metadata);
        }

        if (empty($fields)) {
            return $this->findById($id, $userId);
        }

        $sql = "UPDATE favorites SET " . implode(', ', $fields) . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $this->findById($id, $userId);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM favorites
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function checkExists(int $userId, string $favoriteType, string $label): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, favorite_type, label, country, city, latitude, longitude, metadata_json, created_at
            FROM favorites
            WHERE user_id = :user_id AND favorite_type = :favorite_type AND label = :label
            LIMIT 1
        ");
        $stmt->execute([
            'user_id' => $userId,
            'favorite_type' => $favoriteType,
            'label' => $label,
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }
}
