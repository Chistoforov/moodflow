'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Пользователи' },
    { href: '/admin/materials', label: 'Материалы' },
  ]

  return (
    <nav 
      className="shadow-sm border-b" 
      style={{ 
        backgroundColor: 'rgba(26, 29, 46, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 
                className="handwritten text-3xl font-bold" 
                style={{ 
                  background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 50%, #d893ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                MoodFlow Admin
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-4 py-2 text-base font-medium rounded-full transition-all"
                    style={{ 
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: isActive ? '#7c5cff' : 'transparent'
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

