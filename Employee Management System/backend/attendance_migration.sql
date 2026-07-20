ALTER TABLE attendance 
ADD COLUMN break_started_at DATETIME NULL, 
ADD COLUMN total_break_duration INT DEFAULT 0, 
ADD COLUMN overtime_hours DECIMAL(5,2) DEFAULT 0.00, 
ADD COLUMN remarks VARCHAR(255) NULL;

CREATE TABLE attendance_corrections ( 
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    attendance_id BIGINT NULL, 
    employee_id INT NOT NULL, 
    date DATE NOT NULL, 
    requested_check_in DATETIME NULL, 
    requested_check_out DATETIME NULL, 
    reason TEXT, 
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending', 
    manager_id INT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
