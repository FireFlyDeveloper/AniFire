# PostgreSQL Permanent Storage Architecture

## Overview

PostgreSQL is the **permanent storage layer** for AniFire, providing persistent, reliable storage for all anime/manga data and cover images.

## Storage Components

### 1. Primary Tables

#### `manga_cache` (Main Storage)
Stores complete media metadata and binary cover images:

```sql
CREATE TABLE manga_cache (
  id UUID PRIMARY KEY,
  anilist_id INTEGER NOT NULL UNIQUE,  -- AniList ID (unique identifier)
  title JSONB NOT NULL,                -- Full title (romaji, english, native)
  type VARCHAR(20) NOT NULL,           -- ANIME or MANGA
  format VARCHAR(50),                  -- TV, MANGA, NOVEL, etc.
  status VARCHAR(50),                  -- FINISHED, RELEASING, etc.
  description TEXT,                    -- Full description
  synonyms JSONB,                      -- Alternative titles
  cover_image_url TEXT,                -- Original image URL
  cover_image_data BYTEA,              -- ⭐ BINARY IMAGE DATA (permanent)
  cover_image_mime VARCHAR(50),        -- image/jpeg, image/png, etc.
  average_score INTEGER,               -- User ratings
  mean_score INTEGER,                  -- Mean rating
  popularity INTEGER,                  -- Popularity score
  favourites INTEGER,                  -- User favorites
  chapters INTEGER,                    -- Chapter count (for manga)
  volumes INTEGER,                     -- Volume count (for manga)
  genres JSONB,                        -- Genre list
  external_links JSONB,                -- Streaming/platform links
  country_of_origin VARCHAR(10),       -- JP, CN, KR, etc.
  source VARCHAR(50),                  -- Source material
  is_adult BOOLEAN,                    -- Adult content flag
  created_at TIMESTAMP,                -- When first cached
  updated_at TIMESTAMP,                -- Last update time
  CONSTRAINT valid_type CHECK (type IN ('ANIME', 'MANGA'))
);
```

**Key Permanent Storage Features:**
- ✅ **Binary image storage**: Cover images stored permanently as BYTEA
- ✅ **Complete metadata**: All AniList data persists permanently
- ✅ **Unique indexing**: AniList ID ensures no duplicates
- ✅ **Auto-updates**: `updated_at` triggers track freshness

#### `provider_matches` (Provider Linking)
Links cached media to external providers (Topmanhua, etc.):

```sql
CREATE TABLE provider_matches (
  id UUID PRIMARY KEY,
  cache_id UUID REFERENCES manga_cache(id),  -- Links to manga_cache
  provider_name VARCHAR(50) NOT NULL,         -- topmanhua, 9anime, etc.
  provider_id VARCHAR(255) NOT NULL,          -- Provider-specific ID
  provider_data JSONB,                       -- Provider-specific data
  chapters_count INTEGER,                     -- Chapter counts
  confidence DECIMAL(3,2),                   -- Match confidence (0.00-1.00)
  last_fetched_at TIMESTAMP,                 -- Last provider fetch
  UNIQUE(cache_id, provider_name)            -- One match per provider
);
```

**Permanent Storage for:**
- ✅ Provider links (don't break with provider changes)
- ✅ Chapter counts (track content availability)
- ✅ Match confidence scores
- ✅ Provider-specific data

### 2. Storage Structure

```
PostgreSQL Database: anifire
└── /DATA/AppData/postgresql/data/     ← Permanent disk storage
    ├── base/                          ← Database files
    ├── global/                        ← Global data
    └── pg_wal/                        ← Write-ahead logs
```

### 3. Data Persistence

**Docker Volume Mount:**
```yaml
volumes:
  - /DATA/AppData/postgresql/data:/var/lib/postgresql/data
```

**Persistence Guarantees:**
- ✅ Data survives container restarts
- ✅ Data survives host reboots
- ✅ Binary images stored permanently (no broken links)
- ✅ Automatic backups possible via pg_dump
- ✅ Transaction-safe writes (WAL logs)

## Data Flow

### Cache Retrieval Flow

```
Request → Redis Check → PostgreSQL (Permanent) → External API
           0.05s         0.05s                    3-4s

If Redis miss:
  → Check PostgreSQL → Hit (0.05s) → Update Redis → Response

If PostgreSQL miss:
  → Call External API (3-4s)
  → Store to PostgreSQL (permanent)
  → Update Redis (temporary)
  → Response
```

### Permanent Storage Operations

1. **First Request:**
   - External API call
   - Store to PostgreSQL (permanent)
   - Update Redis (temporary)
   - Response sent

2. **Subsequent Requests:**
   - Redis hit (0.05s) ✅
   - Or PostgreSQL hit (0.05s) if Redis expired ✅
   - Response sent

3. **Data永远不会丢失:**
   - Container restart → Data persists ✅
   - Redis restart → Repopulated from PostgreSQL ✅
   - Image links broken → Images stored as binary ✅

## Storage Statistics

### Current Storage (as of last run)

```sql
-- Storage capacity
SELECT
  COUNT(*) as total_cached,
  pg_size_pretty(pg_total_relation_size('manga_cache')) as cache_size,
  pg_total_relation_size('provider_matches') as matches_size
FROM manga_cache;
```

**Results:**
- **total_cached**: 20 items
- **cache_size**: 3.976 MB
- **matches_size**: 122880 bytes
- **Binary images**: 20 cover images (avg ~200KB each)

### Storage by Type

```sql
-- Breakdown by media type
SELECT
  type,
  COUNT(*) as count,
  pg_size_pretty(SUM(pg_column_size(cover_image_data))) as image_size
FROM manga_cache
WHERE cover_image_data IS NOT NULL
GROUP BY type;
```

## Maintenance & Management

### Backup

**Full backup:**
```bash
docker exec postgresql pg_dump -U casaos anifire > backup.sql
```

**Restore:**
```bash
cat backup.sql | docker exec -i postgresql psql -U casaos anifire
```

### Cleanup

**Remove old cached items:**
```sql
-- Delete items older than 30 days
DELETE FROM provider_matches
WHERE cache_id IN (
  SELECT id FROM manga_cache
  WHERE updated_at < NOW() - INTERVAL '30 days'
);

DELETE FROM manga_cache
WHERE updated_at < NOW() - INTERVAL '30 days';
```

**Reclaim space:**
```bash
docker exec postgresql psql -U casaos anifire -c "VACUUM FULL;"
```

### Monitoring

**Storage usage:**
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('manga_cache')) as cache_size,
  pg_size_pretty(pg_total_relation_size('provider_matches')) as matches_size,
  (SELECT COUNT(*) FROM manga_cache) as total_items,
  (SELECT COUNT(*) FROM provider_matches) as total_matches;
