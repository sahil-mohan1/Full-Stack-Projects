<?php
namespace Controllers;

use Config\Database;
use Middleware\AuthMiddleware;
use PDO;

class AttendanceController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    private function getEmployeeData($userId) {
        $stmt = $this->conn->prepare("
            SELECT e.id, e.shift_id, s.start_time, s.end_time, s.grace_time, s.weekly_off 
            FROM employees e
            LEFT JOIN shifts s ON e.shift_id = s.id
            WHERE e.user_id = :user_id
        ");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function isHoliday($date) {
        $stmt = $this->conn->prepare("SELECT id, type FROM holidays WHERE date = :date");
        $stmt->execute(['date' => $date]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function checkIn() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employee = $this->getEmployeeData($userId);
        if (!$employee || !$employee['id']) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $employeeId = $employee['id'];
        $date = date('Y-m-d');
        $now = date('Y-m-d H:i:s');
        $currentTime = date('H:i:s');
        $dayOfWeek = date('l'); // e.g., 'Sunday', 'Monday'

        // Check if already checked in today
        $stmt = $this->conn->prepare("SELECT id FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employeeId, 'date' => $date]);
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Already checked in today"]);
            return;
        }

        // Determine Status
        $status = 'Present';

        // 1. Check Holiday
        $holiday = $this->isHoliday($date);
        if ($holiday) {
            $status = 'Holiday';
        }
        // 2. Check Weekend
        elseif ($employee['weekly_off'] === $dayOfWeek) {
            $status = 'Weekend';
        }
        // 3. Check Late
        elseif ($employee['start_time']) {
            $expectedStartTime = strtotime($employee['start_time']);
            $actualTime = strtotime($currentTime);
            $graceTime = (int)$employee['grace_time'] * 60; // Convert to seconds

            if ($actualTime > ($expectedStartTime + $graceTime)) {
                $status = 'Late';
            }
        }

        $data = json_decode(file_get_contents("php://input"));
        $location = $data->location ?? null;
        $deviceInfo = $data->device_info ?? null;

        $insert = $this->conn->prepare("INSERT INTO attendance (employee_id, date, check_in, location, device_info, status) VALUES (:emp_id, :date, :check_in, :location, :device_info, :status)");
        if ($insert->execute([
            'emp_id' => $employeeId, 
            'date' => $date, 
            'check_in' => $now,
            'location' => $location,
            'device_info' => $deviceInfo,
            'status' => $status
        ])) {
            echo json_encode(["success" => true, "message" => "Checked in successfully", "time" => $now, "status" => $status]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to check in"]);
        }
    }

        public function checkOut() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employee = $this->getEmployeeData($userId);
        if (!$employee || !$employee['id']) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $employeeId = $employee['id'];
        $date = date('Y-m-d');
        $now = date('Y-m-d H:i:s');
        $currentTime = date('H:i:s');

        // Get today's attendance record
        $stmt = $this->conn->prepare("SELECT id, check_in, check_out, status, total_break_duration FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employeeId, 'date' => $date]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            echo json_encode(["success" => false, "message" => "No check-in record found for today"]);
            return;
        }

        if ($record['check_out']) {
            echo json_encode(["success" => false, "message" => "Already checked out today"]);
            return;
        }

        $status = $record['status'];
        
        // Check Early Exit if not already Holiday/Weekend
        if (!in_array($status, ['Holiday', 'Weekend']) && $employee['end_time']) {
            $expectedEndTime = strtotime($employee['end_time']);
            $actualTime = strtotime($currentTime);
            if ($actualTime < $expectedEndTime) {
                $status = 'Early Exit';
            }
        }

        // Calculate total hours
        $checkInTime = strtotime($record['check_in']);
        $checkOutTime = strtotime($now);
        $breakDurationMinutes = $record['total_break_duration'] ?? 0;
        
        $netWorkingSeconds = ($checkOutTime - $checkInTime) - ($breakDurationMinutes * 60);
        $totalHours = max(0, round($netWorkingSeconds / 3600, 2));
        
        $overtimeHours = 0;
        if ($totalHours > 8) {
            $overtimeHours = $totalHours - 8;
        }

        $update = $this->conn->prepare("UPDATE attendance SET check_out = :check_out, total_hours = :hours, overtime_hours = :overtime, status = :status WHERE id = :id");
        if ($update->execute([
            'check_out' => $now, 
            'hours' => $totalHours, 
            'overtime' => $overtimeHours,
            'status' => $status,
            'id' => $record['id']
        ])) {
            echo json_encode(["success" => true, "message" => "Checked out successfully", "time" => $now, "total_hours" => $totalHours, "overtime" => $overtimeHours, "status" => $status]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to check out"]);
        }
    }

    public function myAttendance() {
        AuthMiddleware::check();
        $userId = $GLOBALS['user']->id;

        $employee = $this->getEmployeeData($userId);
        if (!$employee || !$employee['id']) {
            echo json_encode(["success" => false, "message" => "Employee profile not found"]);
            return;
        }

        $employeeId = $employee['id'];

        $stmt = $this->conn->prepare("SELECT * FROM attendance WHERE employee_id = :emp_id ORDER BY date DESC");
        $stmt->execute(['emp_id' => $employeeId]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }

    public function allAttendance() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        
        $sql = "SELECT a.*, e.first_name, e.last_name, e.employee_code 
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                ORDER BY a.date DESC, a.check_in DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }


    public function startBreak() {
        AuthMiddleware::check();
        $employee = $this->getEmployeeData($GLOBALS['user']->id);
        if (!$employee) { echo json_encode(["success" => false, "message" => "Not found"]); return; }
        
        $date = date('Y-m-d');
        $stmt = $this->conn->prepare("SELECT id, break_started_at, check_out FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employee['id'], 'date' => $date]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) { echo json_encode(["success" => false, "message" => "Please check in first"]); return; }
        if ($record['check_out']) { echo json_encode(["success" => false, "message" => "Already checked out"]); return; }
        if ($record['break_started_at']) { echo json_encode(["success" => false, "message" => "Break already started"]); return; }

        $now = date('Y-m-d H:i:s');
        $update = $this->conn->prepare("UPDATE attendance SET break_started_at = :now WHERE id = :id");
        if ($update->execute(['now' => $now, 'id' => $record['id']])) {
            echo json_encode(["success" => true, "message" => "Break started successfully", "time" => $now]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to start break"]);
        }
    }

    public function endBreak() {
        AuthMiddleware::check();
        $employee = $this->getEmployeeData($GLOBALS['user']->id);
        if (!$employee) { echo json_encode(["success" => false, "message" => "Not found"]); return; }
        
        $date = date('Y-m-d');
        $stmt = $this->conn->prepare("SELECT id, break_started_at, total_break_duration FROM attendance WHERE employee_id = :emp_id AND date = :date");
        $stmt->execute(['emp_id' => $employee['id'], 'date' => $date]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record || !$record['break_started_at']) { 
            echo json_encode(["success" => false, "message" => "No active break found"]); 
            return; 
        }

        $breakStart = strtotime($record['break_started_at']);
        $now = time();
        $durationMinutes = round(($now - $breakStart) / 60);
        $newTotal = ($record['total_break_duration'] ?? 0) + $durationMinutes;

        $update = $this->conn->prepare("UPDATE attendance SET break_started_at = NULL, total_break_duration = :total WHERE id = :id");
        if ($update->execute(['total' => $newTotal, 'id' => $record['id']])) {
            echo json_encode(["success" => true, "message" => "Break ended successfully", "total_break_duration" => $newTotal]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to end break"]);
        }
    }

    public function requestCorrection() {
        AuthMiddleware::check();
        $employee = $this->getEmployeeData($GLOBALS['user']->id);
        if (!$employee) { echo json_encode(["success" => false, "message" => "Not found"]); return; }
        
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->date) || empty($data->reason)) {
            echo json_encode(["success" => false, "message" => "Date and reason are required"]); return;
        }

        $stmt = $this->conn->prepare("SELECT id FROM attendance WHERE employee_id = :emp AND date = :date");
        $stmt->execute(['emp' => $employee['id'], 'date' => $data->date]);
        $att = $stmt->fetch(PDO::FETCH_ASSOC);
        $attId = $att ? $att['id'] : null;

        $insert = $this->conn->prepare("INSERT INTO attendance_corrections (attendance_id, employee_id, date, requested_check_in, requested_check_out, reason) VALUES (:att_id, :emp, :date, :in, :out, :reason)");
        if ($insert->execute([
            'att_id' => $attId,
            'emp' => $employee['id'],
            'date' => $data->date,
            'in' => $data->check_in ?? null,
            'out' => $data->check_out ?? null,
            'reason' => $data->reason
        ])) {
            echo json_encode(["success" => true, "message" => "Correction request submitted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to submit request"]);
        }
    }

    public function getCorrections() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        $sql = "SELECT c.*, e.first_name, e.last_name, e.employee_code 
                FROM attendance_corrections c
                JOIN employees e ON c.employee_id = e.id
                ORDER BY c.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function updateCorrectionStatus($id) {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR', 'Manager']);
        $data = json_decode(file_get_contents("php://input"));
        $status = $data->status;
        
        if (!in_array($status, ['Approved', 'Rejected'])) {
            echo json_encode(["success" => false, "message" => "Invalid status"]); return;
        }

        try {
            $this->conn->beginTransaction();
            $stmt = $this->conn->prepare("UPDATE attendance_corrections SET status = :status, manager_id = :mgr WHERE id = :id");
            $stmt->execute(['status' => $status, 'mgr' => $GLOBALS['user']->id, 'id' => $id]);

            if ($status === 'Approved') {
                $sel = $this->conn->prepare("SELECT * FROM attendance_corrections WHERE id = :id");
                $sel->execute(['id' => $id]);
                $req = $sel->fetch(PDO::FETCH_ASSOC);

                if ($req['attendance_id']) {
                    $upd = $this->conn->prepare("UPDATE attendance SET check_in = COALESCE(:in, check_in), check_out = COALESCE(:out, check_out), remarks = :remarks WHERE id = :att_id");
                    $upd->execute([
                        'in' => $req['requested_check_in'],
                        'out' => $req['requested_check_out'],
                        'remarks' => "Correction Approved: " . $req['reason'],
                        'att_id' => $req['attendance_id']
                    ]);
                } else {
                    $ins = $this->conn->prepare("INSERT INTO attendance (employee_id, date, check_in, check_out, status, remarks) VALUES (:emp, :date, :in, :out, 'Present', :remarks)");
                    $ins->execute([
                        'emp' => $req['employee_id'],
                        'date' => $req['date'],
                        'in' => $req['requested_check_in'],
                        'out' => $req['requested_check_out'],
                        'remarks' => "Correction Approved: " . $req['reason']
                    ]);
                }
            }
            $this->conn->commit();
            echo json_encode(["success" => true, "message" => "Correction $status successfully"]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["success" => false, "message" => "Failed to update correction"]);
        }
    }

    public function manualAttendance() {
        AuthMiddleware::requireRole(['Super Admin', 'HR Admin', 'HR']);
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->employee_id) || empty($data->date)) {
            echo json_encode(["success" => false, "message" => "Employee and Date are required"]); return;
        }

        $stmt = $this->conn->prepare("SELECT id FROM attendance WHERE employee_id = :emp AND date = :date");
        $stmt->execute(['emp' => $data->employee_id, 'date' => $data->date]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $upd = $this->conn->prepare("UPDATE attendance SET check_in = :in, check_out = :out, status = :status, remarks = :remarks WHERE id = :id");
            $upd->execute([
                'in' => $data->check_in ?? null,
                'out' => $data->check_out ?? null,
                'status' => $data->status ?? 'Present',
                'remarks' => $data->remarks ?? 'Manual Update',
                'id' => $existing['id']
            ]);
        } else {
            $ins = $this->conn->prepare("INSERT INTO attendance (employee_id, date, check_in, check_out, status, remarks) VALUES (:emp, :date, :in, :out, :status, :remarks)");
            $ins->execute([
                'emp' => $data->employee_id,
                'date' => $data->date,
                'in' => $data->check_in ?? null,
                'out' => $data->check_out ?? null,
                'status' => $data->status ?? 'Present',
                'remarks' => $data->remarks ?? 'Manual Entry'
            ]);
        }

        // Add to audit log
        $audit = $this->conn->prepare("INSERT INTO audit_logs (user_id, action) VALUES (:uid, :action)");
        $audit->execute([
            'uid' => $GLOBALS['user']->id, 
            'action' => "Manual attendance update for Employee ID: {$data->employee_id} on {$data->date}. Remarks: {$data->remarks}"
        ]);

        echo json_encode(["success" => true, "message" => "Attendance updated manually"]);
    }

}
