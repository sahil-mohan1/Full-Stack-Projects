<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use Middleware\AuditLogger;
use PDO;

class AnnouncementController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        
        $stmt = $this->conn->prepare("
            SELECT a.*, u.email as creator_email 
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute();
        $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $announcements
        ]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->content)) {
            echo json_encode(["success" => false, "message" => "Title and content are required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("INSERT INTO announcements (title, content, created_by) VALUES (:title, :content, :created_by)");
            $stmt->execute([
                'title' => $data->title,
                'content' => $data->content,
                'created_by' => $GLOBALS['user']->id
            ]);
            
            $id = $this->conn->lastInsertId();
            AuditLogger::log("Created announcement: {$data->title}");
            
            echo json_encode([
                "success" => true,
                "message" => "Announcement created successfully",
                "data" => ["id" => $id, "title" => $data->title]
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to create announcement"]);
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->content)) {
            echo json_encode(["success" => false, "message" => "Title and content are required"]);
            return;
        }

        try {
            $stmt = $this->conn->prepare("UPDATE announcements SET title = :title, content = :content WHERE id = :id");
            $stmt->execute([
                'title' => $data->title,
                'content' => $data->content,
                'id' => $id
            ]);
            
            AuditLogger::log("Updated announcement ID: {$id}");

            echo json_encode([
                "success" => true,
                "message" => "Announcement updated successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to update announcement"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR']);
        
        try {
            $stmt = $this->conn->prepare("DELETE FROM announcements WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            AuditLogger::log("Deleted announcement ID: {$id}");

            echo json_encode([
                "success" => true,
                "message" => "Announcement deleted successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to delete announcement"]);
        }
    }
}
