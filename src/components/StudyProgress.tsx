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
    <div className="w-full max-w-lg mx-auto px-4 py-6 text-center">
      <div className="mb-10">
        <div className="text-2xl font-bold text-white">
          {remaining <= 0 ? 'Sessão completa' : 'Progresso'}
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {reviewed} de {totalDue} cards revisados
        </div>
      </div>

      <div className="flex justify-center gap-12 mb-10">
        <div>
          <div className="text-3xl font-bold text-white tabular-nums">{correct}</div>
          <div className="text-xs text-slate-600 mt-1">Acertos</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white tabular-nums">{incorrect}</div>
          <div className="text-xs text-slate-600 mt-1">Erros</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white tabular-nums">{accuracy}%</div>
          <div className="text-xs text-slate-600 mt-1">Precisão</div>
        </div>
      </div>

      <div className="space-y-3">
        {remaining > 0 && (
          <button
            onClick={onContinue}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Continuar ({remaining} restantes)
          </button>
        )}
        <button
          onClick={onBack}
          className="w-full py-3 text-slate-500 hover:text-white text-sm transition-colors"
        >
          Voltar pro menu
        </button>
      </div>
    </div>
  )
}
