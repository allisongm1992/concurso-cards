'use client'

interface StudyProgressProps {
  correct: number
  incorrect: number
  totalDue: number
  reviewed: number
  onContinue: () => void
  onBack: () => void
}

export default function StudyProgress({
  correct,
  incorrect,
  totalDue,
  reviewed,
  onContinue,
  onBack,
}: StudyProgressProps) {
  const remaining = totalDue - reviewed
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-8 text-center">
      <div className="mb-12">
        <div className="text-3xl font-bold tracking-tight">
          {remaining <= 0 ? 'Feito.' : 'Progresso'}
        </div>
        <div className="text-sm text-neutral-600 mt-2 tabular-nums">
          {reviewed} de {totalDue}
        </div>
      </div>

      <div className="flex justify-center gap-16 mb-12">
        <div>
          <div className="text-3xl font-bold tabular-nums">{correct}</div>
          <div className="text-xs text-neutral-600 mt-1">Acertos</div>
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums">{incorrect}</div>
          <div className="text-xs text-neutral-600 mt-1">Erros</div>
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums">{accuracy}%</div>
          <div className="text-xs text-neutral-600 mt-1">Precisão</div>
        </div>
      </div>

      <div className="space-y-3">
        {remaining > 0 && (
          <button
            onClick={onContinue}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Continuar ({remaining})
          </button>
        )}
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
