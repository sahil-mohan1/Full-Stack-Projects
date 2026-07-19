<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class AttendanceController {
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

    public function checkIn() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id; // or $_GLOBALS['user']->id based on AuthMiddleware

        $employeeId = $this->getEmployeeId($userId);
        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $date = date('Y-m-d');
        $now = date('Y-m-d H:i:s');

        // Check if already checked in today
        $stmt = $this->conn->prepare("SELECT id FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employeeId, 'date' => $date]);
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Already checked in today"]);
            return;
        }

        $insert = $this->conn->prepare("INSERT INTO attendance (employee_id, date, check_in, status) VALUES (:emp_id, :date, :check_in, 'Present')");
        if ($insert->execute(['emp_id' => $employeeId, 'date' => $date, 'check_in' => $now])) {
            echo json_encode(["success" => true, "message" => "Checked in successfully", "time" => $now]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to check in"]);
        }
    }

    public function checkOut() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employeeId = $this->getEmployeeId($userId);
        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $date = date('Y-m-d');
        $now = date('Y-m-d H:i:s');

        // Get today's attendance record
        $stmt = $this->conn->prepare("SELECT id, check_in, check_out FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employeeId, 'date' => $date]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            echo json_encode(["success" => false, "message" => "No check-in record found for today"]);
            return;
        }

        if ($record['check_out']) {
            echo json_encode(["success" => false, "message" => "Already checked out today"]);
            return;
        }

        // Calculate total hours
        $checkInTime = strtotime($record['check_in']);
        $checkOutTime = strtotime($now);
        $totalHours = round(($checkOutTime - $checkInTime) / 3600, 2);

        $update = $this->conn->prepare("UPDATE attendance SET check_out = :check_out, total_hours = :hours WHERE id = :id");
        if ($update->execute(['check_out' => $now, 'hours' => $totalHours, 'id' => $record['id']])) {
            echo json_encode(["success" => true, "message" => "Checked out successfully", "time" => $now, "total_hours" => $totalHours]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to check out"]);
        }
    }

    public function myAttendance() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employeeId = $this->getEmployeeId($userId);
        if (!$employeeId) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM attendance WHERE employee_id = :emp_id ORDER BY date DESC");
        $stmt->execute(['emp_id' => $employeeId]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }

    public function allAttendance() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        
        $sql = "SELECT a.*, e.first_name, e.last_name, e.employee_code 
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                ORDER BY a.date DESC, a.check_in DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }
}
