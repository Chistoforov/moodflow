'use client'

import Link from 'next/link'
import { CSSProperties, ReactNode } from 'react'

interface StyledLinkProps {
  href: string
  className?: string
  style?: CSSProperties
  hoverStyle?: CSSProperties
  children: ReactNode
}

export default function StyledLink({ 
  href, 
  className, 
  style, 
  hoverStyle,
  children 
}: StyledLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onMouseEnter={(e) => {
        if (hoverStyle) {
          Object.assign(e.currentTarget.style, hoverStyle)
        }
      }}
      onMouseLeave={(e) => {
        if (style) {
          Object.assign(e.currentTarget.style, style)
        }
      }}
    >
      {children}
    </Link>
  )
}


