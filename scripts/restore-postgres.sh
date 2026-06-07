#!/bin/bash
# PostgreSQL Restore Script for AniFire
# Restores database from a backup file

DB_NAME="anifire"
DB_USER="casaos"
CONTAINER_NAME="postgresql"

# List available backups
echo "📋 Available backups:"
echo ""

BACKUP_DIR="/root/tmp/AniFire/backups"
if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup directory not found: $BACKUP_DIR"
  exit 1
fi

# Check if backups exist
backups=($(ls -t "$BACKUP_DIR"/anifire_backup_*.sql.gz 2>/dev/null))
if [ ${#backups[@]} -eq 0 ]; then
  echo "❌ No backups found in: $BACKUP_DIR"
  exit 1
fi

# Show backups with numbers
for i in "${!backups[@]}"; do
  backup_file="${backups[$i]}"
  file_size=$(du -h "$backup_file" | cut -f1)
  file_date=$(basename "$backup_file" | grep -oP '\d{8}_\d{4}' | sed 's/_/ /')
  echo "  [$((i+1))] $(basename "$backup_file") ($file_size) - $file_date"
done

echo ""
read -p "🔄 Enter backup number to restore (or 'c' to cancel): " selection

# Check if user wants to cancel
if [ "$selection" = "c" ] || [ "$selection" = "C" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

# Validate selection
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups[@]} ]; then
  echo "❌ Invalid selection"
  exit 1
fi

# Get selected backup
backup_file="${backups[$((selection-1))]}"

echo ""
echo "⚠️  WARNING: This will restore the database to the state when this backup was created"
echo "📦 Backup file: $(basename "$backup_file")"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

# Restore from backup
echo ""
echo "🔄 Restoring database: $DB_NAME"
echo "📂 From: $backup_file"

# Decompress and restore
if gzip -dc "$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME"; then
  echo ""
  echo "✅ Restore completed successfully!"
  echo "📊 Database state restored to: $(basename "$backup_file")"
else
  echo ""
  echo "❌ Restore failed!"
  exit 1
fi
