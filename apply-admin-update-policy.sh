#!/bin/bash

# Script to apply the admin UPDATE policy migration to Supabase
# This fixes the "Failed to update analytics" error in the admin panel

echo "🔧 Applying admin UPDATE policy migration..."
echo ""

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL environment variable is not set"
    echo ""
    echo "Please set it with:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres'"
    echo ""
    echo "You can find your connection string in:"
    echo "Supabase Dashboard → Project Settings → Database → Connection string"
    exit 1
fi

# Apply the migration
psql "$SUPABASE_DB_URL" < supabase/migrations/030_add_admin_update_policy.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "You can now edit analytics in the admin panel."
else
    echo ""
    echo "❌ Migration failed. Please check the error message above."
    echo ""
    echo "Alternative: Apply the migration manually through Supabase Dashboard"
    echo "See fix_analytics_update_error.md for instructions"
    exit 1
fi