```

**Image storage breakdown:**
```sql
SELECT
  cover_image_mime,
  COUNT(*) as count,
  pg_size_pretty(SUM(pg_column_size(cover_image_data))) as total_size,
  pg_size_pretty(AVG(pg_column_size(cover_image_data))) as avg_size
FROM manga_cache
WHERE cover_image_data IS NOT NULL
GROUP BY cover_image_mime;
```

## Advantages of PostgreSQL as Permanent Storage

### 1. **No Broken Links** ✅
- Images stored as binary data (BYTEA)
- External URL changes don't affect stored images
- Covers deleted from external sources still available

### 2. **ACID Compliance** ✅
- Atomic writes (all or nothing)
- Consistent data state
- Isolated transactions
- Durable storage

### 3. **Rich Querying** ✅
- Complex filtering and sorting
- JOINs across tables
- Full-text search capability
- JSONB support for flexible schemas

### 4. **Scalability** ✅
- Indexes for fast lookups
- Partitioning for large datasets
- Connection pooling
- Replication for scaling

### 5. **Backup & Recovery** ✅
- Point-in-time recovery
- Incremental backups
- Easy export/import
- Disaster recovery

### 6. **Data Integrity** ✅
- Foreign key constraints
- CHECK constraints
- UNIQUE constraints
- Automatic triggers

## Storage Optimization

### Indexes Created

```sql
-- Fast lookups by AniList ID
CREATE INDEX idx_anilist_id ON manga_cache(anilist_id);

-- Fast filtering by type
CREATE INDEX idx_type ON manga_cache(type);

-- Fast sorting by score
CREATE INDEX idx_avg_score ON manga_cache(average_score);
CREATE INDEX idx_popularity ON manga_cache(popularity);

-- Provider matching
CREATE INDEX idx_cache_provider ON provider_matches(provider_name, provider_id);
```

### Compression

PostgreSQL automatically compresses:
- TOAST (The Oversized-Attribute Storage Technique)
- Large BYTEA fields
- JSONB data

This reduces storage needs while maintaining fast access.

## Future Enhancements

### 1. Image Thumbnails
```sql
ALTER TABLE manga_cache ADD COLUMN thumbnail_data BYTEA;
ALTER TABLE manga_cache ADD COLUMN thumbnail_data_mime VARCHAR(50);
```

### 2. Search Indexing
```sql
-- Enable full-text search
CREATE INDEX idx_title_search ON manga_cache USING GIN (to_tsvector('english', title->>'romaji'));
CREATE INDEX idx_description_search ON manga_cache USING GIN (to_tsvector('english', description));
```

### 3. Partitioning
```sql
-- Partition by type for better performance
CREATE TABLE manga_cache_anime PARTITION OF manga_cache FOR VALUES IN ('ANIME');
CREATE TABLE manga_cache_manga PARTITION OF manga_cache FOR VALUES IN ('MANGA');
```

## Summary

PostgreSQL provides **permanent, reliable storage** for AniFire:

✅ **Binary image storage** (no broken links)
✅ **Complete metadata** (all AniList data)
✅ **Provider linking** (extensible for multiple providers)
✅ **Disk persistence** (survives restarts)
✅ **Transaction safety** (ACID compliant)
✅ **Backup ready** (pg_dump/pg_restore)
✅ **Optimized queries** (indexes, PostgreSQL features)
✅ **Current size**: 3.976 MB (20 items with images)

The data stored in PostgreSQL will **never be lost** as long as:
1. Docker container is running (or volume is backed up)
2. `/DATA/AppData/postgresql/data` volume is preserved
3. Regular backups are maintained

PostgreSQL is the **single source of truth** for all AniFire data. 🔒
