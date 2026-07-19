<?php
namespace Controllers;

use Config\Database;
use Config\AppConfig;
use Firebase\JWT\JWT;
use PDO;

class AuthController {
    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->email) || !isset($data->password)) {
            echo json_encode(["success" => false, "message" => "Email and password are required"]);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();
        
        $stmt = $conn->prepare("
            SELECT u.id, u.email, u.password_hash, u.is_active, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = :email
        ");
        $stmt->execute(['email' => $data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($data->password, $user['password_hash'])) {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
            return;
        }

        if (!$user['is_active']) {
            echo json_encode(["success" => false, "message" => "Account is disabled"]);
            return;
        }

        $payload = [
            "iss" => "ems_api",
            "iat" => time(),
            "exp" => time() + AppConfig::JWT_EXPIRES_IN,
            "data" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ];

        $jwt = JWT::encode($payload, AppConfig::JWT_SECRET, 'HS256');

        echo json_encode([
            "success" => true, 
            "message" => "Login Successful",
            "token" => $jwt,
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ]);
    }
    
    public function forgotPassword() {
        echo json_encode(["success" => false, "message" => "Forgot password not implemented yet"]);
    }
}

