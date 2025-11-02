'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Recommendation {
  id: string
  title: string | null
  text: string
  recommendation_type: 'weekly' | 'personal' | 'ai'
  read_status: boolean
  created_at: string
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Еженедельная'
      case 'personal':
        return 'Персональная'
      case 'ai':
        return 'От ИИ'
      default:
        return type
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      weekly: 'bg-blue-100 text-blue-800',
      personal: 'bg-purple-100 text-purple-800',
      ai: 'bg-green-100 text-green-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Рекомендации</h1>
        <p className="mt-2 text-gray-600">
          Персональные советы от психологов и ИИ-анализ
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Пока нет рекомендаций</p>
          <p className="text-sm text-gray-400 mt-2">
            Продолжайте вести дневник, и скоро появятся персональные советы
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className={`bg-white rounded-lg shadow p-6 ${
                !rec.read_status ? 'border-l-4 border-indigo-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {rec.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {rec.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
                        rec.recommendation_type
                      )}`}
                    >
                      {getTypeLabel(rec.recommendation_type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(rec.created_at), 'dd MMMM yyyy', {
                        locale: ru,
                      })}
                    </span>
                  </div>
                </div>
                {!rec.read_status && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Новое
                  </span>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

