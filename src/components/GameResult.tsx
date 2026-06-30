'use client'

interface GameResultProps {
  score: number
  time: number
  totalPairs: number
  onPlayAgain: () => void
  onBack: () => void
}

export default function GameResult({ score, time, totalPairs, onPlayAgain, onBack }: GameResultProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMessage = () => {
    if (score > 800) return 'Excelente.'
    if (score > 500) return 'Bom resultado.'
    if (score > 200) return 'Tente melhorar o tempo.'
    return 'Continue praticando.'
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-12 text-center">
      <div className="mb-12">
        <div className="text-4xl font-bold tracking-tight">{score}</div>
        <div className="text-sm text-neutral-600 mt-2">{getMessage()}</div>
      </div>

      <div className="flex justify-center gap-12 mb-12">
        <div>
          <div className="text-xl font-bold tabular-nums">{formatTime(time)}</div>
          <div className="text-xs text-neutral-600 mt-1">Tempo</div>
        </div>
        <div>
          <div className="text-xl font-bold tabular-nums">{totalPairs}</div>
          <div className="text-xs text-neutral-600 mt-1">Pares</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onPlayAgain}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-sm text-white transition-colors cursor-pointer"
        >
          Jogar novamente
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 text-neutral-600 hover:text-neutral-300 text-sm transition-colors cursor-pointer"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
