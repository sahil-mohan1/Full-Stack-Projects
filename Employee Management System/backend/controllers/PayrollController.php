<?php
namespace Controllers;

use Config\Database;
use PDO;

class PayrollController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        try {
            $query = "SELECT p.*, e.first_name, e.last_name, e.employee_code 
                      FROM payroll p
                      JOIN employees e ON p.employee_id = e.id
                      ORDER BY p.year DESC, p.month DESC, e.first_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $payrolls = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $payrolls]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function generate() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->month) || !isset($data->year)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Month and Year are required"]);
            return;
        }

        try {
            $query = "SELECT employee_id, basic_salary, (COALESCE(hra,0) + COALESCE(allowances,0) + COALESCE(bonus,0)) as allowances, COALESCE(professional_tax,0) as deductions FROM salary_details";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $salaries = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->conn->beginTransaction();
            $insertQuery = "INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary)
                            VALUES (:employee_id, :month, :year, :basic, :allowances, :deductions, :net)
                            ON DUPLICATE KEY UPDATE basic_salary = :basic, allowances = :allowances, deductions = :deductions, net_salary = :net";
            $insertStmt = $this->conn->prepare($insertQuery);
            
            foreach ($salaries as $salary) {
                $employee_id = $salary['employee_id'];
                $basic = $salary['basic_salary'];
                $allowances = $salary['allowances'];
                $deductions = $salary['deductions'];
                $net = $basic + $allowances - $deductions;
                
                $insertStmt->bindParam(":employee_id", $employee_id);
                $insertStmt->bindParam(":month", $data->month);
                $insertStmt->bindParam(":year", $data->year);
                $insertStmt->bindParam(":basic", $basic);
                $insertStmt->bindParam(":allowances", $allowances);
                $insertStmt->bindParam(":deductions", $deductions);
                $insertStmt->bindParam(":net", $net);
                $insertStmt->execute();
            }
            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Payroll generated successfully"]);
        } catch (\PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function markPaid($id) {
        try {
            $query = "UPDATE payroll SET status = 'Paid', payment_date = CURDATE() WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Payroll marked as paid"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to mark as paid"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }


    public function getPayslip($id) {
        try {
            $query = "SELECT p.*, 
                             e.first_name, e.last_name, e.employee_code, e.joining_date,
                             d.name as department, 
                             des.name as designation,
                             b.bank_name, b.account_number,
                             s.pf_number
                      FROM payroll p
                      JOIN employees e ON p.employee_id = e.id
                      LEFT JOIN departments d ON e.department_id = d.id
                      LEFT JOIN designations des ON e.designation_id = des.id
                      LEFT JOIN bank_details b ON e.id = b.employee_id
                      LEFT JOIN salary_details s ON e.id = s.employee_id
                      WHERE p.id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            $payslip = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($payslip) {
                echo json_encode(["success" => true, "data" => $payslip]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Payslip not found"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

}
