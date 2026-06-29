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
      className={`text-xs tabular-nums ${
        streak.streakAtRisk
          ? 'text-amber-500 animate-pulse-fire'
          : 'text-neutral-500'
      }`}
      title={`${streak.currentStreak} dias${streak.freezeAvailable ? ' · freeze disponível' : ''}`}
    >
      {streak.currentStreak}d
    </div>
  )
}
