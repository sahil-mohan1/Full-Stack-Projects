<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class DesignationController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;

        $sql = "SELECT d.*, dept.name as department_name FROM designations d JOIN departments dept ON d.department_id = dept.id";
        if ($department_id) {
            $sql .= " WHERE d.department_id = :department_id";
        }
        $sql .= " ORDER BY d.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        
        if ($department_id) {
            $stmt->execute(['department_id' => $department_id]);
        } else {
            $stmt->execute();
        }
        
        $designations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $designations
        ]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->department_id)) {
            echo json_encode(["success" => false, "message" => "Title and department ID are required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("INSERT INTO designations (title, department_id) VALUES (:title, :department_id)");
            $stmt->execute([
                'title' => $data->title,
                'department_id' => $data->department_id
            ]);
            
            echo json_encode([
                "success" => true,
                "message" => "Designation created successfully",
                "data" => ["id" => $this->conn->lastInsertId(), "title" => $data->title]
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to create designation. " . $e->getMessage()]);
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->department_id)) {
            echo json_encode(["success" => false, "message" => "Title and department ID are required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("UPDATE designations SET title = :title, department_id = :department_id WHERE id = :id");
            $stmt->execute([
                'title' => $data->title,
                'department_id' => $data->department_id,
                'id' => $id
            ]);
            
            echo json_encode([
                "success" => true,
                "message" => "Designation updated successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to update designation"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin']); 
        
        try {
            $stmt = $this->conn->prepare("DELETE FROM designations WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Designation deleted successfully"
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) { 
                echo json_encode(["success" => false, "message" => "Cannot delete designation as it has associated employees"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete designation"]);
            }
        }
    }
}
