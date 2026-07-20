<?php
namespace Controllers;

use Config\Database;
use PDO;

class RecruitmentController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // --- Job Postings ---

    public function indexJobs() {
        try {
            $query = "SELECT j.*, d.name as department_name 
                      FROM job_postings j
                      LEFT JOIN departments d ON j.department_id = d.id
                      ORDER BY j.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $jobs]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function storeJob() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->title) || !isset($data->description)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            return;
        }

        try {
            $query = "INSERT INTO job_postings (title, department_id, description, status) 
                      VALUES (:title, :department_id, :description, :status)";
            $stmt = $this->conn->prepare($query);
            
            $status = isset($data->status) ? $data->status : 'Open';
            $department_id = isset($data->department_id) ? $data->department_id : null;

            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":department_id", $department_id);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":status", $status);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Job posting created successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to create job posting"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function updateJob($id) {
        $data = json_decode(file_get_contents("php://input"));
        
        try {
            $query = "UPDATE job_postings SET title = :title, department_id = :department_id, description = :description, status = :status WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":department_id", $data->department_id);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":id", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Job posting updated successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update job posting"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    // --- Candidates ---

    public function indexCandidates() {
        try {
            $query = "SELECT c.*, j.title as job_title 
                      FROM candidates c
                      JOIN job_postings j ON c.job_id = j.id
                      ORDER BY c.applied_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $candidates]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function storeCandidate() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->job_id) || !isset($data->first_name) || !isset($data->last_name) || !isset($data->email)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            return;
        }

        try {
            $query = "INSERT INTO candidates (job_id, first_name, last_name, email, status) 
                      VALUES (:job_id, :first_name, :last_name, :email, :status)";
            $stmt = $this->conn->prepare($query);
            
            $status = isset($data->status) ? $data->status : 'Applied';

            $stmt->bindParam(":job_id", $data->job_id);
            $stmt->bindParam(":first_name", $data->first_name);
            $stmt->bindParam(":last_name", $data->last_name);
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":status", $status);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Candidate added successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to add candidate"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    public function updateCandidateStatus($id) {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->status)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Status is required"]);
            return;
        }

        try {
            $query = "UPDATE candidates SET status = :status WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":id", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Candidate status updated"]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to update status"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
