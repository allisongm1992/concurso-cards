'use client'

import { LevelInfo } from '@/lib/xp'
import { MEDALS, UnlockedMedal, Tier } from '@/lib/medals'
import { UserProgress } from '@/lib/progress'

interface ProfileScreenProps {
  levelInfo: LevelInfo
  progress: UserProgress
  medals: UnlockedMedal[]
  onBack: () => void
}

const tierColors: Record<Tier, string> = {
  bronze: 'ring-orange-400/60',
  silver: 'ring-slate-300/60',
  gold: 'ring-yellow-400/60',
}

export default function ProfileScreen({ levelInfo, progress, medals, onBack }: ProfileScreenProps) {
  const progressPercent = Math.round((levelInfo.xpInLevel / levelInfo.xpForLevel) * 100)
  const accuracy = progress.totalReviews > 0
    ? Math.round((progress.totalCorrect / progress.totalReviews) * 100)
    : 0

  function getHighestTier(medalId: string): Tier | null {
    const tiers: Tier[] = ['gold', 'silver', 'bronze']
    for (const tier of tiers) {
      if (medals.some((m) => m.medalId === medalId && m.tier === tier)) {
        return tier
      }
    }
    return null
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
      </div>

      {/* Level */}
      <div className="mb-10 text-center">
        <div className={`text-xs font-medium ${levelInfo.faixaColor} uppercase tracking-wide`}>
          {levelInfo.faixa}
        </div>
        <div className="text-4xl font-bold text-white mt-1">
          {levelInfo.level}
        </div>
        <div className="w-full max-w-48 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-slate-600 mt-2">
          {levelInfo.xpInLevel} / {levelInfo.xpForLevel} XP
        </div>
      </div>

      {/* Medals */}
      <div className="mb-10">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Conquistas</div>
        <div className="grid grid-cols-5 gap-3">
          {MEDALS.map((medal) => {
            const highestTier = getHighestTier(medal.id)
            const isUnlocked = highestTier !== null

            return (
              <div
                key={medal.id}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isUnlocked
                    ? `ring-2 ${tierColors[highestTier!]} bg-slate-800/50`
                    : 'opacity-30'
                }`}
                title={medal.name}
              >
                <span className="text-lg">{isUnlocked ? medal.emoji : '·'}</span>
                <span className="text-[9px] text-slate-500 mt-1 truncate w-full text-center">
                  {medal.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Estatísticas</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <div className="text-xl font-bold text-white tabular-nums">{progress.totalReviews}</div>
            <div className="text-xs text-slate-600">Cards revisados</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tabular-nums">{accuracy}%</div>
            <div className="text-xs text-slate-600">Acurácia</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tabular-nums">{progress.gamesPlayed}</div>
            <div className="text-xs text-slate-600">Jogos</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tabular-nums">{progress.totalXp.toLocaleString()}</div>
            <div className="text-xs text-slate-600">XP total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
