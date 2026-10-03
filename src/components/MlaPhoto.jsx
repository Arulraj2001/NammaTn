'use client'
import React, { useState } from 'react'

const PARTY_COLORS = {
  tvk: '#FF6B00',
  dmk: '#E31E24',
  aiadmk: '#00A651',
  bjp: '#FF9933',
  'bjp-tn': '#FF9933',
  inc: '#1E40AF',
  vck: '#0284C7',
  pmk: '#CA8A04',
  ntk: '#18181B',
  independent: '#64748B'
}

function getInitials(name = '') {
  const parts = name.replace(/^(Thiru|Dr\.|Prof\.|Tmt\.)\s+/i, '').trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function MlaPhoto({ 
  photoUrl, 
  name = 'MLA', 
  partySlug = 'dmk', 
  size = 'md',
  className = '' 
}) {
  const [error, setError] = useState(false)

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  }

  const badgeColor = PARTY_COLORS[partySlug] || '#475569'
  const initials = getInitials(name)

  if (!photoUrl || error) {
    return (
      <div 
        className={`${sizeClasses[size] || sizeClasses.md} rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-xs border border-white/20 select-none ${className}`}
        style={{ backgroundColor: badgeColor }}
        title={name}
      >
        <span>{initials}</span>
      </div>
    )
  }

  return (
    <img 
      src={photoUrl} 
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={`${sizeClasses[size] || sizeClasses.md} rounded-2xl object-cover object-top border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xs ${className}`}
    />
  )
}
