import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Helper function to check admin role
async function checkAdminRole(supabase: any, session: any) {
  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  type Psychologist = Database['public']['Tables']['psychologists']['Row']
  const psychologistData = psychologist as Psychologist | null

  if (!psychologistData || psychologistData.role !== 'admin' || !psychologistData.active) {
    return { isAdmin: false, psychologistId: null }
  }

  return { isAdmin: true, psychologistId: psychologistData.id }
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/posts - Get all posts (including unpublished)
export async function GET(request: NextRequest) {
  try {
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

    // Get all posts (including unpublished)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) throw postsError

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAdmin, psychologistId } = await checkAdminRole(supabase, session)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, published_at } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    let finalSlug = slug
    if (existingPost) {
      // Add timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`
    }

    // Determine if post should be published
    const now = new Date().toISOString()
    const shouldPublish = published_at ? new Date(published_at) <= new Date() : true

    const postData: Database['public']['Tables']['posts']['Insert'] = {
      title,
      slug: finalSlug,
      post_type: 'article',
      content,
      video_url: null,
      cover_image_url: null,
      excerpt: null,
      category: null,
      tags: null,
      author_id: psychologistId,
      published: shouldPublish,
      published_at: published_at || (shouldPublish ? now : null),
    }

    const { data: post, error: postError } = await (supabase as any)
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (postError) throw postError

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

