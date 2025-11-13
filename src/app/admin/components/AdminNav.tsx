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
    <nav className="shadow-sm" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="handwritten text-3xl font-bold" style={{ color: '#8B3A3A' }}>
                MoodFlow Admin
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all hover:bg-[#D4C8B5]"
                  style={{ color: '#8B3A3A' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

