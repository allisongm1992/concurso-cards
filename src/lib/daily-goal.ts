const STORAGE_KEY = 'daily-goal'
const PROGRESS_KEY = 'daily-goal-progress'

export interface DailyGoal {
  target: number // cards per day
  todayCount: number
  date: string
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getDailyGoal(): DailyGoal {
  const today = new Date().toISOString().split('T')[0]

  if (!isBrowser()) {
    return { target: 20, todayCount: 0, date: today }
  }

  const target = parseInt(localStorage.getItem(STORAGE_KEY) || '20', 10)

  const stored = localStorage.getItem(PROGRESS_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.date === today) {
        return { target, todayCount: parsed.count, date: today }
      }
    } catch {
      // ignore parse errors
    }
  }

  return { target, todayCount: 0, date: today }
}

export function setDailyGoalTarget(target: number) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY, String(target))
}

export function incrementDailyProgress(cards: number): DailyGoal {
  const today = new Date().toISOString().split('T')[0]
  const goal = getDailyGoal()

  const newCount = goal.date === today ? goal.todayCount + cards : cards
  if (isBrowser()) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ date: today, count: newCount }))
  }

  return { target: goal.target, todayCount: newCount, date: today }
}
