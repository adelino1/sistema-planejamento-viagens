<?php

namespace App\Controllers;

use App\Config\Database;
use PDO;

class TripController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function syncDraft($userId, $data) {
        if (empty($userId) || empty($data->draft)) {
            http_response_code(400);
            return json_encode(["error" => "User ID and Draft data are required"]);
        }

        $draft = $data->draft;
        
        try {
            $this->db->beginTransaction();

            $tripId = $this->generateUuid();
            
            $query = "INSERT INTO trips (id, user_id, destination, lat, lng, status) VALUES (:id, :user_id, :destination, :lat, :lng, 'draft')";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":id", $tripId);
            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":destination", $draft->destination);
            $lat = $draft->lat ?? null;
            $lng = $draft->lng ?? null;
            $stmt->bindParam(":lat", $lat);
            $stmt->bindParam(":lng", $lng);
            $stmt->execute();

            if (!empty($draft->activities)) {
                $actQuery = "INSERT INTO activities (id, trip_id, name, type, lat, lng) VALUES (:id, :trip_id, :name, :type, :lat, :lng)";
                $actStmt = $this->db->prepare($actQuery);

                foreach ($draft->activities as $activity) {
                    $actId = $this->generateUuid();
                    $actStmt->bindParam(":id", $actId);
                    $actStmt->bindParam(":trip_id", $tripId);
                    $actStmt->bindParam(":name", $activity->name);
                    $actStmt->bindParam(":type", $activity->type);
                    $alat = $activity->lat ?? null;
                    $alng = $activity->lng ?? null;
                    $actStmt->bindParam(":lat", $alat);
                    $actStmt->bindParam(":lng", $alng);
                    $actStmt->execute();
                }
            }

            $this->db->commit();
            
            http_response_code(201);
            return json_encode([
                "message" => "Draft synced successfully",
                "trip_id" => $tripId
            ]);

        } catch (\PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            return json_encode(["error" => "Failed to sync draft: " . $e->getMessage()]);
        }
    }

    private function generateUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
