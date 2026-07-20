<?php
namespace Controllers;

use Config\Database;
use PDO;

class UserController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        try {
            $query = "SELECT u.id, u.email, u.role_id, r.name as role_name, u.is_active, u.last_login, u.created_at 
                      FROM users u 
                      LEFT JOIN roles r ON u.role_id = r.id 
                      ORDER BY u.id DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $users]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->role_id) || !isset($data->is_active)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Incomplete data"]);
            return;
        }

        try {
            $query = "UPDATE users SET role_id = :role_id, is_active = :is_active WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":role_id", $data->role_id);
            $stmt->bindParam(":is_active", $data->is_active);
            $stmt->bindParam(":id", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "User updated successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update user"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function getRoles() {
        try {
            $query = "SELECT id, name FROM roles ORDER BY id ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $roles]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
