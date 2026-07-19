<?php
require_once __DIR__ . '/backend/vendor/autoload.php';
require_once __DIR__ . '/backend/config/database.php';

use Config\Database;

$db = new Database();
$conn = $db->getConnection();

if ($conn) {
    echo "Database connection successful!\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Found " . count($tables) . " tables in ems_db:\n";
    foreach ($tables as $table) {
        echo "- $table\n";
    }
} else {
    echo "Failed to connect. Please check your database.php credentials.\n";
}
