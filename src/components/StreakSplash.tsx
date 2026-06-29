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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 cursor-pointer"
      role="button"
      aria-label="Fechar"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onDismiss()}
    >
      <div className="text-center px-8 animate-fade-in">
        {streak.currentStreak > 0 && (
          <div className="text-5xl font-bold text-white mb-3">
            {streak.currentStreak}
          </div>
        )}

        <div className="text-lg text-slate-200">
          {message}
        </div>

        {streak.streakAtRisk && (
          <div className="text-amber-400 text-sm mt-4">
            Jogue hoje pra manter a sequência
          </div>
        )}

        {streak.longestStreak > streak.currentStreak && (
          <div className="text-slate-600 text-xs mt-6">
            Recorde: {streak.longestStreak} dias
          </div>
        )}

        <div className="text-slate-700 text-xs mt-8">
          Toque para continuar
        </div>
      </div>
    </div>
  )
}
