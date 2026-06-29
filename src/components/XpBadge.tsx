'use client'

import { LevelInfo } from '@/lib/xp'

interface XpBadgeProps {
  levelInfo: LevelInfo
  onClick: () => void
}

export default function XpBadge({ levelInfo, onClick }: XpBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors tabular-nums cursor-pointer"
      title={`${levelInfo.faixa} · ${levelInfo.xpInLevel}/${levelInfo.xpForLevel} XP`}
    >
      Lv{levelInfo.level}
    </button>
  )
}
