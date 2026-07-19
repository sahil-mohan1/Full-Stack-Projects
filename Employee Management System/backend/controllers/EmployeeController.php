<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;
use Exception;

class EmployeeController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        
        $sql = "SELECT e.id, e.employee_code, e.first_name, e.last_name, e.personal_email, 
                       e.mobile_number, e.status, d.name as department, des.title as designation
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN designations des ON e.designation_id = des.id
                ORDER BY e.created_at DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $employees
        ]);
    }

    public function show($id) {
        AuthMiddleware::check();
        
        $sql = "SELECT e.*, d.name as department_name, des.title as designation_name,
                       b.bank_name, b.account_number, b.ifsc_code, b.branch_name, b.account_holder,
                       s.basic_salary, s.hra, s.allowances, s.bonus, s.pf_number, s.esi_number, s.professional_tax
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN designations des ON e.designation_id = des.id
                LEFT JOIN bank_details b ON e.id = b.employee_id
                LEFT JOIN salary_details s ON e.id = s.employee_id
                WHERE e.id = :id";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$employee) {
            echo json_encode(["success" => false, "message" => "Employee not found"]);
            return;
        }

        echo json_encode([
            "success" => true,
            "data" => $employee
        ]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['employee_code']) || empty($data['personal_email'])) {
            echo json_encode(["success" => false, "message" => "Employee Code and Email are required"]);
            return;
        }

        try {
            $this->conn->beginTransaction();

            // 1. Create User (Default password = employee_code)
            $password_hash = password_hash($data['employee_code'], PASSWORD_BCRYPT);
            // Default role_id for employee is let's say 4, assuming HR will set it or default to 4 (Employee)
            // Fetch Employee role id
            $roleStmt = $this->conn->prepare("SELECT id FROM roles WHERE name = 'Employee'");
            $roleStmt->execute();
            $role = $roleStmt->fetch(PDO::FETCH_ASSOC);
            $role_id = $role ? $role['id'] : 4; 

            $userStmt = $this->conn->prepare("INSERT INTO users (email, password_hash, role_id) VALUES (:email, :pass, :role)");
            $userStmt->execute([
                'email' => $data['personal_email'],
                'pass' => $password_hash,
                'role' => $role_id
            ]);
            $user_id = $this->conn->lastInsertId();

            // 2. Create Employee
            $empSql = "INSERT INTO employees (
                user_id, employee_code, first_name, last_name, gender, date_of_birth, blood_group, marital_status,
                personal_email, mobile_number, emergency_contact, address, department_id, designation_id, 
                manager_id, employment_type, joining_date, probation_period, status
            ) VALUES (
                :user_id, :employee_code, :first_name, :last_name, :gender, :dob, :blood, :marital,
                :email, :mobile, :emergency, :address, :dept_id, :desig_id, 
                :manager_id, :emp_type, :join_date, :probation, :status
            )";
            $empStmt = $this->conn->prepare($empSql);
            $empStmt->execute([
                'user_id' => $user_id,
                'employee_code' => $data['employee_code'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'gender' => $data['gender'],
                'dob' => $data['date_of_birth'],
                'blood' => $data['blood_group'] ?? null,
                'marital' => $data['marital_status'] ?? null,
                'email' => $data['personal_email'],
                'mobile' => $data['mobile_number'],
                'emergency' => $data['emergency_contact'],
                'address' => $data['address'],
                'dept_id' => $data['department_id'] ?: null,
                'desig_id' => $data['designation_id'] ?: null,
                'manager_id' => $data['manager_id'] ?: null,
                'emp_type' => $data['employment_type'],
                'join_date' => $data['joining_date'],
                'probation' => $data['probation_period'] ?? null,
                'status' => $data['status'] ?? 'Active'
            ]);
            $employee_id = $this->conn->lastInsertId();

            // 3. Create Bank Details
            if (!empty($data['bank_name'])) {
                $bankStmt = $this->conn->prepare("INSERT INTO bank_details (employee_id, bank_name, account_number, ifsc_code, branch_name, account_holder) VALUES (:emp_id, :bank, :acc, :ifsc, :branch, :holder)");
                $bankStmt->execute([
                    'emp_id' => $employee_id,
                    'bank' => $data['bank_name'],
                    'acc' => $data['account_number'],
                    'ifsc' => $data['ifsc_code'],
                    'branch' => $data['branch_name'] ?? null,
                    'holder' => $data['account_holder']
                ]);
            }

            // 4. Create Salary Details
            if (isset($data['basic_salary'])) {
                $salStmt = $this->conn->prepare("INSERT INTO salary_details (employee_id, basic_salary, hra, allowances, bonus, pf_number, esi_number, professional_tax) VALUES (:emp_id, :basic, :hra, :allowances, :bonus, :pf, :esi, :pt)");
                $salStmt->execute([
                    'emp_id' => $employee_id,
                    'basic' => $data['basic_salary'],
                    'hra' => $data['hra'] ?? 0,
                    'allowances' => $data['allowances'] ?? 0,
                    'bonus' => $data['bonus'] ?? 0,
                    'pf' => $data['pf_number'] ?? null,
                    'esi' => $data['esi_number'] ?? null,
                    'pt' => $data['professional_tax'] ?? 0
                ]);
            }

            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Employee created successfully"]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["success" => false, "message" => "Failed to create employee: " . $e->getMessage()]);
        }
    }
}
