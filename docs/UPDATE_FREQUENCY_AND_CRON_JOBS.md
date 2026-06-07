# AniFire Update System - Refresh Frequency & Cron Jobs

## 🔄 Refresh Frequency

### **1. Update Scheduler (Continuous)**
The `UpdateScheduler` runs continuously as an infinite loop:

```typescript
async updateCycle(): Promise<void> {
  const batchSize = 50;

  while (true) {
    // 1. Dequeue batch of 50 items
    const tasks = await this.dequeueUpdate(batchSize);

    // 2. Process in parallel (10 workers)
    await this.parallelProcess(tasks, 10, async (task) => {
      await this.updateItem(task);
    });

    // 3. Wait 5-60 seconds before next batch
    await this.sleep(5000);
  }
}
```

**Frequency:**
- **Every 5-60 seconds**: Processes next batch of 50 items (10 concurrent workers)
- **Continuous**: Runs 24/7 as a background service
- **Adaptive**: Waits 60 seconds if queue empty, 5 seconds if items pending

---

### **2. Request Tracking (Real-time)**
Automatic tracking on every API request:

**Endpoints Tracked:**
- `GET /api/info?id=*` → Records request, boosts priority (+0.5)
- `GET /api/search?q=*` → Records each result, boosts priority (+0.5)

**Frequency: Real-time**
- Every user request triggers tracking immediately
- Priority boost applied instantly
- Enqueued for background update

---

### **3. Adaptive Update Frequency**
Items have learned update intervals:

| Item Type | Default Interval | How It Learns |
|-----------|------------------|---------------|
| Daily webnovels | 0.5 hours | Learns from actual update times |
| Popular manga | 3 hours | Average time between updates |
| Normal items | 12 hours | Historical update patterns |
| Slow items | 48 hours | Update frequency patterns |
| Completed series | 168 hours | No new chapters detected |

**Learning Calculation:**
```typescript
avgInterval = totalTimeBetweenUpdates / updateCount
- If avgInterval < 1h: 0.5h (very frequent)
- If avgInterval < 6h: 3h (frequent)
- If avgInterval < 24h: 12h (normal)
- If avgInterval < 168h: 48h (slow)
- Otherwise: 168h (completed)
```

---

## 📅 Cron Jobs

### **1. Daily Reset (REQUIRED)** ⭐
**File:** `/root/tmp/AniFire/scripts/reset-daily-requests.sh`

**Schedule:** Daily at midnight
```bash
0 0 * * * /root/tmp/AniFire/scripts/reset-daily-requests.sh >> /var/log/anifire-reset.log 2>&1
```

**What it does:**
- Resets `recent_requests` to 0 for items requested >24h ago
- Creates urgency: items not requested lose priority
- Ensures priority turnover (older items drop in ranking)

**Example:**
```
Day 1: Item A requested 50 times (recent_requests = 50, update_priority = 25.0)
Day 2 (after midnight): Item A recent_requests = 0 (needs new requests to stay high)
```

---

### **2. Weekly Cleanup (OPTIONAL)**
**Purpose:** Clean up old history records

**Schedule:** Weekly on Sunday at 2 AM
```bash
0 2 * * 0 docker exec postgresql psql -U casaos -d anifire -c "SELECT cleanup_old_history();" >> /var/log/anifire-cleanup.log 2>&1
```

**What it does:**
- Deletes request_history older than 30 days
- Deletes update_history older than 90 days
- Free up database space

---

### **3. Daily Backups (ALREADY SET UP)**
**File:** `/root/tmp/AniFire/scripts/backup-postgres.sh`

**Schedule:** Daily at 2 AM (already configured)
```bash
0 2 * * * /root/tmp/AniFire/scripts/backup-postgres.sh
```

---

## 🚀 Production Setup

### **Required Cron Jobs**

```bash
# Edit crontab
crontab -e

# Add these lines:
# 1. Daily reset (REQUIRED)
0 0 * * * /root/tmp/AniFire/scripts/reset-daily-requests.sh >> /var/log/anifire-reset.log 2>&1

# 2. Weekly cleanup (OPTIONAL but recommended)
0 2 * * 0 docker exec postgresql psql -U casaos -d anifire -c "SELECT cleanup_old_history();" >> /var/log/anifire-cleanup.log 2>&1

# 3. Daily backup (should already exist)
0 2 * * * /root/tmp/AniFire/scripts/backup-postgres.sh
```

---

### **Systemd Service for Update Scheduler**

**File:** `/etc/systemd/system/anifire-updater.service`

