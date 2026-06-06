CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS provider_matches;
DROP TABLE IF EXISTS manga_cache;

CREATE TABLE manga_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anilist_id INTEGER NOT NULL UNIQUE,
  title JSONB NOT NULL,
  type VARCHAR(20) NOT NULL,
  format VARCHAR(50),
  status VARCHAR(50),
  description TEXT,
  synonyms JSONB,
  cover_image_url TEXT,
  cover_image_data BYTEA,
  cover_image_mime VARCHAR(50),
  average_score INTEGER,
  mean_score INTEGER,
  popularity INTEGER,
  favourites INTEGER,
  chapters INTEGER,
  volumes INTEGER,
  genres JSONB,
  external_links JSONB,
  country_of_origin VARCHAR(10),
  source VARCHAR(50),
  is_adult BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (type IN ('ANIME', 'MANGA'))
);

CREATE TABLE provider_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_id UUID REFERENCES manga_cache(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  provider_data JSONB,
  chapters_count INTEGER,
  confidence DECIMAL(3,2),
  last_fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cache_id, provider_name)
);

CREATE INDEX idx_anilist_id ON manga_cache(anilist_id);
CREATE INDEX idx_type ON manga_cache(type);
CREATE INDEX idx_avg_score ON manga_cache(average_score);
CREATE INDEX idx_popularity ON manga_cache(popularity);
CREATE INDEX idx_cache_provider ON provider_matches(provider_name, provider_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manga_cache_updated
  BEFORE UPDATE ON manga_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_matches_updated
  BEFORE UPDATE ON provider_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
