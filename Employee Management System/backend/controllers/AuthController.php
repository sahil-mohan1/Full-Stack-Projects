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
            SELECT u.id, u.email, u.password_hash, u.is_active, u.failed_login_attempts, u.locked_until, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = :email
        ");
        $stmt->execute(['email' => $data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
            return;
        }

        // Check if account is locked
        if ($user['locked_until'] !== null && strtotime($user['locked_until']) > time()) {
            $minutes_left = ceil((strtotime($user['locked_until']) - time()) / 60);
            echo json_encode(["success" => false, "message" => "Account locked due to multiple failed attempts. Try again in $minutes_left minutes."]);
            return;
        }

        if (!password_verify($data->password, $user['password_hash'])) {
            // Increment failed login attempts
            $attempts = $user['failed_login_attempts'] + 1;
            $locked_until = null;
            if ($attempts >= 5) {
                // Lock account for 15 minutes
                $locked_until = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            }

            $updateStmt = $conn->prepare("UPDATE users SET failed_login_attempts = :attempts, locked_until = :locked_until WHERE id = :id");
            $updateStmt->execute(['attempts' => $attempts, 'locked_until' => $locked_until, 'id' => $user['id']]);

            if ($attempts >= 5) {
                echo json_encode(["success" => false, "message" => "Account locked due to multiple failed attempts. Try again in 15 minutes."]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid email or password"]);
            }
            return;
        }

        if (!$user['is_active']) {
            echo json_encode(["success" => false, "message" => "Account is disabled"]);
            return;
        }

        // Reset failed login attempts on success
        $resetStmt = $conn->prepare("UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = :id");
        $resetStmt->execute(['id' => $user['id']]);

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

    public function logout() {
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            
            $db = new Database();
            $conn = $db->getConnection();
            
            try {
                $stmt = $conn->prepare("INSERT IGNORE INTO token_blocklist (token) VALUES (:token)");
                $stmt->execute(['token' => $jwt]);
                echo json_encode(["success" => true, "message" => "Logged out successfully"]);
            } catch (\PDOException $e) {
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Token missing"]);
        }
    }
    
    public function forgotPassword() {
        echo json_encode(["success" => false, "message" => "Forgot password not implemented yet"]);
    }
}
