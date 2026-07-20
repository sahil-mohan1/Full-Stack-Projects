<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class AuditLogController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::requireRole(['Super Admin']);
        
        $stmt = $this->conn->prepare("
            SELECT a.*, u.email, r.name as role_name 
            FROM audit_logs a
            JOIN users u ON a.user_id = u.id
            JOIN roles r ON u.role_id = r.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute();
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $logs
        ]);
    }
}
