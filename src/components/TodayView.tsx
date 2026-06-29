'use client'

interface TodayViewProps {
  dueCount: number
  onStudy: () => void
}

export default function TodayView({ dueCount, onStudy }: TodayViewProps) {
  if (dueCount === 0) {
    return (
      <div className="mb-10 py-3">
        <span className="text-emerald-500 text-sm">✓ Em dia</span>
      </div>
    )
  }

  return (
    <div className="mb-10 flex items-center justify-between">
      <div>
        <span className="text-neutral-100 text-sm">
          {dueCount} {dueCount === 1 ? 'card pendente' : 'cards pendentes'}
        </span>
      </div>
      <button
        onClick={onStudy}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-medium transition-colors cursor-pointer"
      >
        Estudar
      </button>
    </div>
  )
}
