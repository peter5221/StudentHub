#!/bin/sh
# scripts/backup.sh — Scheduled database + uploads backup to S3-compatible storage
# Runs inside the backup container on a cron schedule.
#
# Required env vars (from .env):
#   BACKUP_BUCKET, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY,
#   STORAGE_SECRET_KEY, BACKUP_RETENTION_DAYS (default 30)

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/backup_${TIMESTAMP}"
RETENTION="${BACKUP_RETENTION_DAYS:-30}"

echo "🗄  Starting backup at ${TIMESTAMP}…"

# ── Install rclone if not present ─────────────────────────────────────────────
if ! command -v rclone &>/dev/null; then
  apk add --no-cache rclone curl
fi

# ── Configure rclone for S3-compatible storage ────────────────────────────────
mkdir -p ~/.config/rclone
cat > ~/.config/rclone/rclone.conf <<EOF
[storage]
type = s3
provider = Other
endpoint = ${STORAGE_ENDPOINT}
access_key_id = ${STORAGE_ACCESS_KEY}
secret_access_key = ${STORAGE_SECRET_KEY}
region = auto
acl = private
EOF

# ── Create local backup bundle ────────────────────────────────────────────────
mkdir -p "${BACKUP_DIR}"

# Database (lowdb JSON)
if [ -f /data/db/db.json ]; then
  cp /data/db/db.json "${BACKUP_DIR}/db_${TIMESTAMP}.json"
  echo "  ✅ Database backed up"
fi

# Uploads (images)
if [ -d /data/uploads ]; then
  tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C /data uploads/
  echo "  ✅ Uploads backed up"
fi

# ── Upload to object storage ──────────────────────────────────────────────────
rclone copy "${BACKUP_DIR}/" "storage:${BACKUP_BUCKET}/backups/" \
  --s3-force-path-style \
  --log-level INFO

echo "  ✅ Uploaded to ${BACKUP_BUCKET}/backups/"

# ── Prune old backups ─────────────────────────────────────────────────────────
CUTOFF=$(date -d "-${RETENTION} days" +%Y%m%d 2>/dev/null || \
         date -v-${RETENTION}d +%Y%m%d)   # macOS fallback

rclone delete "storage:${BACKUP_BUCKET}/backups/" \
  --min-age "${RETENTION}d" \
  --log-level INFO && \
  echo "  ✅ Pruned backups older than ${RETENTION} days"

# ── Cleanup ───────────────────────────────────────────────────────────────────
rm -rf "${BACKUP_DIR}"

echo "✅ Backup complete at $(date +%Y%m%dT%H%M%SZ)"

# ── Schedule: run every 6 hours ───────────────────────────────────────────────
# (This script is called by crond — see crontab below)
# 0 */6 * * * /bin/sh /backup.sh >> /var/log/backup.log 2>&1

