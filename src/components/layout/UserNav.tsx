'use client'

import { useState } from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
      style={{ 
        color: '#8B3A3A',
        backgroundColor: isHovered ? '#D4C8B5' : 'transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  )
}

export default function UserNav() {
  return (
    <nav className="shadow-sm" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="handwritten text-3xl font-bold" style={{ color: '#8B3A3A' }}>
                MoodFlow
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <NavLink href="/calendar">Календарь</NavLink>
              <NavLink href="/recommendations">Рекомендации</NavLink>
              <NavLink href="/profile">Профиль</NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}






