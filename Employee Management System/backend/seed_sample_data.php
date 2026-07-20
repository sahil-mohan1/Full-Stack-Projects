<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

$db = new Database();
$conn = $db->getConnection();

if (!$conn) {
    die("Database connection failed.\n");
}

try {
    echo "Disabling foreign key checks...\n";
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");

    $tables = [
        'assets', 'announcements', 'leave_requests', 'attendance', 
        'documents', 'salary_details', 'bank_details', 'employees', 
        'designations', 'departments', 'audit_logs', 'users', 'roles'
    ];

    echo "Clearing existing data...\n";
    foreach ($tables as $table) {
        $conn->exec("TRUNCATE TABLE $table;");
        echo "Truncated $table\n";
    }

    echo "Enabling foreign key checks...\n";
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 1. Roles
    echo "Seeding Roles...\n";
    $roles = ['Super Admin', 'HR Admin', 'Manager', 'Employee'];
    $roleIds = [];
    foreach ($roles as $role) {
        $stmt = $conn->prepare("INSERT INTO roles (name, description) VALUES (:name, :desc)");
        $stmt->execute(['name' => $role, 'desc' => "$role role"]);
        $roleIds[$role] = $conn->lastInsertId();
    }

    // 2. Users
    echo "Seeding Users...\n";
    $usersData = [
        ['email' => 'admin@ems.com', 'role' => 'Super Admin'],
        ['email' => 'hr@ems.com', 'role' => 'HR Admin'],
        ['email' => 'manager@ems.com', 'role' => 'Manager'],
        ['email' => 'employee@ems.com', 'role' => 'Employee'],
        ['email' => 'john.doe@ems.com', 'role' => 'Employee'],
    ];

    $userIds = [];
    $password = 'Admin@123';
    $hashed = password_hash($password, PASSWORD_BCRYPT);

    foreach ($usersData as $u) {
        $stmt = $conn->prepare("INSERT INTO users (email, password_hash, role_id) VALUES (:email, :password, :role_id)");
        $stmt->execute([
            'email' => $u['email'],
            'password' => $hashed,
            'role_id' => $roleIds[$u['role']]
        ]);
        $userIds[$u['email']] = $conn->lastInsertId();
    }

    // 3. Departments
    echo "Seeding Departments...\n";
    $depts = [
        ['code' => 'DPT-HR', 'name' => 'Human Resources'],
        ['code' => 'DPT-ENG', 'name' => 'Engineering'],
        ['code' => 'DPT-SLS', 'name' => 'Sales']
    ];
    $deptIds = [];
    foreach ($depts as $d) {
        $stmt = $conn->prepare("INSERT INTO departments (department_code, name, description) VALUES (:code, :name, :desc)");
        $stmt->execute(['code' => $d['code'], 'name' => $d['name'], 'desc' => $d['name'] . ' Department']);
        $deptIds[$d['code']] = $conn->lastInsertId();
    }

    // 4. Designations
    echo "Seeding Designations...\n";
    $desigs = [
        ['code' => 'DES-HRM', 'dept' => 'DPT-HR', 'title' => 'HR Manager'],
        ['code' => 'DES-SDE', 'dept' => 'DPT-ENG', 'title' => 'Senior Developer'],
        ['code' => 'DES-JDE', 'dept' => 'DPT-ENG', 'title' => 'Junior Developer'],
        ['code' => 'DES-SLE', 'dept' => 'DPT-SLS', 'title' => 'Sales Executive']
    ];
    $desigIds = [];
    foreach ($desigs as $d) {
        $stmt = $conn->prepare("INSERT INTO designations (designation_code, department_id, title) VALUES (:code, :dept_id, :title)");
        $stmt->execute(['code' => $d['code'], 'dept_id' => $deptIds[$d['dept']], 'title' => $d['title']]);
        $desigIds[$d['code']] = $conn->lastInsertId();
    }

    // 5. Employees
    echo "Seeding Employees...\n";
    $employeesData = [
        [
            'user_email' => 'hr@ems.com', 'code' => 'EMP-001', 'fname' => 'Alice', 'lname' => 'Smith',
            'gender' => 'Female', 'dept' => 'DPT-HR', 'desig' => 'DES-HRM'
        ],
        [
            'user_email' => 'manager@ems.com', 'code' => 'EMP-002', 'fname' => 'Bob', 'lname' => 'Johnson',
            'gender' => 'Male', 'dept' => 'DPT-ENG', 'desig' => 'DES-SDE'
        ],
        [
            'user_email' => 'employee@ems.com', 'code' => 'EMP-003', 'fname' => 'Charlie', 'lname' => 'Brown',
            'gender' => 'Male', 'dept' => 'DPT-ENG', 'desig' => 'DES-JDE', 'manager_code' => 'EMP-002'
        ],
        [
            'user_email' => 'john.doe@ems.com', 'code' => 'EMP-004', 'fname' => 'John', 'lname' => 'Doe',
            'gender' => 'Male', 'dept' => 'DPT-SLS', 'desig' => 'DES-SLE'
        ]
    ];
    
    $empIds = [];
    foreach ($employeesData as $e) {
        $stmt = $conn->prepare("
            INSERT INTO employees (
                user_id, employee_code, first_name, last_name, gender, date_of_birth, 
                personal_email, mobile_number, emergency_contact, address, 
                department_id, designation_id, employment_type, joining_date
            ) VALUES (
                :user_id, :code, :fname, :lname, :gender, '1990-01-01',
                :p_email, :mobile, '9999999999', '123 Main St',
                :dept_id, :desig_id, 'Full-Time', '2023-01-01'
            )
        ");
        $stmt->execute([
            'user_id' => $userIds[$e['user_email']],
            'code' => $e['code'],
            'fname' => $e['fname'],
            'lname' => $e['lname'],
            'gender' => $e['gender'],
            'p_email' => $e['fname'] . '@personal.com',
            'mobile' => '555000' . rand(1000, 9999),
            'dept_id' => $deptIds[$e['dept']],
            'desig_id' => $desigIds[$e['desig']]
        ]);
        $empIds[$e['code']] = $conn->lastInsertId();
    }
    
    // Update managers
    $stmt = $conn->prepare("UPDATE employees SET manager_id = :manager_id WHERE employee_code = :code");
    $stmt->execute(['manager_id' => $empIds['EMP-002'], 'code' => 'EMP-003']);

    // Update Departments head
    $stmt = $conn->prepare("UPDATE departments SET department_head_id = :head WHERE department_code = 'DPT-ENG'");
    $stmt->execute(['head' => $empIds['EMP-002']]);

    // 6. Bank Details & Salary Details
    echo "Seeding Bank & Salary Details...\n";
    foreach ($empIds as $code => $id) {
        // Bank
        $stmt = $conn->prepare("INSERT INTO bank_details (employee_id, bank_name, account_number, ifsc_code, account_holder) VALUES (:emp_id, 'Bank of World', :acc, 'BOW000123', :holder)");
        $stmt->execute(['emp_id' => $id, 'acc' => '10002000' . rand(1000, 9999), 'holder' => 'Holder ' . $code]);

        // Salary
        $stmt = $conn->prepare("INSERT INTO salary_details (employee_id, basic_salary, hra, allowances) VALUES (:emp_id, :basic, :hra, :allow)");
        $stmt->execute(['emp_id' => $id, 'basic' => 50000, 'hra' => 20000, 'allow' => 10000]);
    }

    // 7. Assets
    echo "Seeding Assets...\n";
    $assets = [
        ['name' => 'MacBook Pro M2', 'assigned_to' => $empIds['EMP-002']],
        ['name' => 'Dell XPS 15', 'assigned_to' => $empIds['EMP-003']],
        ['name' => 'Office Chair', 'assigned_to' => null],
    ];
    foreach ($assets as $a) {
        $stmt = $conn->prepare("INSERT INTO assets (name, assigned_to, status, assigned_date) VALUES (:name, :assigned_to, :status, :date)");
        $stmt->execute([
            'name' => $a['name'], 
            'assigned_to' => $a['assigned_to'], 
            'status' => $a['assigned_to'] ? 'Assigned' : 'Available',
            'date' => $a['assigned_to'] ? date('Y-m-d') : null
        ]);
    }

    // 8. Announcements
    echo "Seeding Announcements...\n";
    $stmt = $conn->prepare("INSERT INTO announcements (title, content, created_by) VALUES (:title, :content, :user)");
    $stmt->execute([
        'title' => 'Welcome to the new EMS!', 
        'content' => 'We are glad to launch the new Employee Management System.',
        'user' => $userIds['admin@ems.com']
    ]);

    // 9. Leave Requests
    echo "Seeding Leave Requests...\n";
    $stmt = $conn->prepare("INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) VALUES (:emp_id, 'Sick', :start, :end, 'Fever', 'Pending')");
    $stmt->execute([
        'emp_id' => $empIds['EMP-003'],
        'start' => date('Y-m-d', strtotime('+1 day')),
        'end' => date('Y-m-d', strtotime('+2 days'))
    ]);

    // 10. Attendance (some mock data for past 3 days)
    echo "Seeding Attendance...\n";
    $statuses = ['Present', 'Present', 'Absent', 'On Leave', 'Half Day'];
    for ($i = 1; $i <= 3; $i++) {
        $date = date('Y-m-d', strtotime("-$i days"));
        foreach ($empIds as $code => $id) {
            $status = $statuses[array_rand($statuses)];
            $check_in = null;
            $check_out = null;
            $total = 0;
            if ($status === 'Present' || $status === 'Half Day') {
                $check_in = $date . ' 09:00:00';
                $check_out = $date . ($status === 'Present' ? ' 17:00:00' : ' 13:00:00');
                $total = $status === 'Present' ? 8 : 4;
            }
            $stmt = $conn->prepare("INSERT INTO attendance (employee_id, date, check_in, check_out, status, total_hours) VALUES (:emp_id, :date, :in, :out, :status, :total)");
            $stmt->execute([
                'emp_id' => $id, 'date' => $date, 'in' => $check_in, 'out' => $check_out, 
                'status' => $status, 'total' => $total
            ]);
        }
    }

    echo "\n=========================================\n";
    echo "Database seeded successfully with sample data!\n";
    echo "Test Accounts (Password for all: Admin@123):\n";
    echo "- admin@ems.com (Super Admin)\n";
    echo "- hr@ems.com (HR Admin)\n";
    echo "- manager@ems.com (Manager)\n";
    echo "- employee@ems.com (Employee)\n";
    echo "- john.doe@ems.com (Employee)\n";
    echo "=========================================\n";

} catch (PDOException $e) {
    echo "Seeding failed: " . $e->getMessage() . "\n";
}
