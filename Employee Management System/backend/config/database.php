<?php

namespace Config;

use PDO;
use PDOException;

class Database {
    private $host = "localhost";
    private $db_name = "ems_db";
    private $username = "root";
    private $password = "sreelakam5070";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo json_encode(["success" => false, "message" => "Database connection error: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
