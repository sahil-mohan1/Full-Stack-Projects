<?php
namespace Controllers;

use Config\Database;
use PDO;

class ReportController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getSummary() {
        try {
            $data = [];

            // Headcount
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM employees");
            $data['headcount'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Departments count
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM departments");
            $data['departments'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Active Jobs
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM job_postings WHERE status = 'Open'");
            $data['active_jobs'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Payroll Total (Current Month)
            $currentMonth = date('m');
            $currentYear = date('Y');
            $stmt = $this->conn->prepare("SELECT SUM(net_salary) as total_payroll FROM payroll WHERE month = :month AND year = :year AND status = 'Paid'");
            $stmt->bindParam(':month', $currentMonth);
            $stmt->bindParam(':year', $currentYear);
            $stmt->execute();
            $data['total_payroll'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_payroll'] ?? 0;

            // Employees by Department
            $stmt = $this->conn->query("
                SELECT d.name, COUNT(e.id) as count 
                FROM departments d 
                LEFT JOIN employees e ON d.id = e.department_id 
                GROUP BY d.id
            ");
            $data['department_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $data]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
