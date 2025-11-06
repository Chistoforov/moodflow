'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Глобальные настройки для всех SWR хуков
        revalidateOnFocus: false, // Не перезагружать при фокусе на окне
        revalidateOnReconnect: false, // Не перезагружать при восстановлении соединения
        dedupingInterval: 60000, // Не делать повторные запросы в течение 60 секунд
        shouldRetryOnError: false, // Не повторять запросы при ошибке
        errorRetryCount: 1, // Максимум 1 попытка при ошибке
        // Кеш будет работать автоматически между всеми компонентами
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  )
}




