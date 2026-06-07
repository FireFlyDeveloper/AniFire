#!/bin/bash
# PostgreSQL Backup Script for AniFire
# Creates timestamped backups of the anifire database

DB_NAME="anifire"
DB_USER="casaos"
BACKUP_DIR="/root/tmp/AniFire/backups"
CONTAINER_NAME="postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/anifire_backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Starting backup for database: $DB_NAME"
echo "📁 Backup file: $BACKUP_FILE"

# Create full backup
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
  # Get file size
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

  # Compress backup
  gzip "$BACKUP_FILE"
  COMPRESSED_FILE="${BACKUP_FILE}.gz"
  COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

  echo "✅ Backup completed successfully!"
  echo "📊 Backup size: $FILE_SIZE -> $COMPRESSED_SIZE (compressed)"
  echo "📂 Backup location: $COMPRESSED_FILE"

  # Keep only last 10 backups
  find "$BACKUP_DIR" -name "anifire_backup_*.sql.gz" -type f -mtime +10 2>/dev/null | head -n -10 | xargs -r rm -f
  echo "🧹 Old backups cleaned up (keeping last 10)"

  # Show backup statistics
  echo ""
  echo "📈 Current backups:"
  ls -lh "$BACKUP_DIR"/anifire_backup_*.gz 2>/dev/null || echo "No backups found"
else
  echo "❌ Backup failed!"
  exit 1
fi
