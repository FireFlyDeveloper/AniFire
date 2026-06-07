#!/bin/bash

# AniFire Daily Request Reset Script
# Resets recent_request counts to 0 every day
# This creates urgency: items not requested lose priority

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-anifire}"
DB_USER="${DB_USER:-casaos}"
DB_PASSWORD="${DB_PASSWORD:-password}"

echo "🔄 AniFire Daily Request Reset"
echo "===================================="
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Time: $(date)"

# Reset recent request counts
echo ""
echo "🔄 Resetting recent request counts..."

PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
UPDATE manga_cache
SET recent_requests = 0
WHERE last_request_time < NOW() - INTERVAL '24 hours';
"

# Get summary
echo ""
echo "📊 Summary:"
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT COUNT(*) as total_items,
       SUM(request_count) as total_requests,
       COUNT(CASE WHEN recent_requests > 0 THEN 1 END) as items_with_recent_requests
FROM manga_cache
WHERE length(data) > 0;
"

# Cleanup old history
echo ""
echo "🧹 Cleaning up old history..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT cleanup_old_history();
"

echo ""
echo "✅ Daily reset completed successfully!"
echo "📅 Next scheduled run: tomorrow at same time"