```ini
[Unit]
Description=AniFire Update Scheduler
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/tmp/AniFire
Environment="NODE_ENV=production"
Environment="DB_HOST=localhost"
Environment="DB_PORT=5432"
Environment="DB_NAME=anifire"
Environment="DB_USER=casaos"
Environment="DB_PASSWORD=***"
ExecStart=/usr/local/bin/bun run /root/tmp/AniFire/src/services/UpdateScheduler.ts
Restart=always
RestartSec=10

# Graceful shutdown
TimeoutStopSec=30
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
```

**Setup commands:**
```bash
# 1. Create service file
sudo nano /etc/systemd/system/anifire-updater.service

# 2. Reload systemd
sudo systemctl daemon-reload

# 3. Enable service (start on boot)
sudo systemctl enable anifire-updater

# 4. Start service
sudo systemctl start anifire-updater

# 5. Check status
sudo systemctl status anifire-updater

# 6. View logs
sudo journalctl -u anifire-updater -f
```

---

## 📊 Summary Timeline

### **Real-Time (Per Request)**
```
User Request → Track Request → Boost Priority (+0.5) → Enqueue
```

### **Continuous (Background)**
```
Every 5-60s:
  - Select 100 high-priority items
  - Process 50 items (10 concurrent workers)
  - Check adaptive frequency
  - Detect changes
  - Update cache if changed
  - Record update history
```

### **Daily (Cron Job)**
```
Midnight (0 0 * * *):
  - Reset recent_requests for items >24h old
  - Create priority turnover
```

### **Weekly (Cron Job - Optional)**
```
Sunday 2 AM:
  - Delete request_history >30 days
  - Delete update_history >90 days
```

---

## 🔍 Monitoring

### **Check Status**

```bash
# 1. Update Scheduler Status
sudo systemctl status anifire-updater

# 2. View Recent Logs
sudo journalctl -u anifire-updater --since "1 hour ago"

# 3. Check Cron Jobs
crontab -l

# 4. Check Priority Queue
curl http://localhost:3000/api/requests/priority

# 5. Check Recent Updates
curl http://localhost:3000/api/requests/trending
```

### **Database Queries**

```sql
-- Items to update in next hour
SELECT anilist_id, title, update_priority, recent_requests
FROM manga_cache
WHERE (
  update_priority > 5.0
  OR recent_requests > 5
  OR updated_at < NOW() - INTERVAL '24 hours'
)
ORDER BY update_priority DESC
LIMIT 10;

-- Recent update activity (last hour)
SELECT COUNT(*) as updates_last_hour,
       COUNT(CASE WHEN change_detected THEN 1 END) as actual_changes
FROM update_history
WHERE update_time > NOW() - INTERVAL '1 hour';

-- Request activity (last day)
SELECT COUNT(*) as requests_last_day,
       COUNT(DISTINCT anilist_id) as unique_items
FROM request_history
WHERE request_time > NOW() - INTERVAL '24 hours';
```

---

## 🎯 Current Status

| Component | Status | Frequency |
|-----------|--------|-----------|
| **Request Tracking** | ✅ Active | Real-time (per request) |
| **Update Scheduler** | ⚠️ Not Deployed | 5-60s continuous |
| **Daily Reset** | ⚠️ Not configured | Midnight daily |
| **Weekly Cleanup** | ❌ Not configured | Sunday 2AM (optional) |
| **Daily Backups** | ✅ Already set | 2AM daily |

---

## 🚨 What's Missing for Production

1. **Systemd Service for Update Scheduler**: The `UpdateScheduler` class exists but is not running as a background service yet.

2. **Cron Job for Daily Reset**: The script exists but is not in crontab yet.

3. **Weekly Cleanup Cron**: Not configured (optional but recommended).

---

## ✅ Next Steps

### **Step 1: Setup Daily Reset Cron**
```bash
crontab -e
# Add: 0 0 * * * /root/tmp/AniFire/scripts/reset-daily-requests.sh >> /var/log/anifire-reset.log 2>&1
```

### **Step 2: Setup Update Scheduler Service**
```bash
sudo nano /etc/systemd/system/anifire-updater.service
# Paste systemd service config
sudo systemctl daemon-reload
sudo systemctl enable anifire-updater
sudo systemctl start anifire-updater
```

### **Step 3: (Optional) Setup Weekly Cleanup**
```bash
crontab -e
# Add: 0 2 * * 0 docker exec postgresql psql -U casaos -d anifire -c "SELECT cleanup_old_history();"
```

---

Would you like me to set up the systemd service for the Update Scheduler and configure the cron jobs now?