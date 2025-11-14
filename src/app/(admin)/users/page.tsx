'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/types/database'
import AnalysisConfirmModal from '@/components/admin/AnalysisConfirmModal'

export const dynamic = 'force-dynamic'

type User = Database['public']['Tables']['users']['Row']
type Role = 'free' | 'subscription' | 'personal' | 'admin'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [analyzingUserId, setAnalyzingUserId] = useState<string | null>(null)
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: '',
    userName: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdatingUserId(userId)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_tier: newRole === 'admin' ? 'free' : newRole,
          role: newRole
        }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleLabel = (user: User): Role => {
    // Check if user is in psychologists table (would need to query this)
    // For now, use subscription_tier
    return user.subscription_tier as Role
  }

  const openConfirmModal = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, userId: '', userName: '' })
  }

  const handleManualAnalysis = async (forceRecreate: boolean) => {
    const { userId } = confirmModal

    try {
      setAnalyzingUserId(userId)
      setAnalysisMessage(null)
      
      const response = await fetch('/api/admin/analytics/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, forceRecreate }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error === 'Not enough entries for analysis') {
          setAnalysisMessage(`❌ Недостаточно записей для анализа (минимум 3, найдено: ${data.entriesCount})`)
        } else {
          throw new Error(data.error || 'Failed to generate analysis')
        }
      } else {
        // Check if analysis already exists
        if (data.message === 'Analysis already exists for this period') {
          setAnalysisMessage('ℹ️ Анализ для этого периода уже существует')
        } else if (data.metadata) {
          setAnalysisMessage(
            `✅ Анализ успешно создан! Проанализировано ${data.metadata.daysAnalyzed} дней и ${data.metadata.entriesAnalyzed} записей.`
          )
        } else {
          setAnalysisMessage('✅ Анализ успешно завершен')
        }
      }

      // Clear message after 5 seconds
      setTimeout(() => setAnalysisMessage(null), 5000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate analysis'
      setAnalysisMessage(`❌ Ошибка: ${errorMsg}`)
      setTimeout(() => setAnalysisMessage(null), 5000)
    } finally {
      setAnalyzingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Пользователи</h1>
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
          <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Пользователи</h1>
        </div>
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <p style={{ color: '#8B3A3A' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Пользователи</h1>
        <p className="mt-2" style={{ color: '#8B3A3A', opacity: 0.7 }}>
          Всего пользователей: {users.length}
        </p>
      </div>

      {analysisMessage && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#E8E2D5' }}>
          <p style={{ color: '#8B3A3A' }}>{analysisMessage}</p>
        </div>
      )}

      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#D4C8B5' }}>
            <thead style={{ backgroundColor: '#E8E2D5' }}>
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Email
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Имя
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Роль
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Дата регистрации
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#D4C8B5' }}>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-opacity-50" style={{ backgroundColor: 'transparent' }}>
                  <td className="px-6 py-4 text-sm" style={{ color: '#8B3A3A' }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#8B3A3A' }}>
                    {user.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={getRoleLabel(user)}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      disabled={updatingUserId === user.id}
                      className="block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D4C8B5',
                        color: '#8B3A3A',
                      }}
                    >
                      <option value="free">Бесплатный</option>
                      <option value="subscription">Подписка</option>
                      <option value="personal">Личный психолог</option>
                      <option value="admin">Админ</option>
                    </select>
                    {updatingUserId === user.id && (
                      <div className="mt-1 text-xs" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                        Обновление...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                    {new Date(user.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openConfirmModal(user.id, user.full_name || user.email)}
                      disabled={analyzingUserId === user.id}
                      className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                      style={{
                        backgroundColor: '#8B3A3A',
                        color: '#FFFFFF',
                      }}
                      title="Запустить анализ настроения за текущий месяц"
                    >
                      {analyzingUserId === user.id ? (
                        <span className="flex items-center gap-2">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Анализ...
                        </span>
                      ) : (
                        '📊 Анализ'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p style={{ color: '#8B3A3A', opacity: 0.7 }}>
              Нет зарегистрированных пользователей
            </p>
          </div>
        )}
      </div>

      {/* Модалка подтверждения */}
      <AnalysisConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleManualAnalysis}
        userName={confirmModal.userName}
      />
    </div>
  )
}
