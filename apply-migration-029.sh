#!/bin/bash

# Apply migration 029 fix
# This script applies the corrected admin analytics SELECT policy

SUPABASE_URL="https://xchkdwpksmfztvoiuhnp.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaGtkd3Brc21menR2b2l1aG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA5ODE5MCwiZXhwIjoyMDc3Njc0MTkwfQ.x0VHoipCDYo7HNFJDyYXIRhedy0Ks17_LadCy_LYnog"

echo "Applying migration 029 fix..."

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/029_ensure_admin_select_policy.sql)

# Execute via Supabase REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}"

echo ""
echo "Migration applied!"
