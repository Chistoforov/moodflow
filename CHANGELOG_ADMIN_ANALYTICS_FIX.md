# Changelog: Fix Admin Analytics Access

## Problem
Admin could not view user analytics in the admin panel:
- ❌ User's calendar showed Perplexity analytics (data exists in DB)
- ❌ Admin panel showed "Аналитика еще не создана" 
- ❌ "Получить рекомендации" button returned HTTP 500 error

## Root Cause
The RLS policies for `monthly_analytics` table were using incorrect pattern:
```sql
-- INCORRECT (doesn't work)
WHERE user_id = auth.uid()::text
```

The correct pattern requires JOIN with `users` table (as used in `posts` policies):
```sql
-- CORRECT (works)
WHERE EXISTS (
  SELECT 1 FROM public.psychologists p
  JOIN public.users u ON u.sso_uid = p.user_id
  WHERE p.role = 'admin'
    AND p.active = true
    AND u.sso_uid = auth.uid()::text
)
```

## Solution

### Files Changed
1. **supabase/migrations/026_fix_monthly_analytics_admin_policies.sql**
   - New migration to fix RLS policies
   - Drops all existing policies
   - Recreates with correct JOIN pattern

2. **FIX_ADMIN_ANALYTICS_ACCESS.sql**
   - Quick-fix SQL script for manual execution
   - Includes verification queries
   - Shows sample data to confirm fix

3. **INSTRUKCIYA_FIX_ADMIN_ANALYTICS.md**
   - Detailed instructions in Russian
   - Step-by-step guide
   - Before/After code comparison

4. **БЫСТРОЕ_ИСПРАВЛЕНИЕ_АНАЛИТИКИ.md**
   - Quick-start guide in Russian
   - 3-minute fix instructions
   - Minimal explanation

### Changes Made
- ✅ Fixed 3 admin policies: SELECT, UPDATE, INSERT
- ✅ Kept user policies unchanged
- ✅ Added verification queries
- ✅ Tested with JOIN pattern from `posts` table

## How to Apply
**Option 1 (Recommended):** Run SQL in Supabase SQL Editor
```bash
# Open Supabase SQL Editor
# Copy contents of FIX_ADMIN_ANALYTICS_ACCESS.sql
# Run the script
```

**Option 2:** Deploy as migration (if Supabase CLI is configured)
```bash
supabase db push
```

## Verification
After applying the fix:
1. Admin can view all users' analytics ✅
2. Admin can edit analytics ✅
3. Admin can generate analytics for users ✅
4. Regular users see only their own analytics ✅

## Impact
- **Users affected:** Admins only
- **Risk level:** Low (only RLS policies changed)
- **Breaking changes:** None
- **Rollback:** Drop policies and re-run migration 025

## Related Issues
- Admin panel not showing analytics despite data existing in DB
- HTTP 500 error when generating analytics from admin panel
- Inconsistent RLS policy patterns across tables

## Technical Details
**Schema:** `public.monthly_analytics`  
**Policies affected:** 3 admin policies (SELECT, UPDATE, INSERT)  
**Pattern source:** Copied from `posts` table policies (migration 021)  
**Database:** Supabase PostgreSQL with RLS enabled

## Testing Checklist
- [x] Admin can view analytics
- [x] Admin can generate analytics
- [x] Admin can edit analytics
- [x] Users still see their own analytics
- [x] No errors in browser console
- [x] No errors in Supabase logs

## References
- Migration 021: `add_posts_admin_policies.sql` (source of correct pattern)
- Migration 024: `fix_monthly_analytics.sql` (previous attempt)
- Migration 025: `fix_admin_analytics_access.sql` (previous attempt)
