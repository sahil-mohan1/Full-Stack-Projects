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
                       e.mobile_number, e.status, e.shift_id, d.name as department, des.title as designation,
                       sh.name as shift_name
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN designations des ON e.designation_id = des.id
                LEFT JOIN shifts sh ON e.shift_id = sh.id
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

        if (!empty($data['date_of_birth'])) {
            $dob = new \DateTime($data['date_of_birth']);
            $now = new \DateTime();
            $age = $now->diff($dob)->y;
            if ($age < 18) {
                echo json_encode(["success" => false, "message" => "Employee must be at least 18 years old"]);
                return;
            }
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
                user_id, employee_code, first_name, last_name, gender, date_of_birth, nationality, blood_group, marital_status,
                personal_email, mobile_number, alternate_mobile, emergency_contact, address, department_id, designation_id, 
                manager_id, branch, location, employment_type, joining_date, probation_period, shift_id, status
            ) VALUES (
                :user_id, :employee_code, :first_name, :last_name, :gender, :dob, :nationality, :blood, :marital,
                :email, :mobile, :alt_mobile, :emergency, :address, :dept_id, :desig_id, 
                :manager_id, :branch, :location, :emp_type, :join_date, :probation, :status
            )";
            $empStmt = $this->conn->prepare($empSql);
            $empStmt->execute([
                'user_id' => $user_id,
                'employee_code' => $data['employee_code'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'gender' => $data['gender'],
                'dob' => $data['date_of_birth'],
                'nationality' => $data['nationality'] ?? null,
                'blood' => $data['blood_group'] ?? null,
                'marital' => $data['marital_status'] ?? null,
                'email' => $data['personal_email'],
                'mobile' => $data['mobile_number'],
                'alt_mobile' => $data['alternate_mobile'] ?? null,
                'emergency' => $data['emergency_contact'],
                'address' => $data['address'],
                'dept_id' => $data['department_id'] ?: null,
                'desig_id' => $data['designation_id'] ?: null,
                'manager_id' => $data['manager_id'] ?: null,
                'branch' => $data['branch'] ?? null,
                'location' => $data['location'] ?? null,
                'emp_type' => $data['employment_type'],
                'join_date' => $data['joining_date'],
                'probation' => $data['probation_period'] ?? null,
                'shift_id' => $data['shift_id'] ?: null,
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

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['employee_code']) || empty($data['personal_email'])) {
            echo json_encode(["success" => false, "message" => "Employee Code and Email are required"]);
            return;
        }

        if (!empty($data['date_of_birth'])) {
            $dob = new \DateTime($data['date_of_birth']);
            $now = new \DateTime();
            $age = $now->diff($dob)->y;
            if ($age < 18) {
                echo json_encode(["success" => false, "message" => "Employee must be at least 18 years old"]);
                return;
            }
        }

        if (!empty($data['manager_id']) && $data['manager_id'] == $id) {
            echo json_encode(["success" => false, "message" => "Employee cannot report to themselves"]);
            return;
        }

        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("SELECT user_id FROM employees WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$employee) {
                throw new Exception("Employee not found");
            }
            $user_id = $employee['user_id'];

            if ($user_id) {
                $userStmt = $this->conn->prepare("UPDATE users SET email = :email WHERE id = :user_id");
                $userStmt->execute([
                    'email' => $data['personal_email'],
                    'user_id' => $user_id
                ]);
            }

            $empSql = "UPDATE employees SET 
                employee_code = :employee_code, first_name = :first_name, last_name = :last_name, gender = :gender, date_of_birth = :dob, 
                nationality = :nationality, blood_group = :blood, marital_status = :marital,
                personal_email = :email, mobile_number = :mobile, alternate_mobile = :alt_mobile, 
                emergency_contact = :emergency, address = :address, department_id = :dept_id, 
                designation_id = :desig_id, manager_id = :manager_id, branch = :branch, location = :location, 
                employment_type = :emp_type, joining_date = :join_date, probation_period = :probation, 
                shift_id = :shift_id, status = :status
                WHERE id = :id";
            $empStmt = $this->conn->prepare($empSql);
            $empStmt->execute([
                'id' => $id,
                'employee_code' => $data['employee_code'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'gender' => $data['gender'],
                'dob' => $data['date_of_birth'],
                'nationality' => $data['nationality'] ?? null,
                'blood' => $data['blood_group'] ?? null,
                'marital' => $data['marital_status'] ?? null,
                'email' => $data['personal_email'],
                'mobile' => $data['mobile_number'],
                'alt_mobile' => $data['alternate_mobile'] ?? null,
                'emergency' => $data['emergency_contact'],
                'address' => $data['address'],
                'dept_id' => $data['department_id'] ?: null,
                'desig_id' => $data['designation_id'] ?: null,
                'manager_id' => $data['manager_id'] ?: null,
                'branch' => $data['branch'] ?? null,
                'location' => $data['location'] ?? null,
                'emp_type' => $data['employment_type'],
                'join_date' => $data['joining_date'],
                'probation' => $data['probation_period'] ?? null,
                'shift_id' => $data['shift_id'] ?: null,
                'status' => $data['status'] ?? 'Active'
            ]);

            // Bank Details
            $checkBank = $this->conn->prepare("SELECT id FROM bank_details WHERE employee_id = :id");
            $checkBank->execute(['id' => $id]);
            if ($checkBank->fetch()) {
                $bankStmt = $this->conn->prepare("UPDATE bank_details SET bank_name = :bank, account_number = :acc, ifsc_code = :ifsc, branch_name = :branch, account_holder = :holder WHERE employee_id = :emp_id");
            } else {
                $bankStmt = $this->conn->prepare("INSERT INTO bank_details (employee_id, bank_name, account_number, ifsc_code, branch_name, account_holder) VALUES (:emp_id, :bank, :acc, :ifsc, :branch, :holder)");
            }
            $bankStmt->execute([
                'emp_id' => $id,
                'bank' => $data['bank_name'] ?? null,
                'acc' => $data['account_number'] ?? null,
                'ifsc' => $data['ifsc_code'] ?? null,
                'branch' => $data['branch_name'] ?? null,
                'holder' => $data['account_holder'] ?? null
            ]);

            // Salary Details
            $checkSal = $this->conn->prepare("SELECT id FROM salary_details WHERE employee_id = :id");
            $checkSal->execute(['id' => $id]);
            if ($checkSal->fetch()) {
                $salStmt = $this->conn->prepare("UPDATE salary_details SET basic_salary = :basic, hra = :hra, allowances = :allowances, bonus = :bonus, pf_number = :pf, esi_number = :esi, professional_tax = :pt WHERE employee_id = :emp_id");
            } else {
                $salStmt = $this->conn->prepare("INSERT INTO salary_details (employee_id, basic_salary, hra, allowances, bonus, pf_number, esi_number, professional_tax) VALUES (:emp_id, :basic, :hra, :allowances, :bonus, :pf, :esi, :pt)");
            }
            $salStmt->execute([
                'emp_id' => $id,
                'basic' => $data['basic_salary'] ?? 0,
                'hra' => $data['hra'] ?? 0,
                'allowances' => $data['allowances'] ?? 0,
                'bonus' => $data['bonus'] ?? 0,
                'pf' => $data['pf_number'] ?? null,
                'esi' => $data['esi_number'] ?? null,
                'pt' => $data['professional_tax'] ?? 0
            ]);

            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Employee updated successfully"]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["success" => false, "message" => "Failed to update employee: " . $e->getMessage()]);
        }
    }

    public function export() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        $sql = "SELECT e.employee_code, e.first_name, e.last_name, e.personal_email, 
                       e.mobile_number, e.gender, e.date_of_birth, e.employment_type, e.joining_date, e.status,
                       d.name as department, des.title as designation
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN designations des ON e.designation_id = des.id
                ORDER BY e.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="employees_export.csv"');
        $output = fopen('php://output', 'w');
        if (count($employees) > 0) {
            fputcsv($output, array_keys($employees[0]));
            foreach ($employees as $row) {
                fputcsv($output, $row);
            }
        }
        fclose($output);
        exit;
    }

    public function import() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        if (!isset($_FILES['file']) || $_FILES['file']['error'] != UPLOAD_ERR_OK) {
            echo json_encode(["success" => false, "message" => "Please upload a valid CSV file"]);
            return;
        }

        $file = $_FILES['file']['tmp_name'];
        $handle = fopen($file, "r");
        if ($handle !== FALSE) {
            $headers = fgetcsv($handle, 1000, ","); 
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            try {
                $this->conn->beginTransaction();

                $roleStmt = $this->conn->prepare("SELECT id FROM roles WHERE name = 'Employee'");
                $roleStmt->execute();
                $role = $roleStmt->fetch(PDO::FETCH_ASSOC);
                $role_id = $role ? $role['id'] : 4; 

                $rowNum = 2;
                while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    if (count($headers) !== count($data)) {
                        $errorCount++;
                        $errors[] = "Row $rowNum: Column count mismatch.";
                        $rowNum++;
                        continue;
                    }
                    $row = array_combine($headers, $data);
                    
                    if (empty($row['employee_code']) || empty($row['personal_email']) || empty($row['first_name'])) {
                        $errorCount++;
                        $errors[] = "Row $rowNum: Missing required fields.";
                        $rowNum++;
                        continue;
                    }

                    $password_hash = password_hash($row['employee_code'], PASSWORD_BCRYPT);
                    $userStmt = $this->conn->prepare("INSERT INTO users (email, password_hash, role_id) VALUES (:email, :pass, :role)");
                    try {
                        $userStmt->execute([
                            'email' => $row['personal_email'],
                            'pass' => $password_hash,
                            'role' => $role_id
                        ]);
                        $user_id = $this->conn->lastInsertId();

                        $dept_id = null;
                        if (!empty($row['department'])) {
                            $dStmt = $this->conn->prepare("SELECT id FROM departments WHERE name = :name");
                            $dStmt->execute(['name' => $row['department']]);
                            $d = $dStmt->fetch(PDO::FETCH_ASSOC);
                            if ($d) $dept_id = $d['id'];
                        }

                        $desig_id = null;
                        if (!empty($row['designation'])) {
                            $desStmt = $this->conn->prepare("SELECT id FROM designations WHERE title = :title");
                            $desStmt->execute(['title' => $row['designation']]);
                            $des = $desStmt->fetch(PDO::FETCH_ASSOC);
                            if ($des) $desig_id = $des['id'];
                        }

                        $empSql = "INSERT INTO employees (
                            user_id, employee_code, first_name, last_name, personal_email, mobile_number, gender, date_of_birth,
                            employment_type, joining_date, status, department_id, designation_id
                        ) VALUES (
                            :user_id, :code, :fname, :lname, :email, :mobile, :gender, :dob, :emp_type, :join, :status, :dept, :desig
                        )";
                        $empStmt = $this->conn->prepare($empSql);
                        $empStmt->execute([
                            'user_id' => $user_id,
                            'code' => $row['employee_code'],
                            'fname' => $row['first_name'],
                            'lname' => $row['last_name'] ?? '',
                            'email' => $row['personal_email'],
                            'mobile' => $row['mobile_number'] ?? '',
                            'gender' => $row['gender'] ?? 'Other',
                            'dob' => !empty($row['date_of_birth']) ? $row['date_of_birth'] : '2000-01-01',
                            'emp_type' => $row['employment_type'] ?? 'Full-Time',
                            'join' => !empty($row['joining_date']) ? $row['joining_date'] : date('Y-m-d'),
                            'status' => $row['status'] ?? 'Active',
                            'dept' => $dept_id,
                            'desig' => $desig_id
                        ]);
                        
                        $successCount++;
                    } catch (Exception $ex) {
                        $errorCount++;
                        $errors[] = "Row $rowNum: " . $ex->getMessage();
                    }
                    $rowNum++;
                }

                $this->conn->commit();
                fclose($handle);

                echo json_encode([
                    "success" => true, 
                    "message" => "Import completed. Success: $successCount, Errors: $errorCount",
                    "errors" => $errors
                ]);

            } catch (Exception $e) {
                $this->conn->rollBack();
                fclose($handle);
                echo json_encode(["success" => false, "message" => "Import failed: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Error reading file"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);

        try {
            $this->conn->beginTransaction();

            // 1. Fetch user_id for this employee
            $stmt = $this->conn->prepare("SELECT user_id FROM employees WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$employee) {
                $this->conn->rollBack();
                echo json_encode(["success" => false, "message" => "Employee not found"]);
                return;
            }

            // 2. Set employee status to Inactive
            $updateEmpStmt = $this->conn->prepare("UPDATE employees SET status = 'Inactive' WHERE id = :id");
            $updateEmpStmt->execute(['id' => $id]);

            // 3. Deactivate user account
            if ($employee['user_id']) {
                $updateUserStmt = $this->conn->prepare("UPDATE users SET is_active = 0 WHERE id = :user_id");
                $updateUserStmt->execute(['user_id' => $employee['user_id']]);
            }

            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Employee deactivated successfully"]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["success" => false, "message" => "Failed to deactivate employee: " . $e->getMessage()]);
        }
    }
}

