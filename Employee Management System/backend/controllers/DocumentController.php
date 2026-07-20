<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use Middleware\AuditLogger;
use PDO;

class DocumentController {
    private $conn;
    private $uploadDir = __DIR__ . '/../uploads/';

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
        
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function getByEmployee($employeeId) {
        AuthMiddleware::check();
        
        $userRole = $GLOBALS['user']->role ?? '';
        $currentEmployeeId = $GLOBALS['user']->employee_id ?? null;
        
        if ($userRole === 'Employee' && $currentEmployeeId != $employeeId) {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM documents WHERE employee_id = :employee_id ORDER BY uploaded_at DESC");
        $stmt->execute(['employee_id' => $employeeId]);
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $documents
        ]);
    }

    public function upload() {
        AuthMiddleware::check();
        
        // Allowed roles to upload any employee's document: Super Admin, HR
        // Employee can only upload their own document
        $userRole = $GLOBALS['user']->role ?? '';
        $currentEmployeeId = $GLOBALS['user']->employee_id ?? null;
        
        $employeeId = $_POST['employee_id'] ?? null;
        $documentType = $_POST['document_type'] ?? null;
        
        if (!$employeeId || !$documentType || !isset($_FILES['file'])) {
            echo json_encode(["success" => false, "message" => "Employee ID, Document Type, and File are required"]);
            return;
        }

        if ($userRole === 'Employee' && $currentEmployeeId != $employeeId) {
            echo json_encode(["success" => false, "message" => "You can only upload your own documents"]);
            return;
        }

        $file = $_FILES['file'];
        
        // Validate size (max 10MB)
        $maxSize = 10 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            echo json_encode(["success" => false, "message" => "File size exceeds 10MB limit"]);
            return;
        }

        // Validate type
        $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!in_array($file['type'], $allowedTypes)) {
            echo json_encode(["success" => false, "message" => "Only PDF, JPG, and PNG files are allowed"]);
            return;
        }

        // Generate safe file name
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('doc_') . '_' . time() . '.' . $extension;
        $filepath = $this->uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            try {
                $stmt = $this->conn->prepare("INSERT INTO documents (employee_id, document_type, file_path) VALUES (:employee_id, :document_type, :file_path)");
                $relativePath = 'uploads/' . $filename;
                
                $stmt->execute([
                    'employee_id' => $employeeId,
                    'document_type' => $documentType,
                    'file_path' => $relativePath
                ]);
                
                $id = $this->conn->lastInsertId();
                AuditLogger::log("Uploaded document ({$documentType}) for employee ID: {$employeeId}");
                
                echo json_encode([
                    "success" => true,
                    "message" => "Document uploaded successfully",
                    "data" => [
                        "id" => $id,
                        "document_type" => $documentType,
                        "file_path" => $relativePath
                    ]
                ]);
            } catch (\PDOException $e) {
                unlink($filepath); // Remove file if DB insert fails
                echo json_encode(["success" => false, "message" => "Database error: Failed to save document record"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload file"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::check();
        
        $userRole = $GLOBALS['user']->role ?? '';
        $currentEmployeeId = $GLOBALS['user']->employee_id ?? null;
        
        try {
            $stmt = $this->conn->prepare("SELECT * FROM documents WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $document = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$document) {
                echo json_encode(["success" => false, "message" => "Document not found"]);
                return;
            }

            if ($userRole === 'Employee' && $currentEmployeeId != $document['employee_id']) {
                echo json_encode(["success" => false, "message" => "Access denied"]);
                return;
            }

            // Delete file from disk
            $fullPath = __DIR__ . '/../' . $document['file_path'];
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            // Delete from DB
            $stmt = $this->conn->prepare("DELETE FROM documents WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            AuditLogger::log("Deleted document ID: {$id} for employee ID: {$document['employee_id']}");

            echo json_encode([
                "success" => true,
                "message" => "Document deleted successfully"
            ]);
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Failed to delete document"]);
        }
    }
}
