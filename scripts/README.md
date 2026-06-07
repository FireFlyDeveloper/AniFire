# PostgreSQL Maintenance Scripts

This directory contains scripts for managing PostgreSQL permanent storage for AniFire.

## Scripts Overview

### 1. `backup-postgres.sh` - Backup Database

Creates timestamped backups of the AniFire database.

**Features:**
- ✅ Full database backup with all tables and data
- ✅ Automatic compression (gzip)
- ✅ Timestamped backups
- ✅ Keeps only last 10 backups
- ✅ Displays backup statistics

**Usage:**
```bash
./backup-postgres.sh
```

**Output Example:**
```
📦 Starting backup for database: anifire
📁 Backup file: /root/tmp/AniFire/backups/anifire_backup_20260607_102513.sql
✅ Backup completed successfully!
📊 Backup size: 5.4M -> 2.9M (compressed)
📂 Backup location: /root/tmp/AniFire/backups/anifire_backup_20260607_102513.sql.gz
```

**Schedule (Optional):**
```bash
# Add to crontab for daily backups
crontab -e
# Add line: 0 2 * * * /root/tmp/AniFire/scripts/backup-postgres.sh >> /root/tmp/AniFire/logs/backup.log 2>&1
```

---

### 2. `restore-postgres.sh` - Restore Database

Restores database from an existing backup.

**Features:**
- ✅ Lists all available backups
- ✅ Interactive backup selection
- ✅ Confirmation prompt
- ✅ Safe restore with validation
- ✅ Decompresses gzipped backups automatically

**Usage:**
```bash
./restore-postgres.sh
```

**Example Session:**
```
📋 Available backups:

  [1] anifire_backup_20260607_102513.sql.gz (2.9M) - 20260607 102513
  [2] anifire_backup_20260606_180022.sql.gz (2.8M) - 20260606 180022

🔄 Enter backup number to restore (or 'c' to cancel): 1

⚠️  WARNING: This will restore the database to the state when this backup was created
📦 Backup file: anifire_backup_20260607_102513.sql.gz
Continue? (yes/no): yes

🔄 Restoring database: anifire
📂 From: /root/tmp/AniFire/backups/anifire_backup_20260607_102513.sql.gz
✅ Restore completed successfully!
📊 Database state restored to: anifire_backup_20260607_102513.sql.gz
```

---

### 3. `monitor-postgres.sh` - Monitor Storage

Displays comprehensive storage statistics and health information.

**Features:**
- ✅ PostgreSQL status check
- ✅ Database size and connections
- ✅ Table storage breakdown
- ✅ Cached items statistics
- ✅ Image storage breakdown (by format)
- ✅ Provider matches overview
- ✅ Storage efficiency metrics
- ✅ Recent activity tracking
- ✅ Disk usage information

**Usage:**
```bash
./monitor-postgres.sh
```

**Output Example:**
```
📊 PostgreSQL Storage Monitor - AniFire
======================================

✅ PostgreSQL Status: Running

📦 Database Size:
 total_size | connections | version
------------+-------------+----------------------------------------------
 11 MB      |           1 | PostgreSQL 17.4 (Debian 17.4-1.pgdg120+2)

📋 Table Storage:
 schema | table     | size     | rows
--------+-----------+----------+------
 public | manga_cache      | 3976 kB |    20
 public | provider_matches | 120 kB  |     1

📚 Cached Items Statistics:
 total_cached | anime_cached | manga_cached | with_images | total_image_size
--------------+--------------+--------------+-------------+------------------
           20 |            0 |           20 |          20 | 2617 kB

🖼️  Image Storage Breakdown:
 mime       | count | total_size | avg_size
-----------+-------+------------+----------
 image/jpeg |    19 | 1977 kB    | 104 kB
 image/png  |     1 | 640 kB     | 640 kB

🔗 Provider Matches:
 provider  | matches | unique_media
----------+---------+--------------
 topmanhua |       8 |            8

💾 Storage Efficiency:
 cache_size | items | avg_per_item
------------+-------|--------------
 3976 kB    |    20 | 199 kB

🕐 Recent Activity:
 items_cached_today | oldest_today         | newest_today
--------------------+---------------------+---------------------
                 20 | 2026-06-07 02:38:12  | 2026-06-07 03:00:34

💿 Disk Usage (PostgreSQL Data Directory):
128M	/var/lib/postgresql/data
```

---

## Setup Instructions

### 1. Make Scripts Executable
```bash
chmod +x /root/tmp/AniFire/scripts/*.sh
```

### 2. Create Required Directories
```bash
mkdir -p /root/tmp/AniFire/backups
mkdir -p /root/tmp/AniFire/logs
```

### 3. Test Scripts
```bash
# Test monitoring
./monitor-postgres.sh

# Test backup
./backup-postgres.sh

# Test restore (if you have backups available)
./restore-postgres.sh
```

---

## Backup Strategy

### Recommended Schedule

**Daily Backups:**
```bash
# Crontab entry for daily backups at 2 AM
0 2 * * * /root/tmp/AniFire/scripts/backup-postgres.sh >> /root/tmp/AniFire/logs/backup.log 2>&1
```

