import { supabase } from './supabase'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastPlayedDate: string | null
  freezeAvailable: boolean
  playedToday: boolean
  streakAtRisk: boolean
}

interface StreakRow {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_played_date: string | null
  freeze_available: boolean
  freeze_used_at: string | null
}

function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayUTC(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]
}

function isNewWeek(freezeUsedAt: string | null): boolean {
  if (!freezeUsedAt) return true
  const usedDate = new Date(freezeUsedAt)
  const now = new Date()
  // Get Monday of current week
  const currentMonday = new Date(now)
  currentMonday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7))
  currentMonday.setUTCHours(0, 0, 0, 0)
  return usedDate < currentMonday
}

function mapRowToData(row: StreakRow): StreakData {
  const today = getTodayUTC()
  const playedToday = row.last_played_date === today
  const streakAtRisk = !playedToday && row.current_streak > 0

  return {
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastPlayedDate: row.last_played_date,
    freezeAvailable: row.freeze_available,
    playedToday,
    streakAtRisk,
  }
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const { data: newRow } = await supabase
      .from('user_streaks')
      .insert({ user_id: userId })
      .select()
      .single()

    if (!newRow) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayedDate: null,
        freezeAvailable: true,
        playedToday: false,
        streakAtRisk: false,
      }
    }

    return mapRowToData(newRow as StreakRow)
  }

  return mapRowToData(data as StreakRow)
}

export async function checkAndUpdateStreak(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return getStreakData(userId)
  }

  const row = data as StreakRow
  const today = getTodayUTC()
  const yesterday = getYesterdayUTC()

  // Already played today — nothing to do
  if (row.last_played_date === today) {
    return mapRowToData(row)
  }

  // Played yesterday — streak is safe
  if (row.last_played_date === yesterday) {
    return mapRowToData(row)
  }

  // Missed yesterday — check freeze
  if (row.current_streak > 0 && row.last_played_date !== null) {
    const freezeAvailable = row.freeze_available || isNewWeek(row.freeze_used_at)

    if (freezeAvailable) {
      // Use freeze — maintain streak
      const { data: updated } = await supabase
        .from('user_streaks')
        .update({
          freeze_available: false,
          freeze_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updated) return mapRowToData(updated as StreakRow)
    } else {
      // No freeze — reset streak
      const { data: updated } = await supabase
        .from('user_streaks')
        .update({
          current_streak: 0,
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updated) return mapRowToData(updated as StreakRow)
    }
  }

  return mapRowToData(row)
}

export async function recordDailyPlay(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // First play ever — create record with streak 1
    const today = getTodayUTC()
    const { data: newRow } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_played_date: today,
      })
      .select()
      .single()

    if (!newRow) {
      return {
        currentStreak: 1,
        longestStreak: 1,
        lastPlayedDate: today,
        freezeAvailable: true,
        playedToday: true,
        streakAtRisk: false,
      }
    }
    return mapRowToData(newRow as StreakRow)
  }

  const row = data as StreakRow
  const today = getTodayUTC()

  // Already played today
  if (row.last_played_date === today) {
    return mapRowToData(row)
  }

  // Increment streak
  const newStreak = row.current_streak + 1
  const newLongest = Math.max(newStreak, row.longest_streak)

  // Recharge freeze if new week
  const freezeAvailable = row.freeze_available || isNewWeek(row.freeze_used_at)

  const { data: updated } = await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_played_date: today,
      freeze_available: freezeAvailable,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (updated) return mapRowToData(updated as StreakRow)
  return mapRowToData(row)
}

export function getStreakMessage(streak: number): string {
  if (streak <= 0) return 'Comece sua sequência hoje! 🚀'
  if (streak === 1) return 'Primeiro passo! 🚀'
  if (streak === 2) return 'Dois dias! Continue! 💫'
  if (streak === 3) return 'Tá criando o hábito! 💪'
  if (streak <= 6) return `${streak} dias seguidos! 🔥`
  if (streak === 7) return 'Uma semana inteira! 🔥'
  if (streak <= 13) return `${streak} dias! Imparável! ⚡`
  if (streak === 14) return 'Duas semanas! Imparável! ⚡'
  if (streak <= 29) return `${streak} dias! Consistência bruta! 💎`
  if (streak === 30) return 'Um mês! Você é lenda! 🏆'
  return `${streak} dias! Absurdo! 👑`
}
