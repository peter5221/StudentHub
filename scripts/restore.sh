#!/bin/sh
# scripts/restore.sh — Restore database and uploads from a named backup
#
# Usage: ./restore.sh 20241113_060000
#
# Requires same env vars as backup.sh

set -euo pipefail

TIMESTAMP="${1:-}"
if [ -z "$TIMESTAMP" ]; then
  echo "❌ Usage: $0 <TIMESTAMP>  (e.g. 20241113_060000)"
  exit 1
fi

RESTORE_DIR="/tmp/restore_${TIMESTAMP}"
mkdir -p "$RESTORE_DIR"

echo "🔄 Restoring backup from ${TIMESTAMP}…"

# ── Configure rclone ──────────────────────────────────────────────────────────
apk add --no-cache rclone 2>/dev/null || true

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

# ── Download from storage ─────────────────────────────────────────────────────
rclone copy "storage:${BACKUP_BUCKET}/backups/" "${RESTORE_DIR}/" \
  --include "*_${TIMESTAMP}*" \
  --s3-force-path-style \
  --log-level INFO

# ── Restore database ──────────────────────────────────────────────────────────
DB_FILE="${RESTORE_DIR}/db_${TIMESTAMP}.json"
if [ -f "$DB_FILE" ]; then
  cp "$DB_FILE" /data/db/db.json
  echo "  ✅ Database restored"
else
  echo "  ⚠️  No database file found for ${TIMESTAMP}"
fi

# ── Restore uploads ───────────────────────────────────────────────────────────
UPLOADS_TAR="${RESTORE_DIR}/uploads_${TIMESTAMP}.tar.gz"
if [ -f "$UPLOADS_TAR" ]; then
  tar -xzf "$UPLOADS_TAR" -C /data/
  echo "  ✅ Uploads restored"
else
  echo "  ⚠️  No uploads archive found for ${TIMESTAMP}"
fi

rm -rf "$RESTORE_DIR"
echo "✅ Restore complete"

