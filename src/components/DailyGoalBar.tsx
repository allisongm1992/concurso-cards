'use client'

import { DailyGoal } from '@/lib/daily-goal'

interface DailyGoalBarProps {
  goal: DailyGoal
  onChangeTarget: () => void
}

export default function DailyGoalBar({ goal, onChangeTarget }: DailyGoalBarProps) {
  const percent = Math.min(100, Math.round((goal.todayCount / goal.target) * 100))
  const completed = goal.todayCount >= goal.target

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-neutral-500">
          {completed ? (
            <span className="text-emerald-500">✓ Meta do dia batida</span>
          ) : (
            <span>{goal.todayCount}/{goal.target} cards hoje</span>
          )}
        </div>
        <button
          onClick={onChangeTarget}
          className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer"
        >
          Meta: {goal.target}
        </button>
      </div>
      <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completed ? 'bg-emerald-500' : 'bg-neutral-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
