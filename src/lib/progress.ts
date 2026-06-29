import { supabase } from './supabase'
import { calculateLevel, getXpForMedal } from './xp'
import { checkMedals, MedalCheck, UnlockedMedal, Tier } from './medals'

export interface UserProgress {
  totalXp: number
  gamesPlayed: number
  studySessions: number
  totalReviews: number
  totalCorrect: number
  fastestGame: number | null
  decksCreated: number
  totalFreezesUsed: number
}

export async function getProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Create initial record
    const { data: newRow } = await supabase
      .from('user_progress')
      .insert({ user_id: userId })
      .select()
      .single()

    if (!newRow) {
      return {
        totalXp: 0,
        gamesPlayed: 0,
        studySessions: 0,
        totalReviews: 0,
        totalCorrect: 0,
        fastestGame: null,
        decksCreated: 0,
        totalFreezesUsed: 0,
      }
    }

    return mapRow(newRow)
  }

  return mapRow(data)
}

export async function addXp(userId: string, xp: number): Promise<UserProgress> {
  const current = await getProgress(userId)
  const newXp = current.totalXp + xp

  await supabase
    .from('user_progress')
    .update({ total_xp: newXp })
    .eq('user_id', userId)

  return { ...current, totalXp: newXp }
}

export async function recordStudySession(
  userId: string,
  cardsReviewed: number,
  cardsCorrect: number,
  xpEarned: number
): Promise<{ progress: UserProgress; newMedals: MedalCheck[] }> {
  const current = await getProgress(userId)

  const updated = {
    total_xp: current.totalXp + xpEarned,
    study_sessions: current.studySessions + 1,
    total_reviews: current.totalReviews + cardsReviewed,
    total_correct: current.totalCorrect + cardsCorrect,
  }

  await supabase
    .from('user_progress')
    .update(updated)
    .eq('user_id', userId)

  const newProgress: UserProgress = {
    ...current,
    totalXp: updated.total_xp,
    studySessions: updated.study_sessions,
    totalReviews: updated.total_reviews,
    totalCorrect: updated.total_correct,
  }

  const newMedals = await checkAndAwardMedals(userId, newProgress)
  return { progress: newProgress, newMedals }
}

export async function recordMatchingGame(
  userId: string,
  xpEarned: number,
  timeSeconds: number
): Promise<{ progress: UserProgress; newMedals: MedalCheck[] }> {
  const current = await getProgress(userId)

  const newFastest =
    current.fastestGame === null
      ? timeSeconds
      : Math.min(current.fastestGame, timeSeconds)

  const updated = {
    total_xp: current.totalXp + xpEarned,
    games_played: current.gamesPlayed + 1,
    fastest_game: newFastest,
  }

  await supabase
    .from('user_progress')
    .update(updated)
    .eq('user_id', userId)

  const newProgress: UserProgress = {
    ...current,
    totalXp: updated.total_xp,
    gamesPlayed: updated.games_played,
    fastestGame: updated.fastest_game,
  }

  const newMedals = await checkAndAwardMedals(userId, newProgress)
  return { progress: newProgress, newMedals }
}

export async function recordDeckCreated(
  userId: string
): Promise<{ progress: UserProgress; newMedals: MedalCheck[] }> {
  const current = await getProgress(userId)

  await supabase
    .from('user_progress')
    .update({ decks_created: current.decksCreated + 1 })
    .eq('user_id', userId)

  const newProgress: UserProgress = {
    ...current,
    decksCreated: current.decksCreated + 1,
  }

  const newMedals = await checkAndAwardMedals(userId, newProgress)
  return { progress: newProgress, newMedals }
}

export async function recordFreezeUsed(
  userId: string
): Promise<{ progress: UserProgress; newMedals: MedalCheck[] }> {
  const current = await getProgress(userId)

  await supabase
    .from('user_progress')
    .update({ total_freezes_used: current.totalFreezesUsed + 1 })
    .eq('user_id', userId)

  const newProgress: UserProgress = {
    ...current,
    totalFreezesUsed: current.totalFreezesUsed + 1,
  }

  const newMedals = await checkAndAwardMedals(userId, newProgress)
  return { progress: newProgress, newMedals }
}

export async function getUserMedals(userId: string): Promise<UnlockedMedal[]> {
  const { data, error } = await supabase
    .from('user_medals')
    .select('medal_id, tier, unlocked_at')
    .eq('user_id', userId)

  if (error || !data) return []

  return data.map((m) => ({
    medalId: m.medal_id,
    tier: m.tier as Tier,
    unlockedAt: m.unlocked_at,
  }))
}

async function checkAndAwardMedals(
  userId: string,
  progress: UserProgress
): Promise<MedalCheck[]> {
  const unlocked = await getUserMedals(userId)

  // Get longest streak from user_streaks
  const { data: streakData } = await supabase
    .from('user_streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single()

  const longestStreak = streakData?.longest_streak ?? 0
  const accuracy =
    progress.totalReviews > 0
      ? Math.round((progress.totalCorrect / progress.totalReviews) * 100)
      : 0

  const levelInfo = calculateLevel(progress.totalXp)

  const stats = {
    totalReviews: progress.totalReviews,
    longestStreak,
    accuracy,
    totalReviewsForAccuracy: progress.totalReviews,
    gamesPlayed: progress.gamesPlayed,
    decksCreated: progress.decksCreated,
    fastestGame: progress.fastestGame,
    studySessions: progress.studySessions,
    currentLevel: levelInfo.level,
    totalFreezesUsed: progress.totalFreezesUsed,
    totalXp: progress.totalXp,
  }

  const newMedals = checkMedals(stats, unlocked)

  // Award new medals
  for (const medal of newMedals) {
    await supabase.from('user_medals').insert({
      user_id: userId,
      medal_id: medal.medalId,
      tier: medal.tier,
    })

    // Bonus XP for medal
    const bonusXp = getXpForMedal()
    await supabase
      .from('user_progress')
      .update({ total_xp: progress.totalXp + bonusXp })
      .eq('user_id', userId)
    progress = { ...progress, totalXp: progress.totalXp + bonusXp }
  }

  return newMedals
}

function mapRow(row: Record<string, unknown>): UserProgress {
  return {
    totalXp: (row.total_xp as number) ?? 0,
    gamesPlayed: (row.games_played as number) ?? 0,
    studySessions: (row.study_sessions as number) ?? 0,
    totalReviews: (row.total_reviews as number) ?? 0,
    totalCorrect: (row.total_correct as number) ?? 0,
    fastestGame: (row.fastest_game as number | null) ?? null,
    decksCreated: (row.decks_created as number) ?? 0,
    totalFreezesUsed: (row.total_freezes_used as number) ?? 0,
  }
}
