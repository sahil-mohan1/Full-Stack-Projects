<?php
// entry point
require_once __DIR__ . '/../vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$router = new \Bramus\Router\Router();

$router->get('/', function() {
    echo json_encode(["success" => true, "message" => "EMS API is running"]);
});

// Auth Routes
$router->mount('/api', function() use ($router) {
    $router->post('/login', 'Controllers\AuthController@login');
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
    $router->get('/employees/(\d+)', 'Controllers\EmployeeController@show');
    $router->post('/employees', 'Controllers\EmployeeController@store');

    // Attendance
    $router->post('/attendance/check-in', 'Controllers\AttendanceController@checkIn');
    $router->post('/attendance/check-out', 'Controllers\AttendanceController@checkOut');
    $router->get('/attendance/my', 'Controllers\AttendanceController@myAttendance');
    $router->get('/attendance/all', 'Controllers\AttendanceController@allAttendance');

    // Leave
    $router->post('/leave/apply', 'Controllers\LeaveController@apply');
    $router->get('/leave/my', 'Controllers\LeaveController@myLeaves');
    $router->get('/leave/all', 'Controllers\LeaveController@allLeaves');
    $router->put('/leave/(\d+)/status', 'Controllers\LeaveController@updateStatus');
});

$router->run();
