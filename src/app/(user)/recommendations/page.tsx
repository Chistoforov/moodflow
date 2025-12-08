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
    const styles = {
      weekly: { backgroundColor: '#D4C8B5', color: '#8B3A3A' },
      personal: { backgroundColor: '#C8BEB0', color: '#8B3A3A' },
      ai: { backgroundColor: '#E8E2D5', color: '#8B3A3A' },
    }
    return styles[type as keyof typeof styles] || { backgroundColor: '#F5F1EB', color: '#8B3A3A' }
  }

  return (
    <div className="px-4 sm:px-0 min-h-[calc(100vh-10rem)] py-4 sm:py-6 pb-20">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#8B3A3A' }}>Аналитика и рекомендации</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg" style={{ color: '#8B3A3A' }}>
          Персональные советы от психологов и ИИ-анализ
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#8B3A3A' }}>Загрузка...</div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-2xl shadow-sm p-6 sm:p-8 text-center" style={{ backgroundColor: '#F5F1EB' }}>
          <p className="text-base sm:text-lg" style={{ color: '#8B3A3A' }}>Продолжайте заполнять дневник и скоро вы сможете увидеть выводы и рекомендации</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className={`rounded-2xl shadow-sm p-4 sm:p-6 ${
                !rec.read_status ? 'border-l-4' : ''
              }`}
              style={{
                backgroundColor: '#F5F1EB',
                borderLeftColor: !rec.read_status ? '#8B3A3A' : 'transparent',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div className="flex-1">
                  {rec.title && (
                    <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: '#8B3A3A' }}>
                      {rec.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                      style={getTypeBadge(rec.recommendation_type)}
                    >
                      {getTypeLabel(rec.recommendation_type)}
                    </span>
                    <span className="text-xs sm:text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                      {format(new Date(rec.created_at), 'dd MMMM yyyy', {
                        locale: ru,
                      })}
                    </span>
                  </div>
                </div>
                {!rec.read_status && (
                  <span 
                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:ml-2"
                    style={{
                      backgroundColor: '#8B3A3A',
                      color: '#E8E2D5',
                    }}
                  >
                    Новое
                  </span>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base" style={{ color: '#8B3A3A' }}>{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

