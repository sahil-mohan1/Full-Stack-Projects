
CREATE TABLE IF NOT EXISTS shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_time INT NOT NULL DEFAULT 0,
    weekly_off ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'None') DEFAULT 'Sunday',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holidays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL UNIQUE,
    type ENUM('Public', 'Optional') DEFAULT 'Public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE employees ADD COLUMN shift_id INT DEFAULT NULL;
ALTER TABLE employees ADD CONSTRAINT fk_employee_shift FOREIGN KEY (shift_id) REFERENCES shifts(id);

ALTER TABLE attendance MODIFY status ENUM('Present', 'Absent', 'Half Day', 'Late', 'Early Exit', 'Work From Home', 'On Leave', 'Holiday', 'Weekend', 'Missed Check-In', 'Missed Check-Out') NOT NULL;
