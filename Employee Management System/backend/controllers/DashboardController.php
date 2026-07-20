<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class DashboardController {
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

    public function summary() {
        AuthMiddleware::check();
        $user = $GLOBALS['user'];
        $userId = $user->id;
        $role = $user->role;

        $data = [];

        // --- Stats visible to Admin/HR roles ---
        if (in_array($role, ['Super Admin', 'HR', 'HR Admin'])) {
            // Total active employees
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'");
            $data['total_employees'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Today's attendance count
            $today = date('Y-m-d');
            $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM attendance WHERE date = :today");
            $stmt->execute(['today' => $today]);
            $data['today_attendance'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Pending leave requests
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'");
            $data['pending_leaves'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Total departments
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM departments");
            $data['total_departments'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Total assets
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM assets");
            $data['total_assets'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Attendance trend (last 7 days)
            $stmt = $this->conn->prepare(
                "SELECT date, COUNT(*) as count FROM attendance 
                 WHERE date >= DATE_SUB(:today, INTERVAL 6 DAY)
                 GROUP BY date ORDER BY date ASC"
            );
            $stmt->execute(['today' => $today]);
            $data['attendance_trend'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Employee growth by department
            $stmt = $this->conn->query(
                "SELECT d.name as department, COUNT(e.id) as count
                 FROM departments d
                 LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'Active'
                 GROUP BY d.id, d.name ORDER BY count DESC LIMIT 6"
            );
            $data['dept_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Recent activity (audit logs)
            $stmt = $this->conn->query(
                "SELECT al.action, al.created_at, u.email as user_email
                 FROM audit_logs al
                 LEFT JOIN users u ON al.user_id = u.id
                 ORDER BY al.created_at DESC LIMIT 5"
            );
            $data['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // --- Manager specific ---
        if ($role === 'Manager') {
            $data['pending_leaves'] = 0;
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'");
            $data['pending_leaves'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            $today = date('Y-m-d');
            $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM attendance WHERE date = :today");
            $stmt->execute(['today' => $today]);
            $data['today_attendance'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'");
            $data['total_employees'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        }

        // --- Personal stats for all users ---
        $employeeId = $this->getEmployeeId($userId);
        if ($employeeId) {
            // My leave balance (approved + pending this month)
            $stmt = $this->conn->prepare(
                "SELECT status, COUNT(*) as count FROM leave_requests 
                 WHERE employee_id = :emp_id 
                 GROUP BY status"
            );
            $stmt->execute(['emp_id' => $employeeId]);
            $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $data['my_leaves'] = array_column($leaves, 'count', 'status');

            // My attendance this month
            $monthStart = date('Y-m-01');
            $stmt = $this->conn->prepare(
                "SELECT COUNT(*) as count FROM attendance 
                 WHERE employee_id = :emp_id AND date >= :month_start"
            );
            $stmt->execute(['emp_id' => $employeeId, 'month_start' => $monthStart]);
            $data['my_attendance_this_month'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Check if checked in today
            $today = date('Y-m-d');
            $stmt = $this->conn->prepare(
                "SELECT id, check_in, check_out FROM attendance 
                 WHERE employee_id = :emp_id AND date = :today"
            );
            $stmt->execute(['emp_id' => $employeeId, 'today' => $today]);
            $data['today_status'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

            // My assigned assets
            $stmt = $this->conn->prepare(
                "SELECT COUNT(*) as count FROM assets WHERE assigned_to = :emp_id AND status = 'In Use'"
            );
            $stmt->execute(['emp_id' => $employeeId]);
            $data['my_assets'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        }

        echo json_encode(["success" => true, "data" => $data, "role" => $role]);
    }
}
