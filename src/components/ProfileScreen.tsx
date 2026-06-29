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
  bronze: 'text-orange-400',
  silver: 'text-neutral-300',
  gold: 'text-yellow-400',
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
    <div className="w-full max-w-lg mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
      >
        ← Voltar
      </button>

      {/* Level */}
      <div className="mt-12 mb-16">
        <div className="text-xs text-neutral-600 uppercase tracking-wider">{levelInfo.faixa}</div>
        <div className="text-5xl font-bold tracking-tight mt-1">{levelInfo.level}</div>
        <div className="w-full h-1 bg-neutral-900 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-neutral-700 mt-2 tabular-nums">
          {levelInfo.xpInLevel}/{levelInfo.xpForLevel} XP
        </div>
      </div>

      {/* Medals */}
      <div className="mb-16">
        <div className="text-xs text-neutral-600 uppercase tracking-wider mb-6">Conquistas</div>
        <div className="grid grid-cols-5 gap-4">
          {MEDALS.map((medal) => {
            const highestTier = getHighestTier(medal.id)
            const isUnlocked = highestTier !== null

            return (
              <div
                key={medal.id}
                className={`flex flex-col items-center ${
                  isUnlocked ? '' : 'opacity-20'
                }`}
                title={isUnlocked ? `${medal.name}` : `${medal.name} — trancado`}
              >
                <span className={`text-lg ${isUnlocked ? tierColors[highestTier!] : ''}`}>
                  {medal.emoji}
                </span>
                <span className="text-[9px] text-neutral-600 mt-1">
                  {medal.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="text-xs text-neutral-600 uppercase tracking-wider mb-6">Estatísticas</div>
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <div className="text-2xl font-bold tabular-nums">{progress.totalReviews}</div>
            <div className="text-xs text-neutral-600">Revisados</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{accuracy}%</div>
            <div className="text-xs text-neutral-600">Acurácia</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{progress.gamesPlayed}</div>
            <div className="text-xs text-neutral-600">Jogos</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{progress.totalXp.toLocaleString()}</div>
            <div className="text-xs text-neutral-600">XP total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
