<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use Middleware\AuditLogger;
use PDO;

class AssetController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        
        // If employee, only show their own assets
        $userRole = $GLOBALS['user']->role ?? '';
        $employeeId = $GLOBALS['user']->employee_id ?? null;
        
        $query = "
            SELECT a.*, e.first_name, e.last_name, e.employee_code
            FROM assets a
            LEFT JOIN employees e ON a.assigned_to = e.id
        ";

        if ($userRole === 'Employee') {
            if (!$employeeId) {
                echo json_encode(["success" => true, "data" => []]);
                return;
            }
            $query .= " WHERE a.assigned_to = :employee_id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute(['employee_id' => $employeeId]);
        } else {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
        }
        
        $assets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $assets
        ]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR', 'Manager']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->name)) {
            echo json_encode(["success" => false, "message" => "Asset name is required"]);
            return;
        }

        $assigned_to = !empty($data->assigned_to) ? $data->assigned_to : null;
        $status = $data->status ?? 'Available';
        $assigned_date = !empty($data->assigned_date) ? $data->assigned_date : null;
        $return_date = !empty($data->return_date) ? $data->return_date : null;

        if ($assigned_to && $status !== 'Assigned') {
            $status = 'Assigned';
        } elseif (!$assigned_to && $status === 'Assigned') {
            $status = 'Available';
        }

        if ($status === 'Assigned' && !$assigned_date) {
            echo json_encode(["success" => false, "message" => "Assigned date is required when assigning an asset"]);
            return;
        }

        // Auto-clear dates if the asset is not assigned to anyone
        if (!$assigned_to) {
            $assigned_date = null;
            $return_date = null;
        }

        try {
            $stmt = $this->conn->prepare("
                INSERT INTO assets (name, description, assigned_to, assigned_date, return_date, status) 
                VALUES (:name, :description, :assigned_to, :assigned_date, :return_date, :status)
            ");
            $stmt->execute([
                'name' => $data->name,
                'description' => $data->description ?? null,
                'assigned_to' => $assigned_to,
                'assigned_date' => $assigned_date,
                'return_date' => $return_date,
                'status' => $status
            ]);
            
            $id = $this->conn->lastInsertId();
            AuditLogger::log("Created asset: {$data->name}");
            
            echo json_encode([
                "success" => true,
                "message" => "Asset created successfully",
                "data" => ["id" => $id, "name" => $data->name]
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to create asset", "error" => $e->getMessage()]);
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR', 'Manager']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->name)) {
            echo json_encode(["success" => false, "message" => "Asset name is required"]);
            return;
        }

        $assigned_to = !empty($data->assigned_to) ? $data->assigned_to : null;
        $status = $data->status ?? 'Available';
        $assigned_date = !empty($data->assigned_date) ? $data->assigned_date : null;
        $return_date = !empty($data->return_date) ? $data->return_date : null;

        if ($assigned_to && $status !== 'Assigned') {
            $status = 'Assigned';
        } elseif (!$assigned_to && $status === 'Assigned') {
            $status = 'Available';
        }

        if ($status === 'Assigned' && !$assigned_date) {
            echo json_encode(["success" => false, "message" => "Assigned date is required when assigning an asset"]);
            return;
        }

        // Auto-clear dates if the asset is not assigned to anyone
        if (!$assigned_to) {
            $assigned_date = null;
            $return_date = null;
        }

        try {
            $stmt = $this->conn->prepare("
                UPDATE assets 
                SET name = :name, description = :description, assigned_to = :assigned_to, 
                    assigned_date = :assigned_date, return_date = :return_date, status = :status
                WHERE id = :id
            ");
            $stmt->execute([
                'name' => $data->name,
                'description' => $data->description ?? null,
                'assigned_to' => $assigned_to,
                'assigned_date' => $assigned_date,
                'return_date' => $return_date,
                'status' => $status,
                'id' => $id
            ]);
            
            AuditLogger::log("Updated asset ID: {$id} ({$data->name})");

            echo json_encode([
                "success" => true,
                "message" => "Asset updated successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to update asset"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        try {
            $stmt = $this->conn->prepare("DELETE FROM assets WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            AuditLogger::log("Deleted asset ID: {$id}");

            echo json_encode([
                "success" => true,
                "message" => "Asset deleted successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to delete asset"]);
        }
    }
}
