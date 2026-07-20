<?php
/**
 * Cron Script to Process Daily Attendance
 * 
 * Should be run at the end of the day (e.g. 23:55).
 * It marks:
 * - 'Absent' for active employees who haven't checked in and are not on leave.
 * - 'Missed Check-Out' for employees who checked in but didn't check out.
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

$db = new Database();
$conn = $db->getConnection();

if (!$conn) {
    die("Database connection failed.\n");
}

$date = date('Y-m-d');
$dayOfWeek = date('l');

try {
    $conn->beginTransaction();

    // 1. Mark 'Missed Check-Out'
    $updateMissed = $conn->prepare("
        UPDATE attendance 
        SET status = 'Missed Check-Out' 
        WHERE date = :date 
        AND check_out IS NULL 
        AND status NOT IN ('Holiday', 'Weekend', 'On Leave', 'Half Day')
    ");
    $updateMissed->execute(['date' => $date]);
    $missedCount = $updateMissed->rowCount();
    echo "Marked $missedCount employees as Missed Check-Out.\n";

    // 2. Find Absent Employees
    // Active employees who do not have an attendance record for today.
    $stmt = $conn->prepare("
        SELECT e.id, e.shift_id, s.weekly_off 
        FROM employees e
        LEFT JOIN shifts s ON e.shift_id = s.id
        WHERE e.status = 'Active' 
        AND e.id NOT IN (SELECT employee_id FROM attendance WHERE date = :date)
    ");
    $stmt->execute(['date' => $date]);
    $employeesWithoutAttendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check if today is a global holiday
    $holidayStmt = $conn->prepare("SELECT id FROM holidays WHERE date = :date");
    $holidayStmt->execute(['date' => $date]);
    $isHoliday = $holidayStmt->fetch();

    $absentCount = 0;
    $insertStmt = $conn->prepare("
        INSERT INTO attendance (employee_id, date, status) 
        VALUES (:emp_id, :date, :status)
    ");

    foreach ($employeesWithoutAttendance as $emp) {
        $status = 'Absent';

        // Check if on leave today
        // Assuming leave_requests handles dates correctly, we can check overlap
        $leaveStmt = $conn->prepare("
            SELECT leave_type, half_day FROM leave_requests 
            WHERE employee_id = :emp_id 
            AND status = 'Approved' 
            AND :date BETWEEN start_date AND end_date
        ");
        $leaveStmt->execute(['emp_id' => $emp['id'], 'date' => $date]);
        $leave = $leaveStmt->fetch(PDO::FETCH_ASSOC);

        if ($leave) {
            $status = $leave['half_day'] !== 'None' ? 'Half Day' : 'On Leave';
        } elseif ($isHoliday) {
            $status = 'Holiday';
        } elseif ($emp['weekly_off'] === $dayOfWeek) {
            $status = 'Weekend';
        }

        $insertStmt->execute([
            'emp_id' => $emp['id'],
            'date' => $date,
            'status' => $status
        ]);
        
        if ($status === 'Absent') {
            $absentCount++;
        }
    }

    echo "Inserted " . count($employeesWithoutAttendance) . " new attendance records. ($absentCount marked as Absent).\n";

    $conn->commit();
    echo "Daily attendance processing completed successfully.\n";

} catch (Exception $e) {
    $conn->rollBack();
    echo "Error processing daily attendance: " . $e->getMessage() . "\n";
}
