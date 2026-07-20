<?php
namespace Controllers;

use Config\Database;
use PDO;

class PerformanceController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        // Assume user_id and role are extracted from token in real implementation.
        // We'll return all for HR/Admin or filter by employee/manager in the query.
        try {
            $query = "SELECT pr.*, 
                             e.first_name as emp_first, e.last_name as emp_last,
                             r.first_name as rev_first, r.last_name as rev_last
                      FROM performance_reviews pr
                      JOIN employees e ON pr.employee_id = e.id
                      JOIN employees r ON pr.reviewer_id = r.id
                      ORDER BY pr.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $reviews]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->employee_id) || !isset($data->reviewer_id) || !isset($data->review_period)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            return;
        }

        try {
            $query = "INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, rating, comments, status) 
                      VALUES (:employee_id, :reviewer_id, :review_period, :rating, :comments, :status)";
            $stmt = $this->conn->prepare($query);
            
            $status = isset($data->status) ? $data->status : 'Draft';
            $rating = isset($data->rating) ? $data->rating : null;
            $comments = isset($data->comments) ? $data->comments : '';

            $stmt->bindParam(":employee_id", $data->employee_id);
            $stmt->bindParam(":reviewer_id", $data->reviewer_id);
            $stmt->bindParam(":review_period", $data->review_period);
            $stmt->bindParam(":rating", $rating);
            $stmt->bindParam(":comments", $comments);
            $stmt->bindParam(":status", $status);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Performance review created successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to create review"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $query = "UPDATE performance_reviews SET rating = :rating, comments = :comments, status = :status WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":rating", $data->rating);
            $stmt->bindParam(":comments", $data->comments);
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":id", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Performance review updated successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update review"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM performance_reviews WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Review deleted successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to delete review"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
