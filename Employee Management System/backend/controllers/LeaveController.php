<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class LeaveController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    private function getEmployeeId($userId) {
        $stmt = $this->conn->prepare("SELECT id FROM employees WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $emp = $stmt->fetch(PDO::FETCH_ASSOC);
        return $emp ? $emp['id'] : null;
    }

    public function apply() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employeeId = $this->getEmployeeId($userId);
        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['leave_type']) || empty($data['start_date']) || empty($data['end_date']) || empty($data['reason'])) {
            echo json_encode(["success" => false, "message" => "All fields are required"]);
            return;
        }

        $sql = "INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) 
                VALUES (:emp_id, :leave_type, :start_date, :end_date, :reason, 'Pending')";
        
        $stmt = $this->conn->prepare($sql);
        if ($stmt->execute([
            'emp_id' => $employeeId,
            'leave_type' => $data['leave_type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason']
        ])) {
            echo json_encode(["success" => true, "message" => "Leave request submitted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to submit leave request"]);
        }
    }

    public function myLeaves() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employeeId = $this->getEmployeeId($userId);
        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM leave_requests WHERE employee_id = :emp_id ORDER BY created_at DESC");
        $stmt->execute(['emp_id' => $employeeId]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }

    public function allLeaves() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        
        $sql = "SELECT lr.*, e.first_name, e.last_name, e.employee_code 
                FROM leave_requests lr
                JOIN employees e ON lr.employee_id = e.id
                ORDER BY lr.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }

    public function updateStatus($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        $userId = $GLOBALS['user']->id;
        $approverId = $this->getEmployeeId($userId); // may be null if it's super admin without an employee profile

        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['status']) || !in_array($data['status'], ['Approved', 'Rejected'])) {
            echo json_encode(["success" => false, "message" => "Valid status (Approved/Rejected) is required"]);
            return;
        }

        $sql = "UPDATE leave_requests SET status = :status, approved_by = :approved_by, action_date = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        if ($stmt->execute([
            'status' => $data['status'],
            'approved_by' => $approverId,
            'id' => $id
        ])) {
            echo json_encode(["success" => true, "message" => "Leave request updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update leave request"]);
        }
    }
}
