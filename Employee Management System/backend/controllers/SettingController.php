<?php
namespace Controllers;

use Config\Database;
use PDO;

class SettingController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        try {
            $query = "SELECT setting_key, setting_value FROM settings";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            echo json_encode(["success" => true, "data" => $settings]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function update() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No data provided"]);
            return;
        }

        try {
            $this->conn->beginTransaction();
            $query = "INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value)
                      ON DUPLICATE KEY UPDATE setting_value = :value";
            $stmt = $this->conn->prepare($query);

            foreach ($data as $key => $value) {
                $stmt->bindParam(":key", $key);
                $stmt->bindParam(":value", $value);
                $stmt->execute();
            }
            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Settings updated successfully"]);
        } catch (\PDOException $e) {
            $this->conn->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
