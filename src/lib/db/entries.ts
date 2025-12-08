import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
type DailyEntryInsert = Database['public']['Tables']['daily_entries']['Insert']

export async function getEntriesForUser(userId: string, limit = 30) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('entry_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as DailyEntry[]
}

export async function getEntryByDate(userId: string, date: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .eq('is_deleted', false)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as DailyEntry | null
}

export async function upsertEntry(entry: DailyEntryInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(entry as any)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Failed to upsert entry')
  return data as DailyEntry
}

export async function deleteEntry(entryId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('daily_entries')
    // @ts-expect-error - Type inference issue with @supabase/ssr
    .update({ is_deleted: true })
    .eq('id', entryId)

  if (error) throw error
}

