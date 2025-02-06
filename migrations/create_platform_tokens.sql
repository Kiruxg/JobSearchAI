CREATE TABLE platform_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform)
);

-- Add indexes
CREATE INDEX idx_platform_tokens_user_platform ON platform_tokens(user_id, platform);
CREATE INDEX idx_platform_tokens_expires_at ON platform_tokens(expires_at); 