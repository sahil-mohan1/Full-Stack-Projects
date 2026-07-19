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
    // Insert Roles
    $roles = ['Super Admin', 'HR Admin', 'Manager', 'Employee'];
    foreach ($roles as $role) {
        $stmt = $conn->prepare("INSERT IGNORE INTO roles (name, description) VALUES (:name, :desc)");
        $stmt->execute(['name' => $role, 'desc' => "$role role"]);
    }
    
    // Get Super Admin Role ID
    $stmt = $conn->prepare("SELECT id FROM roles WHERE name = 'Super Admin'");
    $stmt->execute();
    $adminRole = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adminRole) {
        // Insert Super Admin User
        $email = 'admin@ems.com';
        $password = 'Admin@123';
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $conn->prepare("INSERT IGNORE INTO users (email, password_hash, role_id) VALUES (:email, :password, :role)");
        $stmt->execute([
            'email' => $email,
            'password' => $hashed,
            'role' => $adminRole['id']
        ]);
        
        echo "Database seeded successfully!\n";
        echo "Admin Login: $email / $password\n";
    }

} catch (PDOException $e) {
    echo "Seeding failed: " . $e->getMessage() . "\n";
}
