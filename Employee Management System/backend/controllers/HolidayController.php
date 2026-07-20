<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class HolidayController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function index() {
        AuthMiddleware::check();
        $stmt = $this->conn->prepare("SELECT * FROM holidays ORDER BY date ASC");
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
    }

    public function store() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->date)) {
            echo json_encode(["success" => false, "message" => "Name and Date are required"]);
            return;
        }

        $type = $data->type ?? 'Public';

        $sql = "INSERT INTO holidays (name, date, type) VALUES (:name, :date, :type)";
        $stmt = $this->conn->prepare($sql);
        try {
            if ($stmt->execute([
                'name' => $data->name,
                'date' => $data->date,
                'type' => $type
            ])) {
                echo json_encode(["success" => true, "message" => "Holiday created successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to create holiday"]);
            }
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Error: Holiday already exists on this date"]);
        }
    }

    public function update($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->date)) {
            echo json_encode(["success" => false, "message" => "Name and Date are required"]);
            return;
        }

        $type = $data->type ?? 'Public';

        $sql = "UPDATE holidays SET name = :name, date = :date, type = :type WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        try {
            if ($stmt->execute([
                'name' => $data->name,
                'date' => $data->date,
                'type' => $type,
                'id' => $id
            ])) {
                echo json_encode(["success" => true, "message" => "Holiday updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update holiday"]);
            }
        } catch (\PDOException $e) {
            echo json_encode(["success" => false, "message" => "Error: Holiday already exists on this date"]);
        }
    }

    public function delete($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin']);
        $stmt = $this->conn->prepare("DELETE FROM holidays WHERE id = :id");
        if ($stmt->execute(['id' => $id])) {
            echo json_encode(["success" => true, "message" => "Holiday deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete holiday"]);
        }
    }
}
