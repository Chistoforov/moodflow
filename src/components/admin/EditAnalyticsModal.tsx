'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Analytics {
    id: string
    general_impression: string | null
    positive_trends: string | null
    decline_reasons: string | null
    recommendations: string | null
    reflection_directions: string | null
}

interface EditAnalyticsModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    analytics: Analytics
}

export default function EditAnalyticsModal({
    isOpen,
    onClose,
    onSave,
    analytics
}: EditAnalyticsModalProps) {
    const [formData, setFormData] = useState({
        general_impression: '',
        positive_trends: '',
        decline_reasons: '',
        recommendations: '',
        reflection_directions: ''
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (analytics) {
            setFormData({
                general_impression: analytics.general_impression || '',
                positive_trends: analytics.positive_trends || '',
                decline_reasons: analytics.decline_reasons || '',
                recommendations: analytics.recommendations || '',
                reflection_directions: analytics.reflection_directions || ''
            })
        }
    }, [analytics])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/analytics/${analytics.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to update analytics')
            }

            onSave()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update analytics')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#F5F1EB] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-[#D4C8B5]">
                    <h2 className="text-2xl font-bold text-[#8B3A3A]">Редактирование отчета</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#E8E2D5] rounded-full transition-colors text-[#8B3A3A]"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <form id="edit-analytics-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#8B3A3A] mb-2">
                                Общее впечатление
                            </label>
                            <textarea
                                value={formData.general_impression}
                                onChange={(e) => setFormData({ ...formData, general_impression: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[#D4C8B5] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] min-h-[120px] bg-white text-[#8B3A3A]"
                                placeholder="Общее впечатление о периоде..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#8B3A3A] mb-2">
                                Положительные тенденции
                            </label>
                            <textarea
                                value={formData.positive_trends}
                                onChange={(e) => setFormData({ ...formData, positive_trends: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[#D4C8B5] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] min-h-[120px] bg-white text-[#8B3A3A]"
                                placeholder="Что идет хорошо..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#8B3A3A] mb-2">
                                Возможные причины спада
                            </label>
                            <textarea
                                value={formData.decline_reasons}
                                onChange={(e) => setFormData({ ...formData, decline_reasons: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[#D4C8B5] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] min-h-[120px] bg-white text-[#8B3A3A]"
                                placeholder="Что могло повлиять на настроение..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#8B3A3A] mb-2">
                                Рекомендации и техники
                            </label>
                            <textarea
                                value={formData.recommendations}
                                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[#D4C8B5] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] min-h-[120px] bg-white text-[#8B3A3A]"
                                placeholder="Конкретные советы..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#8B3A3A] mb-2">
                                Направление для размышлений
                            </label>
                            <textarea
                                value={formData.reflection_directions}
                                onChange={(e) => setFormData({ ...formData, reflection_directions: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[#D4C8B5] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] min-h-[120px] bg-white text-[#8B3A3A]"
                                placeholder="Вопросы для саморефлексии..."
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[#D4C8B5] bg-[#F5F1EB] flex justify-end gap-4 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-medium transition-colors hover:bg-[#E8E2D5] text-[#8B3A3A]"
                        disabled={saving}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        form="edit-analytics-form"
                        disabled={saving}
                        className="px-6 py-2 rounded-lg font-medium transition-colors bg-[#8B3A3A] text-white hover:bg-[#7A3333] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            'Сохранить изменения'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