**Weekly Full Backup:**
```bash
# Crontab entry for weekly backup on Sunday at 3 AM (additional safety)
0 3 * * 0 /root/tmp/AniFire/scripts/backup-postgres.sh >> /root/tmp/AniFire/logs/weekly-backup.log 2>&1 && cp /root/tmp/AniFire/backups/anifire_backup_$(date +\%Y\%m\%d)*.sql.gz /root/tmp/AniFire/backups/weekly/
```

**Retention Policy:**
- Keep last 10 daily backups (managed automatically)
- Move one backup per week to /root/tmp/AniFire/backups/weekly/ folder
- Keep weekly backups for 1 month

### Offsite Backup

**Copy to Remote Server:**
```bash
# After backup, copy to remote
scp /root/tmp/AniFire/backups/anifire_backup_*.sql.gz user@remote-server:/path/to/backup/
```

**Use Rsync:**
```bash
# Sync backup directory
rsync -avz /root/tmp/AniFire/backups/ user@remote-server:/path/to/anifire-backups/
```

---

## Monitoring Workflow

### Weekly Health Check
```bash
# Run full monitoring
./monitor-postgres.sh

# Check for issues:
# 1. Database size growing too fast? -> Review cleanup strategy
# 2. Many items without images? -> Check image download errors
# 3. Low disk space? -> Consider cleanup or expansion
```

### Monthly Review
```bash
# Create monthly backup
./backup-postgres.sh
cp /root/tmp/AniFire/backups/anifire_backup_$(date +%Y%m%d)*.sql.gz /root/tmp/AniFire/backups/monthly/

# Clean up old data (if needed)
# Delete items older than 90 days:
docker exec postgresql psql -U casaos -d anifire -c "
  DELETE FROM provider_matches
  WHERE cache_id IN (
    SELECT id FROM manga_cache
    WHERE updated_at < NOW() - INTERVAL '90 days'
  );
  DELETE FROM manga_cache
  WHERE updated_at < NOW() - INTERVAL '90 days';
"

# Reclaim space
docker exec postgresql psql -U casaos anifire -c "VACUUM FULL;"
```

---

## Troubleshooting

### Script Permission Denied
```bash
# Fix: Make scripts executable
chmod +x /root/tmp/AniFire/scripts/*.sh
```

### Docker Container Not Running
```bash
# Check container status
docker ps | grep postgresql

# Start container if stopped
docker start postgresql
```

### Backup Failed
```bash
# Check container is running
docker ps

# Check database exists
docker exec postgresql psql -U casaos -c "\l" | grep anifire

# Verify disk space
df -h | grep /DATA
```

### Restore Failed
```bash
# Verify backup file exists
ls -lh /root/tmp/AniFire/backups/

# Test backup integrity
gzip -t /root/tmp/AniFire/backups/anifire_backup_*.sql.gz

# View backup contents (without restoring)
gzip -dc /root/tmp/AniFire/backups/anifire_backup_*.sql.gz | head -20
```

### Monitor Script Shows Errors
```bash
# Check PostgreSQL is responding
docker exec postgresql pg_isready -U casaos

# Check database access
docker exec postgresql psql -U casaos -d anifire -c "SELECT COUNT(*) FROM manga_cache;"
```

---

## Emergency Procedures

### Database Corruption
```bash
# 1. Stop all writes (stop AniFire server)
docker stop anifire  # or kill process

# 2. Backup corrupted database (just in case)
./backup-postgres.sh
mv /root/tmp/AniFire/backups/anifire_backup_*.sql.gz /root/tmp/AniFire/backups/corrupted/

# 3. Restore from latest good backup
./restore-postgres.sh

# 4. Verify restoration
./monitor-postgres.sh

# 5. Restart AniFire
# (start your server again)
```

### Disaster Recovery
```bash`
# 1. If PostgreSQL container is completely lost:
# Re-create container and database

# 2. Restore from latest backup
./restore-postgres.sh

# 3. Recreate schema (if needed)
docker exec postgresql psql -U casaos -d anifire -f /root/tmp/AniFire/database/schema.sql

# 4. Verify all data is restored
./monitor-postgres.sh
```

---

## Integration with AniFire

### Automatic Backup on Schema Changes
```bash
# Before running migrations
./backup-postgres.sh

# Apply migrations
# (your migration scripts)

# Verify integrity
./monitor-postgres.sh
```

### Periodic Monitoring from API
```typescript
// Add monitoring endpoint
app.get('/api/admin/storage/health', async (c) => {
  const stats = await monitorPostgres.sh
  // Return JSON response with storage stats
});
```

---

## Security Notes

### Backup Security
- ✅ Backups contain all user data and images
- ✅ Store backups in secure location
- ✅ Encrypt backups if transferred over network
- ✅ Limit backup directory permissions (600)

### Database Security
- ✅ Never share database credentials
- ✅ Use strong database passwords
- ✅ Limit database access to specific users
- ✅ Regular security updates

---

## Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Docker PostgreSQL**: https://hub.docker.com/_/postgres
- **PostgreSQL Backup Guide**: https://www.postgresql.org/docs/current/backup-dump.html
- **AniFire Storage Architecture**: `../database/POSTGRESQL_STORAGE.md`

---

## Script Maintenance

To update scripts:
1. Edit the script file in this directory
2. Test with non-production data first
3. Commit changes to git
4. Update this README with any changes

---

**Last Updated**: June 7, 2026
**Version**: 1.0
