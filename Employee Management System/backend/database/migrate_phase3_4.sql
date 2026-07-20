-- 6. Performance Management Tables

CREATE TABLE IF NOT EXISTS performance_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period VARCHAR(100) NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comments TEXT NOT NULL,
    status ENUM('Draft', 'Submitted', 'Acknowledged') DEFAULT 'Submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

-- 7. Recruitment Management Tables

CREATE TABLE IF NOT EXISTS job_postings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    department_id INT,
    description TEXT NOT NULL,
    status ENUM('Open', 'Closed', 'Draft') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    resume_path VARCHAR(255) NULL,
    status ENUM('Applied', 'Interviewing', 'Offered', 'Hired', 'Rejected') DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_postings(id)
);
