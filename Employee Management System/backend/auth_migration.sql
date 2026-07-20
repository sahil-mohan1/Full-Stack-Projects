ALTER TABLE ems_db.users 
ADD COLUMN failed_login_attempts INT DEFAULT 0 AFTER password_hash,
ADD COLUMN locked_until DATETIME NULL AFTER failed_login_attempts;

CREATE TABLE ems_db.token_blocklist (
    token VARCHAR(512) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
