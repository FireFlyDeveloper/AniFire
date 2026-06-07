-- AniFire Request Tracking Schema (Corrected for Existing Tables)
-- Add columns for tracking user requests and update priority

-- The table structure uses 'anilist_id' instead of 'key'
-- So we need to adjust our queries accordingly

-- Update manga_cache table for request tracking (most columns already exist)
-- Verify current columns are set correctly
ALTER TABLE manga_cache
  ALTER COLUMN request_count SET DEFAULT 0,
  ALTER COLUMN recent_requests SET DEFAULT 0,
  ALTER COLUMN update_priority SET DEFAULT 1.0,
  ALTER COLUMN update_frequency SET DEFAULT 24.0;

-- Create additional indexes for request tracking
CREATE INDEX IF NOT EXISTS idx_update_priority
ON manga_cache(update_priority DESC, updated_at);

-- Track request history (last 24-30 days for analytics)
CREATE TABLE IF NOT EXISTS request_history (
  id SERIAL PRIMARY KEY,
  anilist_id INTEGER NOT NULL,
  endpoint VARCHAR(50),
  user_ip VARCHAR(50),
  request_time TIMESTAMP DEFAULT NOW(),
  duration_ms INTEGER,
  FOREIGN KEY (anilist_id) REFERENCES manga_cache(anilist_id) ON DELETE CASCADE
);

-- Index for efficient request history queries
CREATE INDEX IF NOT EXISTS idx_request_history_item_time
ON request_history(anilist_id, request_time DESC);

CREATE INDEX IF NOT EXISTS idx_request_history_time
ON request_history(request_time DESC);

-- Track update statistics for adaptive frequency learning
CREATE TABLE IF NOT EXISTS update_statistics (
  id SERIAL PRIMARY KEY,
  anilist_id INTEGER UNIQUE NOT NULL,
  update_count INTEGER DEFAULT 0,
  last_update_time TIMESTAMP,
  first_update_time TIMESTAMP,
  average_update_interval FLOAT,
  last_chapter_count INTEGER,
  total_requests INTEGER DEFAULT 0,
  active_readers INTEGER DEFAULT 0
);

-- Track update history for learning and analytics
CREATE TABLE IF NOT EXISTS update_history (
  id SERIAL PRIMARY KEY,
  anilist_id INTEGER NOT NULL,
  update_time TIMESTAMP DEFAULT NOW(),
  chapter_count INTEGER,
  change_detected BOOLEAN,
  update_duration_ms INTEGER,
  FOREIGN KEY (anilist_id) REFERENCES manga_cache(anilist_id) ON DELETE CASCADE
);

-- Index for update history queries
CREATE INDEX IF NOT EXISTS idx_update_history_item_time
ON update_history(anilist_id, update_time DESC);

CREATE INDEX IF NOT EXISTS idx_update_history_time
ON update_history(update_time DESC)
WHERE change_detected = TRUE;

-- Cleanup old history (keep 30 days)
-- Run this daily as a maintenance task
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS void AS $$
BEGIN
  DELETE FROM request_history
  WHERE request_time < NOW() - INTERVAL '30 days';

  DELETE FROM update_history
  WHERE update_time < NOW() - INTERVAL '90 days';

  -- Log cleanup
  RAISE NOTICE 'History cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment tables for documentation
COMMENT ON TABLE request_history IS 'Tracks user requests for analytics and priority calculation (30-day retention)';
COMMENT ON TABLE update_statistics IS 'Learns update patterns to optimize update frequency';
COMMENT ON TABLE update_history IS 'Tracks actual update events for pattern learning (90-day retention)';
