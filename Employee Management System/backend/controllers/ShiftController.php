<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class ShiftController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        $stmt = $this->conn->prepare("SELECT * FROM shifts ORDER BY created_at DESC");
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->start_time) || empty($data->end_time)) {
            echo json_encode(["success" => false, "message" => "Name, Start Time, and End Time are required"]);
            return;
        }

        $shiftCode = $data->shift_code ?? strtoupper(substr(uniqid(), -6));
        $graceTime = $data->grace_time ?? 0;
        $weeklyOff = $data->weekly_off ?? 'Sunday';
        $status = $data->status ?? 'Active';

        $sql = "INSERT INTO shifts (shift_code, name, start_time, end_time, grace_time, weekly_off, status) 
                VALUES (:shift_code, :name, :start_time, :end_time, :grace_time, :weekly_off, :status)";
        
        $stmt = $this->conn->prepare($sql);
        try {
            if ($stmt->execute([
                'shift_code' => $shiftCode,
                'name' => $data->name,
                'start_time' => $data->start_time,
                'end_time' => $data->end_time,
                'grace_time' => $graceTime,
                'weekly_off' => $weeklyOff,
                'status' => $status
            ])) {
                echo json_encode(["success" => true, "message" => "Shift created successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to create shift"]);
            }
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Error: Duplicate shift code or name"]);
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->start_time) || empty($data->end_time)) {
            echo json_encode(["success" => false, "message" => "Name, Start Time, and End Time are required"]);
            return;
        }

        $graceTime = $data->grace_time ?? 0;
        $weeklyOff = $data->weekly_off ?? 'Sunday';
        $status = $data->status ?? 'Active';

        $sql = "UPDATE shifts SET name = :name, start_time = :start_time, end_time = :end_time, 
                grace_time = :grace_time, weekly_off = :weekly_off, status = :status WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        try {
            if ($stmt->execute([
                'name' => $data->name,
                'start_time' => $data->start_time,
                'end_time' => $data->end_time,
                'grace_time' => $graceTime,
                'weekly_off' => $weeklyOff,
                'status' => $status,
                'id' => $id
            ])) {
                echo json_encode(["success" => true, "message" => "Shift updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update shift"]);
            }
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Error: Duplicate shift name"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin']);
        
        try {
            $stmt = $this->conn->prepare("DELETE FROM shifts WHERE id = :id");
            if ($stmt->execute(['id' => $id])) {
                echo json_encode(["success" => true, "message" => "Shift deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete shift"]);
            }
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(["success" => false, "message" => "Cannot delete shift as it is assigned to employees"]);
            } else {
                echo json_encode(["success" => false, "message" => "Database error occurred"]);
            }
        }
    }


    public function bulkAssign() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->shift_id) || empty($data->employee_ids) || !is_array($data->employee_ids)) {
            echo json_encode(["success" => false, "message" => "Shift ID and Employee IDs are required"]);
            return;
        }

        try {
            $ids = implode(',', array_map('intval', $data->employee_ids));
            $shiftId = intval($data->shift_id);
            
            // Check if shift exists
            $checkStmt = $this->conn->prepare("SELECT id FROM shifts WHERE id = :shift_id");
            $checkStmt->execute(['shift_id' => $shiftId]);
            if (!$checkStmt->fetch()) {
                echo json_encode(["success" => false, "message" => "Invalid shift ID"]);
                return;
            }

            $stmt = $this->conn->prepare("UPDATE employees SET shift_id = $shiftId WHERE id IN ($ids)");
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Shifts assigned successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

}
