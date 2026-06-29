'use client'

interface TodayViewProps {
  dueCount: number
  onStudy: () => void
}

export default function TodayView({ dueCount, onStudy }: TodayViewProps) {
  if (dueCount === 0) {
    return (
      <div className="w-full bg-green-900/20 border border-green-700/30 rounded-2xl p-5 mb-6 text-center">
        <div className="text-2xl mb-1">✅</div>
        <div className="text-green-400 font-medium">Tudo em dia!</div>
        <div className="text-slate-500 text-sm">Próxima revisão amanhã</div>
      </div>
    )
  }

  return (
    <div className="w-full bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-medium">
            📚 {dueCount} {dueCount === 1 ? 'card' : 'cards'} pra revisar
          </div>
          <div className="text-slate-500 text-sm">Estude agora e mantenha a memória fresca</div>
        </div>
        <button
          onClick={onStudy}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
        >
          Estudar agora
        </button>
      </div>
    </div>
  )
}
