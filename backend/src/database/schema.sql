-- Restaurant status tracking database schema

-- Table to store each status check
CREATE TABLE IF NOT EXISTS status_checks (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_open BOOLEAN NOT NULL,
    response_time INTEGER, -- in milliseconds
    error_message TEXT,
    page_content TEXT -- snippet of relevant page content
);

-- Table to store daily events (opened late, closed early, etc.)
CREATE TABLE IF NOT EXISTS daily_events (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'fully_open', 'opened_late', 'closed_early', 'never_opened', 'outside_hours'
    expected_open_time TIME NOT NULL, -- 16:00
    expected_close_time TIME NOT NULL, -- 23:00
    actual_open_time TIME,
    actual_close_time TIME,
    details JSONB, -- additional details about the event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, event_type)
);

-- Table to store restaurant configuration
CREATE TABLE IF NOT EXISTS restaurant_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'I Love Pastel',
    url VARCHAR(500) NOT NULL,
    closed_indicator TEXT NOT NULL DEFAULT 'Loja fechada',
    check_interval_minutes INTEGER NOT NULL DEFAULT 15,
    -- Schedule: 0 = Sunday, 1 = Monday, etc.
    operating_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6}', -- Mon-Sat (Thu-Tue)
    open_time TIME NOT NULL DEFAULT '16:00',
    close_time TIME NOT NULL DEFAULT '23:00',
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO restaurant_config (url, closed_indicator, operating_days)
VALUES (
    'https://pedido.anota.ai/loja/ilovepastel',
    'Loja fechada',
    '{1,2,3,4,5,6}' -- Monday through Saturday (Thu-Tue)
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_status_checks_is_open ON status_checks(is_open);
CREATE INDEX IF NOT EXISTS idx_daily_events_date ON daily_events(date);
CREATE INDEX IF NOT EXISTS idx_daily_events_type ON daily_events(event_type);