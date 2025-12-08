'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import useSWR, { mutate } from 'swr'
import { useSearchParams, useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  published_at: string
  is_read: boolean
}

// Fetcher функция для SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MaterialsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const postId = searchParams.get('post')
  
  const [selectedPost, setSelectedPost] = useState<any>(null)
  
  // Используем SWR для кеширования списка постов
  const { data, isLoading } = useSWR('/api/posts', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  
  const posts: Post[] = data?.posts || []

  // Загружаем пост при изменении postId в URL
  useEffect(() => {
    if (postId && posts.length > 0) {
      loadPost(postId)
    } else {
      setSelectedPost(null)
    }
  }, [postId, posts.length])

  const loadPost = async (id: string) => {
    try {
      // Находим пост, чтобы проверить, был ли он непрочитанным
      const post = posts.find(p => p.id === id)
      const wasUnread = post && !post.is_read
      
      // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ: Сразу помечаем пост как прочитанный в кеше SWR
      if (wasUnread) {
        mutate('/api/posts', {
          posts: posts.map(p => 
            p.id === id ? { ...p, is_read: true } : p
          )
        }, false)
      }
      
      // Загружаем полный контент статьи
      const response = await fetch(`/api/posts/${id}`)
      const data = await response.json()
      setSelectedPost(data.post)
      
      // Отмечаем пост как прочитанный на сервере И СРАЗУ обновляем счетчик
      if (wasUnread) {
        try {
          await fetch(`/api/posts/${id}/read`, { method: 'POST' })
          // Обновляем счетчик непрочитанных и кеш постов
          window.dispatchEvent(new Event('updateUnreadCount'))
          mutate('/api/posts')
        } catch (error) {
          console.error('Failed to mark post as read:', error)
          // В случае ошибки откатываем изменения в кеше
          mutate('/api/posts')
        }
      }
    } catch (error) {
      console.error('Failed to open post:', error)
    }
  }

  const openPost = (postId: string) => {
    router.push(`/materials?post=${postId}`)
  }

  const closePost = () => {
    router.push('/materials')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 pt-8" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="max-w-2xl mx-auto text-center py-12" style={{ color: '#8B3A3A' }}>
          Загрузка...
        </div>
      </div>
    )
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen px-4 pt-4 sm:pt-8 pb-20" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="max-w-2xl mx-auto">
          {/* Кнопка назад */}
          <button
            onClick={closePost}
            className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium transition-all rounded-full border-2 min-h-[44px]"
            style={{ 
              color: '#8B3A3A',
              borderColor: '#8B3A3A',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8B3A3A'
              e.currentTarget.style.color = '#E8E2D5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#8B3A3A'
            }}
          >
            ← Назад
          </button>

          {/* Статья */}
          <article className="rounded-2xl p-4 sm:p-6 md:p-8 mb-8" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="mb-4">
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                style={{ 
                  backgroundColor: '#D4C8B5',
                  color: '#8B3A3A'
                }}
              >
                {selectedPost.category}
              </span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#8B3A3A' }}
            >
              {selectedPost.title}
            </h1>

            <div className="mb-6 text-xs sm:text-sm" style={{ color: '#A67C6C' }}>
              {format(new Date(selectedPost.published_at), 'd MMMM yyyy', { locale: ru })}
            </div>

            <div 
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none"
              style={{ color: '#5C4A42' }}
              dangerouslySetInnerHTML={{ 
                __html: selectedPost.content.replace(/\n/g, '<br />').replace(/#{1,6}\s(.*?)(<br \/>|$)/g, (_: string, text: string) => `<h2 style="color: #8B3A3A; font-weight: 600; font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 1rem;">${text}</h2>`) 
              }}
            />

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t" style={{ borderColor: '#D4C8B5' }}>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs sm:text-sm"
                      style={{ 
                        backgroundColor: '#E8E2D5',
                        color: '#8B3A3A'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-4 sm:pt-8 pb-20" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 
            className="handwritten text-4xl sm:text-5xl md:text-6xl mb-4"
            style={{ color: '#8B3A3A' }}
          >
            Материалы
          </h1>
          <p className="text-base sm:text-lg" style={{ color: '#A67C6C' }}>
            Полезные статьи от наших психологов
          </p>
        </div>

        {/* Список постов */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: '#F5F1EB' }}>
              <p className="text-lg" style={{ color: '#A67C6C' }}>
                Пока нет материалов
              </p>
            </div>
          ) : (
            posts.map(post => (
              <button
                key={post.id}
                onClick={() => openPost(post.id)}
                className="w-full text-left rounded-2xl p-4 sm:p-6 transition-all"
                style={{ 
                  backgroundColor: '#F5F1EB',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8B3A3A'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: '#D4C8B5',
                      color: '#8B3A3A'
                    }}
                  >
                    {post.category}
                  </span>
                  {!post.is_read && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#8B3A3A' }}
                      title="Непрочитанный материал"
                    />
                  )}
                </div>

                <h2 
                  className="text-xl sm:text-2xl font-bold mb-3"
                  style={{ color: '#8B3A3A' }}
                >
                  {post.title}
                </h2>

                <p className="mb-3 line-clamp-2 text-sm sm:text-base" style={{ color: '#5C4A42' }}>
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags?.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: '#E8E2D5',
                        color: '#A67C6C'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs sm:text-sm" style={{ color: '#A67C6C' }}>
                  {format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

