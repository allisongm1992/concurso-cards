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
  silver: 'text-neutral-300',
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
        className="bg-neutral-900 border border-neutral-800 rounded-lg px-5 py-3 cursor-pointer flex items-center gap-3"
      >
        <span className="text-xl">{medal.emoji}</span>
        <div>
          <div className="text-neutral-200 text-xs font-medium">Nova conquista</div>
          <div className={`text-[11px] ${tierColors[tier]}`}>
            {medal.name} {tierLabels[tier]}
          </div>
        </div>
        <span className="text-emerald-500 text-xs">+30 XP</span>
      </div>
    </div>
  )
}
