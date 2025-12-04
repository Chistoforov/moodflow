#!/bin/bash

# Script to apply migration 025: Fix admin analytics access
# This fixes the issue where admins can't see user analytics in the admin panel

echo "🔧 Applying migration 025: Fix admin analytics access"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/025_fix_admin_analytics_access.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "Make sure you're running this script from the project root directory."
    exit 1
fi

echo "📋 Migration file found"
echo ""

# Option 1: Try to push via Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    echo "Pushing migration to database..."
    echo ""
    
    npx supabase db push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration applied successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Refresh the admin panel in your browser"
        echo "2. Navigate to a user's page"
        echo "3. Check if analytics and recommendations are now visible"
        exit 0
    else
        echo ""
        echo "⚠️  CLI push failed. Please apply manually via Supabase Dashboard."
    fi
else
    echo "⚠️  Supabase CLI not found"
fi

# If we get here, CLI didn't work
echo ""
echo "📝 Manual application instructions:"
echo ""
echo "1. Open Supabase Dashboard: https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Create a new query"
echo "5. Copy the contents of: supabase/migrations/025_fix_admin_analytics_access.sql"
echo "6. Paste and click 'Run'"
echo ""
echo "For detailed instructions, see: APPLY_MIGRATION_025.md"
