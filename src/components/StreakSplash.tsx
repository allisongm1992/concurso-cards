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
      aria-label="Fechar splash"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onDismiss()}
    >
      <div className="text-center px-6 animate-fade-in">
        {/* Fire emoji */}
        <div className="text-7xl mb-4">
          {streak.currentStreak > 0 ? '🔥' : '💤'}
        </div>

        {/* Streak number */}
        {streak.currentStreak > 0 && (
          <div className="text-6xl font-bold text-white mb-2">
            {streak.currentStreak}
          </div>
        )}

        {/* Motivational message */}
        <div className="text-xl text-slate-200 mb-4">
          {message}
        </div>

        {/* At risk warning */}
        {streak.streakAtRisk && (
          <div className="text-amber-400 text-sm mb-2">
            ⚠️ Jogue hoje pra manter sua sequência!
          </div>
        )}

        {/* Freeze status */}
        {!streak.freezeAvailable && (
          <div className="text-blue-400 text-xs">
            ❄️ Freeze usado esta semana
          </div>
        )}

        {/* Longest streak */}
        {streak.longestStreak > streak.currentStreak && (
          <div className="text-slate-500 text-xs mt-4">
            Recorde: {streak.longestStreak} dias
          </div>
        )}

        {/* Tap hint */}
        <div className="text-slate-600 text-xs mt-6">
          Toque para continuar
        </div>
      </div>
    </div>
  )
}
