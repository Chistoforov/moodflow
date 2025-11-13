'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/types/database'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Post = Database['public']['Tables']['posts']['Row']

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  post?: Post | null
}

function MaterialModal({ isOpen, onClose, onSave, post }: MaterialModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content || '')
      setPublishDate(post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '')
    } else {
      setTitle('')
      setContent('')
      setPublishDate('')
    }
  }, [post])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Заполните заголовок и текст')
      return
    }

    try {
      setSaving(true)

      const url = post ? `/api/admin/posts/${post.id}` : '/api/admin/posts'
      const method = post ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          published_at: publishDate || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error response:', errorData)
        console.error('Full error details:', JSON.stringify(errorData, null, 2))
        const errorMsg = errorData.error || `Failed to save post (${response.status})`
        const details = errorData.details ? `\n\nDetails: ${JSON.stringify(errorData.details, null, 2)}` : ''
        throw new Error(errorMsg + details)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving post:', err)
      alert(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Center alignment helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom rounded-2xl text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          style={{ backgroundColor: '#F5F1EB', position: 'relative', zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#8B3A3A' }}>
                {post ? 'Редактировать материал' : 'Новый материал'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-opacity-20"
                style={{ backgroundColor: '#D4C8B5' }}
              >
                <svg className="w-6 h-6" style={{ color: '#8B3A3A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8B3A3A' }}>
                  Заголовок
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D4C8B5',
                    color: '#8B3A3A',
                  }}
                  placeholder="Введите заголовок"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8B3A3A' }}>
                  Текст
                </label>
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                  {isOpen && <RichTextEditor value={content} onChange={setContent} />}
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8B3A3A' }}>
                  Дата публикации (опционально)
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D4C8B5',
                    color: '#8B3A3A',
                  }}
                />
                <p className="mt-1 text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                  Если не заполнено, материал будет опубликован сразу
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 flex justify-end space-x-3" style={{ backgroundColor: '#E8E2D5' }}>
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#D4C8B5',
                color: '#8B3A3A',
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#FFFFFF',
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/posts')
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) {
      return
    }

    try {
      setDeletingPostId(postId)
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      await fetchPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handleModalSave = () => {
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Материалы</h1>
        </div>
        <div className="rounded-2xl shadow-sm p-8 text-center" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8B3A3A' }}></div>
          <p className="mt-4" style={{ color: '#8B3A3A' }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Материалы</h1>
        </div>
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <p style={{ color: '#8B3A3A' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Материалы</h1>
            <p className="mt-2" style={{ color: '#8B3A3A', opacity: 0.7 }}>
              Всего материалов: {posts.length}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#4CAF50' }}
            title="Добавить новый материал"
          >
            <svg className="w-8 h-8" style={{ color: '#FFFFFF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              style={{ backgroundColor: '#F5F1EB' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#8B3A3A' }}>
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                    <span>
                      {post.published ? (
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#4CAF50' }}></span>
                          Опубликован
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#FFA500' }}></span>
                          Черновик
                        </span>
                      )}
                    </span>
                    <span>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Не опубликован'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                    style={{ backgroundColor: '#D4C8B5' }}
                    title="Редактировать"
                  >
                    <svg className="w-5 h-5" style={{ color: '#8B3A3A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingPostId === post.id}
                    className="p-2 rounded-full hover:bg-opacity-20 transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#D4C8B5' }}
                    title="Удалить"
                  >
                    <svg className="w-5 h-5" style={{ color: '#8B3A3A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="rounded-2xl shadow-sm p-12 text-center" style={{ backgroundColor: '#F5F1EB' }}>
            <p className="text-lg mb-4" style={{ color: '#8B3A3A', opacity: 0.7 }}>
              Нет материалов
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 rounded-full font-medium transition-colors"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#FFFFFF',
              }}
            >
              Создать первый материал
            </button>
          </div>
        )}
      </div>

      <MaterialModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        post={editingPost}
      />
    </>
  )
}

