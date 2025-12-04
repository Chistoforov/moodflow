#!/bin/bash

# Quick script to apply migration 025 via Supabase API
# This assumes you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set

echo "🚀 Applying migration 025: Fix admin analytics access"
echo ""

# Check if env variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    echo ""
    echo "Please set them first:"
    echo "  export SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    echo ""
    echo "Or run migration manually in Supabase Dashboard → SQL Editor"
    exit 1
fi

# Read migration file
MIGRATION_SQL=$(cat supabase/migrations/025_fix_admin_analytics_access.sql)

# Apply migration using Supabase REST API
echo "📝 Executing migration..."
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}")

echo ""
echo "✅ Migration applied!"
echo ""
echo "🔍 Verifying policies..."

# Verify policies
VERIFY_SQL="SELECT COUNT(*) as count FROM pg_policies WHERE tablename = 'monthly_analytics' AND schemaname = 'public';"

echo ""
echo "Run this in Supabase SQL Editor to verify:"
echo "$VERIFY_SQL"
echo ""
echo "Expected: 7 policies"
echo ""
echo "✨ Done! Now deploy your app changes:"
echo "  git add ."
echo "  git commit -m 'Fix admin analytics display'"
echo "  git push origin main"
echo "  vercel --prod"
