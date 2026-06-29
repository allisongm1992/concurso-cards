'use client'

import { LevelInfo } from '@/lib/xp'

interface XpBadgeProps {
  levelInfo: LevelInfo
  onClick: () => void
}

export default function XpBadge({ levelInfo, onClick }: XpBadgeProps) {
  const progressPercent = Math.round((levelInfo.xpInLevel / levelInfo.xpForLevel) * 100)

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      title={`${levelInfo.faixa} • ${levelInfo.xpInLevel}/${levelInfo.xpForLevel} XP`}
    >
      <span className={`text-sm font-bold ${levelInfo.faixaColor}`}>
        Lv.{levelInfo.level}
      </span>
      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </button>
  )
}
