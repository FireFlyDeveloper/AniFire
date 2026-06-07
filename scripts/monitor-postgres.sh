#!/bin/bash
# PostgreSQL Storage Monitor Script for AniFire
# Displays storage statistics and health information

CONTAINER_NAME="postgresql"
DB_NAME="anifire"
DB_USER="casaos"

echo "📊 PostgreSQL Storage Monitor - AniFire"
echo "======================================"
echo ""

# Check if PostgreSQL is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  echo "❌ PostgreSQL container is not running"
  exit 1
fi

echo "✅ PostgreSQL Status: Running"
echo ""

# Database size
echo "📦 Database Size:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    pg_size_pretty(pg_database_size('$DB_NAME')) as total_size,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '$DB_NAME') as connections,
    (SELECT version()) as version;
" | grep -v "^$"

echo ""

# Table storage
echo "📋 Table Storage:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = pg_tables.tablename AND table_schema = pg_tables.schemaname) as row_count
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
" | grep -v "^$" | grep -v "schemaname"

echo ""

# Cached items statistics
echo "📚 Cached Items Statistics:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    COUNT(*) as total_cached,
    COUNT(CASE WHEN type = 'ANIME' THEN 1 END) as anime_cached,
    COUNT(CASE WHEN type = 'MANGA' THEN 1 END) as manga_cached,
    COUNT(CASE WHEN cover_image_data IS NOT NULL THEN 1 END) as with_images,
    pg_size_pretty(SUM(pg_column_size(cover_image_data))) as total_image_size
  FROM manga_cache;
" | grep -v "^$"

echo ""

# Image storage breakdown
echo "🖼️  Image Storage Breakdown:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    cover_image_mime,
    COUNT(*) as count,
    pg_size_pretty(SUM(pg_column_size(cover_image_data))) as total_size,
    pg_size_pretty(AVG(pg_column_size(cover_image_data))) as avg_size
  FROM manga_cache
  WHERE cover_image_data IS NOT NULL
  GROUP BY cover_image_mime
  ORDER BY COUNT(*) DESC;
" | grep -v "^$" | grep -v "cover_image"

echo ""

# Provider matches
echo "🔗 Provider Matches:"
if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    provider_name,
    COUNT(*) as total_matches,
    COUNT(DISTINCT cache_id) as unique_media
  FROM provider_matches
  GROUP BY provider_name
  ORDER BY total_matches DESC;
" 2>/dev/null | grep -v "^$" | grep -v "provider_name"; then
  echo "No provider matches found"
fi

echo ""

# Storage efficiency
echo "💾 Storage Efficiency:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    pg_size_pretty(pg_total_relation_size('manga_cache')) as cache_size,
    (SELECT COUNT(*) FROM manga_cache) as items,
    pg_size_pretty(pg_total_relation_size('manga_cache')/(SELECT NULLIF(COUNT(*), 0) FROM manga_cache)) as avg_per_item
  FROM manga_cache;
" | grep -v "^$"

echo ""

# Recent activity
echo "🕐 Recent Activity:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT
    COUNT(*) as items_cached_today,
    MIN(updated_at) as oldest_today,
    MAX(updated_at) as newest_today
  FROM manga_cache
  WHERE updated_at >= CURRENT_DATE;
" | grep -v "^$"

echo ""

# Disk usage
echo "💿 Disk Usage (PostgreSQL Data Directory):"
docker exec "$CONTAINER_NAME" du -sh /var/lib/postgresql/data 2>/dev/null || echo "Unable to determine data directory size"

echo ""
echo "======================================"
echo "✅ Monitoring Complete"
echo ""
