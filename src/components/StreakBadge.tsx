'use client'

import { StreakData } from '@/lib/streaks'

interface StreakBadgeProps {
  streak: StreakData
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak.currentStreak === 0 && !streak.streakAtRisk) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        streak.streakAtRisk
          ? 'text-amber-400 animate-pulse-fire'
          : 'text-orange-400'
      }`}
      title={`Sequência: ${streak.currentStreak} dias${streak.freezeAvailable ? ' | ❄️ Freeze disponível' : ''}`}
    >
      <span>🔥</span>
      <span>{streak.currentStreak}</span>
      {streak.freezeAvailable && (
        <span className="text-blue-400 text-xs ml-1" title="Freeze disponível">❄️</span>
      )}
    </div>
  )
}
