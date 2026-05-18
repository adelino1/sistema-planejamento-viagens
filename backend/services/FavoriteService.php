<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\FavoriteRepository;
use App\Exceptions\HttpException;

class FavoriteService
{
    private FavoriteRepository $repository;

    public function __construct(FavoriteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllFavorites(int $userId): array
    {
        return $this->repository->findByUserId($userId);
    }

    public function getFavorite(int $id, int $userId): array
    {
        $favorite = $this->repository->findById($id, $userId);
        if (!$favorite) {
            throw new HttpException('Favorite not found', 404);
        }
        return $favorite;
    }

    public function createFavorite(
        int $userId,
        string $favoriteType,
        string $label,
        ?string $country = null,
        ?string $city = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?array $metadata = null
    ): array {
        // Validate favorite type
        $validTypes = ['destination', 'place'];
        if (!in_array($favoriteType, $validTypes)) {
            throw new HttpException('Invalid favorite type. Must be: ' . implode(', ', $validTypes), 400);
        }

        // Check for duplicates
        $existing = $this->repository->checkExists($userId, $favoriteType, $label);
        if ($existing) {
            throw new HttpException('This item is already in your favorites', 409);
        }

        return $this->repository->create(
            $userId,
            $favoriteType,
            $label,
            $country,
            $city,
            $latitude,
            $longitude,
            $metadata
        );
    }

    public function updateFavorite(
        int $id,
        int $userId,
        ?string $label = null,
        ?string $country = null,
        ?string $city = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?array $metadata = null
    ): array {
        $favorite = $this->repository->findById($id, $userId);
        if (!$favorite) {
            throw new HttpException('Favorite not found', 404);
        }

        return $this->repository->update(
            $id,
            $userId,
            $label,
            $country,
            $city,
            $latitude,
            $longitude,
            $metadata
        );
    }

    public function deleteFavorite(int $id, int $userId): void
    {
        $favorite = $this->repository->findById($id, $userId);
        if (!$favorite) {
            throw new HttpException('Favorite not found', 404);
        }

        $this->repository->delete($id, $userId);
    }
}
