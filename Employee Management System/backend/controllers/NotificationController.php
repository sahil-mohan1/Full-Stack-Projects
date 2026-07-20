<?php
namespace Controllers;

use Config\Database;
use PDO;

class NotificationController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        // Normally filter by logged-in user, but for now we'll accept user_id via query param or return all.
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        try {
            $query = "SELECT n.*, u.username, e.first_name, e.last_name 
                      FROM notifications n
                      LEFT JOIN users u ON n.user_id = u.id
                      LEFT JOIN employees e ON u.employee_id = e.id
                      ORDER BY n.created_at DESC";
                      
            if ($user_id) {
                $query = "SELECT n.*, u.username, e.first_name, e.last_name 
                          FROM notifications n
                          LEFT JOIN users u ON n.user_id = u.id
                          LEFT JOIN employees e ON u.employee_id = e.id
                          WHERE n.user_id = :user_id 
                          ORDER BY n.created_at DESC";
            }
            
            $stmt = $this->conn->prepare($query);
            
            if ($user_id) {
                $stmt->bindParam(":user_id", $user_id);
            }
            
            $stmt->execute();
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $notifications]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function markAsRead($id) {
        try {
            $query = "UPDATE notifications SET is_read = TRUE WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Notification marked as read"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update notification"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function markAllAsRead() {
        $data = json_decode(file_get_contents("php://input"));
        $user_id = isset($data->user_id) ? $data->user_id : null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "User ID is required"]);
            return;
        }

        try {
            $query = "UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "All notifications marked as read"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update notifications"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
