import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Helper function to check admin role
async function checkAdminRole(supabase: any, session: any) {
  // Try to find psychologist by user_id (which references users.sso_uid)
  // First, get the user's sso_uid from users table
  const { data: user } = await supabase
    .from('users')
    .select('sso_uid')
    .eq('sso_uid', session.user.id)
    .maybeSingle()

  if (!user) {
    console.error('User not found in users table:', session.user.id)
    return { isAdmin: false, psychologistId: null }
  }

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('*')
    .eq('user_id', user.sso_uid)
    .maybeSingle()

  type Psychologist = Database['public']['Tables']['psychologists']['Row']
  const psychologistData = psychologist as Psychologist | null

  if (!psychologistData) {
    console.error('Psychologist not found for user_id:', user.sso_uid)
    return { isAdmin: false, psychologistId: null }
  }

  if (psychologistData.role !== 'admin') {
    console.error('User is not admin:', psychologistData.role)
    return { isAdmin: false, psychologistId: null }
  }

  if (!psychologistData.active) {
    console.error('Admin account is not active')
    return { isAdmin: false, psychologistId: null }
  }

  return { isAdmin: true, psychologistId: psychologistData.id }
}

// GET /api/admin/posts/[postId] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAdmin } = await checkAdminRole(supabase, session)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError) throw postError

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/posts/[postId] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAdmin } = await checkAdminRole(supabase, session)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, published_at } = body

    // Determine if post should be published
    const shouldPublish = published_at ? new Date(published_at) <= new Date() : undefined

    const updateData: Record<string, any> = {}
    
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (published_at !== undefined) {
      updateData.published_at = published_at
      updateData.published = shouldPublish
    }

    const { data: post, error: postError } = await (supabase as any)
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (postError) {
      console.error('Error updating post:', postError)
      throw postError
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update post'
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/posts/[postId] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAdmin } = await checkAdminRole(supabase, session)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

