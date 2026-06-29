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
      <div className="bg-slate-800 rounded-2xl p-8">
        <div className="text-2xl font-bold text-white mb-2">
          {remaining <= 0 ? '🎉 Sessão completa!' : '📊 Progresso'}
        </div>

        <div className="text-slate-400 mb-6">
          {reviewed}/{totalDue} cards revisados
        </div>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{correct}</div>
            <div className="text-xs text-slate-500">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{incorrect}</div>
            <div className="text-xs text-slate-500">Erros</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
            <div className="text-xs text-slate-500">Precisão</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
          >
            Voltar pro menu
          </button>
        </div>
      </div>
    </div>
  )
}
