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

const tierBorders: Record<Tier, string> = {
  bronze: 'border-orange-400',
  silver: 'border-slate-300',
  gold: 'border-yellow-400',
}

const tierLabels: Record<Tier, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
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
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div className="flex-1 text-center text-white font-medium">Perfil</div>
        <div className="w-16" />
      </div>

      {/* Level Block */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-center">
        <div className={`text-sm font-medium ${levelInfo.faixaColor} mb-1`}>
          {levelInfo.faixa}
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          Nível {levelInfo.level}
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-sm text-slate-400">
          {levelInfo.xpInLevel} / {levelInfo.xpForLevel} XP
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Total: {progress.totalXp.toLocaleString()} XP
        </div>
      </div>

      {/* Medals Grid */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <div className="text-white font-medium mb-4">Conquistas</div>
        <div className="grid grid-cols-5 gap-3">
          {MEDALS.map((medal) => {
            const highestTier = getHighestTier(medal.id)
            const isUnlocked = highestTier !== null

            return (
              <div
                key={medal.id}
                className={`flex flex-col items-center p-2 rounded-xl ${
                  isUnlocked
                    ? `border-2 ${tierBorders[highestTier!]} bg-slate-700/50`
                    : 'border border-slate-700 opacity-40'
                }`}
                title={isUnlocked ? `${medal.name} ${tierLabels[highestTier!]}` : `${medal.name} — trancado`}
              >
                <span className="text-xl">{isUnlocked ? medal.emoji : '🔒'}</span>
                <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                  {medal.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="text-white font-medium mb-4">Estatísticas</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{progress.totalReviews}</div>
            <div className="text-xs text-slate-500">Cards revisados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
            <div className="text-xs text-slate-500">Acurácia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{progress.gamesPlayed}</div>
            <div className="text-xs text-slate-500">Jogos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{progress.decksCreated}</div>
            <div className="text-xs text-slate-500">Decks criados</div>
          </div>
        </div>
      </div>
    </div>
  )
}
