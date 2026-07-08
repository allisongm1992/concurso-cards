'use client'

interface ExamResultProps {
  correct: number
  incorrect: number
  total: number
  timeUsed: number
  timeLimit: number
  onBack: () => void
}

export default function ExamResult({ correct, incorrect, total, timeUsed, timeLimit, onBack }: ExamResultProps) {
  const answered = correct + incorrect
  const score = answered > 0 ? Math.round((correct / answered) * 100) : 0
  const unanswered = total - answered

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const getVerdict = () => {
    if (score >= 80) return 'Aprovado'
    if (score >= 60) return 'Quase lá'
    return 'Precisa revisar'
  }

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-8 text-center">
      <div className="mb-12">
        <div className="text-4xl font-bold tracking-tight">{score}%</div>
        <div className={`text-sm mt-2 ${
          score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {getVerdict()}
        </div>
      </div>

      <div className="flex justify-center gap-10 mb-12">
        <div>
          <div className="text-2xl font-bold tabular-nums text-emerald-400">{correct}</div>
          <div className="text-xs text-neutral-600 mt-1">Acertos</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-red-400">{incorrect}</div>
          <div className="text-xs text-neutral-600 mt-1">Erros</div>
        </div>
        {unanswered > 0 && (
          <div>
            <div className="text-2xl font-bold tabular-nums text-neutral-600">{unanswered}</div>
            <div className="text-xs text-neutral-600 mt-1">Não respondidos</div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold tabular-nums">{formatTime(timeUsed)}</div>
          <div className="text-xs text-neutral-600 mt-1">Tempo</div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors cursor-pointer"
      >
        Voltar ao menu
      </button>
    </div>
  )
}
