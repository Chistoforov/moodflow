'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import useSWR, { mutate } from 'swr'

// Fetcher функция для SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function BottomNav() {
  const pathname = usePathname()
  
  // Используем SWR для кеширования счетчика непрочитанных
  const { data } = useSWR('/api/posts/unread-count', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Обновлять не чаще раз в 30 секунд
  })
  
  const unreadCount = data?.unreadCount || 0

  useEffect(() => {
    // Слушаем событие обновления счетчика для принудительного обновления
    const handleUpdateCount = () => {
      mutate('/api/posts/unread-count')
    }
    
    window.addEventListener('updateUnreadCount', handleUpdateCount)
    
    return () => {
      window.removeEventListener('updateUnreadCount', handleUpdateCount)
    }
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 shadow-lg border-t z-50"
      style={{ 
        backgroundColor: 'rgba(26, 29, 46, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-20">
          {/* Календарь */}
          <Link
            href="/calendar"
            className="flex flex-col items-center justify-center min-w-[80px] py-2"
          >
            <div 
              className="relative p-2 rounded-2xl transition-all"
              style={{
                backgroundColor: isActive('/calendar') ? '#7c5cff' : 'transparent'
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
                style={{ 
                  color: isActive('/calendar') ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  strokeWidth: isActive('/calendar') ? 2 : 1.5
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>
            <span
              className="text-xs font-medium mt-1"
              style={{ 
                color: isActive('/calendar') ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: isActive('/calendar') ? 600 : 500
              }}
            >
              Календарь
            </span>
          </Link>

          {/* Материалы */}
          <Link
            href="/materials"
            className="flex flex-col items-center justify-center min-w-[80px] py-2"
          >
            <div 
              className="relative p-2 rounded-2xl transition-all"
              style={{
                backgroundColor: isActive('/materials') ? '#7c5cff' : 'transparent'
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
                style={{ 
                  color: isActive('/materials') ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  strokeWidth: isActive('/materials') ? 2 : 1.5
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
              {unreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            <span
              className="text-xs font-medium mt-1"
              style={{ 
                color: isActive('/materials') ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: isActive('/materials') ? 600 : 500
              }}
            >
              Материалы
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

