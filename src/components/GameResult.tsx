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

  const getEmoji = () => {
    if (score > 800) return '🏆'
    if (score > 500) return '⭐'
    if (score > 200) return '👏'
    return '💪'
  }

  const getMessage = () => {
    if (score > 800) return 'Excelente! Você domina esse conteúdo!'
    if (score > 500) return 'Muito bom! Continue praticando!'
    if (score > 200) return 'Bom trabalho! Tente melhorar o tempo.'
    return 'Continue estudando! Cada rodada ajuda.'
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-6xl mb-4">{getEmoji()}</div>
        <h2 className="text-2xl font-bold mb-2">Partida completa!</h2>
        <p className="text-slate-400 mb-6">{getMessage()}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-700 rounded-xl p-3">
            <div className="text-xl font-bold text-blue-400">{score}</div>
            <div className="text-xs text-slate-400">Pontos</div>
          </div>
          <div className="bg-slate-700 rounded-xl p-3">
            <div className="text-xl font-bold text-green-400">{formatTime(time)}</div>
            <div className="text-xs text-slate-400">Tempo</div>
          </div>
          <div className="bg-slate-700 rounded-xl p-3">
            <div className="text-xl font-bold text-amber-400">{totalPairs}</div>
            <div className="text-xs text-slate-400">Pares</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
          >
            🔄 Jogar novamente
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
          >
            ← Escolher outro deck
          </button>
        </div>
      </div>
    </div>
  )
}
