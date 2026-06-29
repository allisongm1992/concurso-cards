'use client'

import { useEffect } from 'react'
import { MEDALS, Tier } from '@/lib/medals'

interface MedalUnlockProps {
  medalId: string
  tier: Tier
  onDismiss: () => void
}

const tierLabels: Record<Tier, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
}

const tierColors: Record<Tier, string> = {
  bronze: 'text-orange-400',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
}

export default function MedalUnlock({ medalId, tier, onDismiss }: MedalUnlockProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const medal = MEDALS.find((m) => m.id === medalId)
  if (!medal) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        onClick={onDismiss}
        className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 shadow-lg cursor-pointer flex items-center gap-3"
      >
        <span className="text-2xl">{medal.emoji}</span>
        <div>
          <div className="text-white text-sm font-medium">Nova conquista!</div>
          <div className={`text-xs ${tierColors[tier]}`}>
            {medal.name} {tierLabels[tier]}
          </div>
        </div>
        <span className="text-green-400 text-xs">+30 XP</span>
      </div>
    </div>
  )
}
