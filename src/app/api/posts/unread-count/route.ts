import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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
      return NextResponse.json({ unreadCount: 0 })
    }

    // Получаем количество опубликованных постов
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    // Получаем количество прочитанных постов пользователем
    const { count: readPosts } = await supabase
      .from('post_reads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const unreadCount = (totalPosts || 0) - (readPosts || 0)

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ unreadCount: 0 })
  }
}

