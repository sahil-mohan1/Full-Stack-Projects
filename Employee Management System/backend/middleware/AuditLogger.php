<?php
namespace Middleware;

use Config\Database;
use PDO;

class AuditLogger {
    public static function log($action) {
        $userId = $GLOBALS['user']->id ?? null;
        if (!$userId) return;

        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;

        try {
            $db = new Database();
            $conn = $db->getConnection();
            $stmt = $conn->prepare("INSERT INTO audit_logs (user_id, action, ip_address) VALUES (:user_id, :action, :ip_address)");
            $stmt->execute([
                'user_id' => $userId,
                'action' => $action,
                'ip_address' => $ipAddress
            ]);
        } catch (\PDOException $e) {
            error_log("Audit log failed: " . $e->getMessage());
        }
    }
}
