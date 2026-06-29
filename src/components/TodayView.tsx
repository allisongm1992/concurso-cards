'use client'

interface TodayViewProps {
  dueCount: number
  onStudy: () => void
}

export default function TodayView({ dueCount, onStudy }: TodayViewProps) {
  if (dueCount === 0) {
    return (
      <div className="mb-8 py-4 text-center">
        <div className="text-green-400 text-sm font-medium">✓ Tudo em dia</div>
        <div className="text-slate-600 text-xs mt-1">Próxima revisão amanhã</div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <div className="text-white text-sm font-medium">
            {dueCount} {dueCount === 1 ? 'card' : 'cards'} pra revisar
          </div>
          <div className="text-slate-600 text-xs mt-0.5">Mantenha a memória fresca</div>
        </div>
        <button
          onClick={onStudy}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors"
        >
          Estudar
        </button>
      </div>
    </div>
  )
}
