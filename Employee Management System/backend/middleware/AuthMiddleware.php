<?php
namespace Middleware;

use Config\AppConfig;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware {
    public static function check() {
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            try {
                $decoded = JWT::decode($jwt, new Key(AppConfig::JWT_SECRET, 'HS256'));
                // Add decoded user data to global scope if needed
                $GLOBALS['user'] = $decoded->data;
                return true;
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(["success" => false, "message" => "Access denied. Invalid token."]);
                exit;
            }
        }
        
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Access denied. Token missing."]);
        exit;
    }

    public static function requireRole($allowedRoles) {
        self::check();
        
        $userRole = $GLOBALS['user']->role ?? '';
        
        if (!in_array($userRole, $allowedRoles)) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Access denied. Insufficient permissions."]);
            exit;
        }
        
        return true;
    }
}
