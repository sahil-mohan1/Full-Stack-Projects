<?php
// entry point
require_once __DIR__ . '/../vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$router = new \Bramus\Router\Router();

$router->get('/', function() {
    echo json_encode(["success" => true, "message" => "EMS API is running"]);
});

// Auth Routes
$router->mount('/api', function() use ($router) {
    $router->post('/login', 'Controllers\AuthController@login');
$router->post('/logout', 'Controllers\\AuthController@logout');
    $router->post('/forgot-password', 'Controllers\AuthController@forgotPassword');

    // Departments
    $router->get('/departments', 'Controllers\DepartmentController@index');
    $router->post('/departments', 'Controllers\DepartmentController@store');
    $router->put('/departments/(\d+)', 'Controllers\DepartmentController@update');
    $router->delete('/departments/(\d+)', 'Controllers\DepartmentController@delete');

    // Designations
    $router->get('/designations', 'Controllers\DesignationController@index');
    $router->post('/designations', 'Controllers\DesignationController@store');
    $router->put('/designations/(\d+)', 'Controllers\DesignationController@update');
    $router->delete('/designations/(\d+)', 'Controllers\DesignationController@delete');

    // Employees
    $router->get('/employees', 'Controllers\EmployeeController@index');
    $router->get('/employees/export', 'Controllers\EmployeeController@export');
    $router->post('/employees/import', 'Controllers\EmployeeController@import');
    $router->get('/employees/(\d+)', 'Controllers\EmployeeController@show');
    $router->post('/employees', 'Controllers\EmployeeController@store');
    $router->put('/employees/(\d+)', 'Controllers\EmployeeController@update');
    $router->delete('/employees/(\d+)', 'Controllers\EmployeeController@delete');

    // Attendance
    $router->post('/attendance/check-in', 'Controllers\AttendanceController@checkIn');
    $router->post('/attendance/check-out', 'Controllers\AttendanceController@checkOut');
    $router->post('/attendance/break/start', 'Controllers\AttendanceController@startBreak');
    $router->post('/attendance/break/end', 'Controllers\AttendanceController@endBreak');
    $router->post('/attendance/corrections', 'Controllers\AttendanceController@requestCorrection');
    $router->get('/attendance/corrections', 'Controllers\AttendanceController@getCorrections');
    $router->put('/attendance/corrections/(\d+)/status', 'Controllers\AttendanceController@updateCorrectionStatus');
    $router->post('/attendance/manual', 'Controllers\AttendanceController@manualAttendance');
    $router->get('/attendance/my', 'Controllers\AttendanceController@myAttendance');
    $router->get('/attendance/all', 'Controllers\AttendanceController@allAttendance');

    // Leave
    $router->post('/leave/apply', 'Controllers\LeaveController@apply');
    $router->get('/leave/my', 'Controllers\LeaveController@myLeaves');
    $router->get('/leave/all', 'Controllers\LeaveController@allLeaves');
    $router->put('/leave/(\d+)/status', 'Controllers\LeaveController@updateStatus');
    $router->put('/leave/(\d+)/cancel', 'Controllers\LeaveController@cancelLeave');

    // Documents
    $router->post('/documents/upload', 'Controllers\DocumentController@upload');
    $router->get('/documents/employee/(\d+)', 'Controllers\DocumentController@getByEmployee');
    $router->delete('/documents/(\d+)', 'Controllers\DocumentController@delete');

    // Shifts
    $router->get('/shifts', 'Controllers\ShiftController@index');
    $router->post('/shifts', 'Controllers\ShiftController@store');
    $router->put('/shifts/bulk-assign', 'Controllers\ShiftController@bulkAssign');
    $router->put('/shifts/(\d+)', 'Controllers\ShiftController@update');
    $router->delete('/shifts/(\d+)', 'Controllers\ShiftController@delete');

    // Holidays
    $router->get('/holidays', 'Controllers\HolidayController@index');
    $router->post('/holidays', 'Controllers\HolidayController@store');
    $router->put('/holidays/(\d+)', 'Controllers\HolidayController@update');
    $router->delete('/holidays/(\d+)', 'Controllers\HolidayController@delete');

    // Announcements
    $router->get('/announcements', 'Controllers\AnnouncementController@index');
    $router->post('/announcements', 'Controllers\AnnouncementController@store');
    $router->put('/announcements/(\d+)', 'Controllers\AnnouncementController@update');
    $router->delete('/announcements/(\d+)', 'Controllers\AnnouncementController@delete');

    // Assets
    $router->get('/assets', 'Controllers\AssetController@index');
    $router->post('/assets', 'Controllers\AssetController@store');
    $router->put('/assets/(\d+)', 'Controllers\AssetController@update');
    $router->delete('/assets/(\d+)', 'Controllers\AssetController@delete');

    // Audit Logs
    $router->get('/audit-logs', 'Controllers\AuditLogController@index');

    // Dashboard
    $router->get('/dashboard/summary', 'Controllers\DashboardController@summary');

    // Users
    $router->get('/users', 'Controllers\UserController@index');
    $router->put('/users/(\d+)', 'Controllers\UserController@update');
    $router->get('/roles', 'Controllers\UserController@getRoles');

    // Settings
    $router->get('/settings', 'Controllers\SettingController@index');
    $router->post('/settings', 'Controllers\SettingController@update');

    // Payroll
    $router->get('/payroll', 'Controllers\PayrollController@index');
    $router->post('/payroll/generate', 'Controllers\PayrollController@generate');
    $router->put('/payroll/(\d+)/pay', 'Controllers\PayrollController@markPaid');

    // Performance
    $router->get('/performance', 'Controllers\PerformanceController@index');
    $router->post('/performance', 'Controllers\PerformanceController@store');
    $router->put('/performance/(\d+)', 'Controllers\PerformanceController@update');
    $router->delete('/performance/(\d+)', 'Controllers\PerformanceController@delete');

    // Recruitment
    $router->get('/jobs', 'Controllers\RecruitmentController@indexJobs');
    $router->post('/jobs', 'Controllers\RecruitmentController@storeJob');
    $router->put('/jobs/(\d+)', 'Controllers\RecruitmentController@updateJob');
    
    $router->get('/candidates', 'Controllers\RecruitmentController@indexCandidates');
    $router->post('/candidates', 'Controllers\RecruitmentController@storeCandidate');
    $router->put('/candidates/(\d+)/status', 'Controllers\RecruitmentController@updateCandidateStatus');

    // Notifications
    $router->get('/notifications', 'Controllers\NotificationController@index');
    $router->put('/notifications/(\d+)/read', 'Controllers\NotificationController@markAsRead');
    $router->put('/notifications/read-all', 'Controllers\NotificationController@markAllAsRead');

    // Reports
    $router->get('/reports/summary', 'Controllers\ReportController@getSummary');
});

$router->run();
