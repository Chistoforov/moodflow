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
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('sso_uid', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем все опубликованные посты
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, excerpt, category, tags, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (postsError) throw postsError

    // Получаем информацию о прочитанных постах
    const { data: readPosts } = await supabase
      .from('post_reads')
      .select('post_id')
      .eq('user_id', user.id)

    const readPostIds = new Set(readPosts?.map(r => r.post_id) || [])

    // Объединяем данные
    const postsWithReadStatus = posts?.map(post => ({
      ...post,
      is_read: readPostIds.has(post.id)
    })) || []

    return NextResponse.json({ posts: postsWithReadStatus })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

