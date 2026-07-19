<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class DepartmentController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        
        $stmt = $this->conn->prepare("SELECT * FROM departments ORDER BY created_at DESC");
        $stmt->execute();
        $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $departments
        ]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->name)) {
            echo json_encode(["success" => false, "message" => "Department name is required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("INSERT INTO departments (name, description) VALUES (:name, :description)");
            $stmt->execute([
                'name' => $data->name,
                'description' => $data->description ?? null
            ]);
            
            echo json_encode([
                "success" => true,
                "message" => "Department created successfully",
                "data" => ["id" => $this->conn->lastInsertId(), "name" => $data->name]
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                echo json_encode(["success" => false, "message" => "Department name already exists"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to create department"]);
            }
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->name)) {
            echo json_encode(["success" => false, "message" => "Department name is required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("UPDATE departments SET name = :name, description = :description WHERE id = :id");
            $stmt->execute([
                'name' => $data->name,
                'description' => $data->description ?? null,
                'id' => $id
            ]);
            
            echo json_encode([
                "success" => true,
                "message" => "Department updated successfully"
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(["success" => false, "message" => "Department name already exists"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update department"]);
            }
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin']); // Only Super Admin can delete
        
        try {
            $stmt = $this->conn->prepare("DELETE FROM departments WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Department deleted successfully"
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) { // Foreign key constraint fails
                echo json_encode(["success" => false, "message" => "Cannot delete department as it has associated designations or employees"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete department"]);
            }
        }
    }
}
