CREATE TABLE platform_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platform_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    platform_job_id VARCHAR(100),
    company VARCHAR(255),
    position VARCHAR(255),
    status VARCHAR(50),
    date_applied DATE,
    notes TEXT,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 