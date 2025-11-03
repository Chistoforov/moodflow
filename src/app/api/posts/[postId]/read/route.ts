import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createRouteHandlerClient()

    // Получаем текущего пользователя
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем user_id из таблицы users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('sso_uid', session.user.id)
      .single<{ id: string }>()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Отмечаем пост как прочитанный (используем upsert для избежания дубликатов)
    const postRead = { 
      user_id: user.id, 
      post_id: postId,
      read_at: new Date().toISOString()
    }
    
    const { error } = await (supabase
      .from('post_reads') as any)
      .upsert(postRead, { onConflict: 'user_id,post_id' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking post as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark post as read' },
      { status: 500 }
    )
  }
}

