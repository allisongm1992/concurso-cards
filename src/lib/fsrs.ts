export type Rating = 'again' | 'good'

interface ReviewResult {
  stability: number
  difficulty: number
  dueDate: string
}

const DECAY = -0.5
const FACTOR = 0.9

export function calculateNextReview(
  stability: number,
  difficulty: number,
  rating: Rating
): ReviewResult {
  const today = new Date()

  if (rating === 'again') {
    const newStability = Math.max(0.5, stability * 0.5)
    const newDifficulty = Math.min(1, difficulty + 0.2)
    const due = new Date(today)
    due.setUTCDate(due.getUTCDate() + 1)
    return {
      stability: newStability,
      difficulty: newDifficulty,
      dueDate: due.toISOString().split('T')[0],
    }
  }

  // rating === 'good'
  const newStability = stability * (1 + Math.exp(DECAY) * FACTOR * Math.pow(stability, -0.5))
  const newDifficulty = Math.max(0, difficulty - 0.1)
  const intervalDays = Math.ceil(newStability)
  const due = new Date(today)
  due.setUTCDate(due.getUTCDate() + intervalDays)

  return {
    stability: newStability,
    difficulty: newDifficulty,
    dueDate: due.toISOString().split('T')[0],
  }
}
