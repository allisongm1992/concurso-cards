'use client'

import { useEffect } from 'react'
import { StreakData, getStreakMessage } from '@/lib/streaks'

interface StreakSplashProps {
  streak: StreakData
  onDismiss: () => void
}

export default function StreakSplash({ streak, onDismiss }: StreakSplashProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const message = getStreakMessage(streak.currentStreak)

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 cursor-pointer"
      role="button"
      aria-label="Fechar"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onDismiss()}
    >
      <div className="text-center px-8 animate-fade-in">
        {streak.currentStreak > 0 && (
          <div className="text-6xl font-bold text-neutral-100 tracking-tight">
            {streak.currentStreak}
          </div>
        )}

        <div className="text-lg text-neutral-400 mt-3">
          {message}
        </div>

        {streak.streakAtRisk && (
          <div className="text-amber-500 text-sm mt-6">
            Jogue hoje pra manter
          </div>
        )}

        <div className="text-neutral-800 text-xs mt-12">
          toque para continuar
        </div>
      </div>
    </div>
  )
}
