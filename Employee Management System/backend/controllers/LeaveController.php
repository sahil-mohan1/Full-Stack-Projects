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

        $data = $_POST;
        if (empty($data)) {
            $data = json_decode(file_get_contents("php://input"), true) ?? [];
        }

        $leaveType = $data['leave_type'] ?? null;
        $startDate = $data['start_date'] ?? null;
        $endDate = $data['end_date'] ?? null;
        $reason = $data['reason'] ?? null;
        
        $halfDay = $data['half_day'] ?? 'None';
        if (!in_array($halfDay, ['None', 'First Half', 'Second Half'])) {
            $halfDay = 'None';
        }

        if ($halfDay !== 'None') {
            $endDate = $startDate; // End date is identical to start date for half days
        }

        if (empty($leaveType) || empty($startDate) || empty($endDate) || empty($reason)) {
            echo json_encode(["success" => false, "message" => "All fields are required"]);
            return;
        }

        $documentPath = null;
        if (isset($_FILES['document']) && $_FILES['document']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../public/uploads/leaves/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileInfo = pathinfo($_FILES['document']['name']);
            $extension = strtolower($fileInfo['extension']);
            $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
            
            if (!in_array($extension, $allowedExtensions)) {
                echo json_encode(["success" => false, "message" => "Invalid document format. Only PDF, JPG, PNG allowed."]);
                return;
            }
            
            if ($_FILES['document']['size'] > 5 * 1024 * 1024) {
                echo json_encode(["success" => false, "message" => "File size exceeds 5MB limit."]);
                return;
            }

            $fileName = uniqid('leave_') . '.' . $extension;
            if (move_uploaded_file($_FILES['document']['tmp_name'], $uploadDir . $fileName)) {
                $documentPath = 'uploads/leaves/' . $fileName;
            }
        }

        $sql = "INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, half_day, reason, document_path, status) 
                VALUES (:emp_id, :leave_type, :start_date, :end_date, :half_day, :reason, :document_path, 'Pending')";
        
        $stmt = $this->conn->prepare($sql);
        if ($stmt->execute([
            'emp_id' => $employeeId,
            'leave_type' => $leaveType,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'half_day' => $halfDay,
            'reason' => $reason,
            'document_path' => $documentPath
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


    public function cancelLeave($id) {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;
        $employeeId = $this->getEmployeeId($userId);

        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT status FROM leave_requests WHERE id = :id AND employee_id = :emp_id");
        $stmt->execute(['id' => $id, 'emp_id' => $employeeId]);
        $leave = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$leave) {
            echo json_encode(["success" => false, "message" => "Leave request not found or unauthorized"]);
            return;
        }

        if ($leave['status'] !== 'Pending') {
            echo json_encode(["success" => false, "message" => "Only pending leave requests can be cancelled"]);
            return;
        }

        $update = $this->conn->prepare("UPDATE leave_requests SET status = 'Cancelled', action_date = NOW() WHERE id = :id");
        if ($update->execute(['id' => $id])) {
            echo json_encode(["success" => true, "message" => "Leave request cancelled successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to cancel leave request"]);
        }
    }

}
