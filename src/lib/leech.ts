import { supabase } from './supabase'
import { DueCard } from './reviews'

const LEECH_THRESHOLD = 3 // cards errados 3+ vezes

export interface LeechCard extends DueCard {
  errorCount: number
}

export async function getLeechCards(userId: string): Promise<LeechCard[]> {
  // Get user's decks
  const { data: userDecks } = await supabase
    .from('decks')
    .select('id, title')
    .eq('user_id', userId)

  if (!userDecks || userDecks.length === 0) return []

  const deckIds = userDecks.map(d => d.id)
  const deckTitles = Object.fromEntries(userDecks.map(d => [d.id, d.title]))

  // Get cards with high error count
  const { data: cards } = await supabase
    .from('cards')
    .select('id, front, back, deck_id, stability, difficulty, times_seen, times_correct')
    .in('deck_id', deckIds)
    .gt('times_seen', 0)

  if (!cards) return []

  // Filter: cards where errors >= LEECH_THRESHOLD
  const leechCards: LeechCard[] = []
  for (const card of cards) {
    const timesSeen = card.times_seen ?? 0
    const timesCorrect = card.times_correct ?? 0
    const errorCount = timesSeen - timesCorrect

    if (errorCount >= LEECH_THRESHOLD) {
      leechCards.push({
        id: card.id,
        front: card.front,
        back: card.back,
        deckId: card.deck_id,
        deckTitle: deckTitles[card.deck_id] || '',
        stability: card.stability ?? 1.0,
        difficulty: card.difficulty ?? 0.5,
        errorCount,
      })
    }
  }

  // Sort by most errors first
  leechCards.sort((a, b) => b.errorCount - a.errorCount)

  return leechCards
}

export async function getLeechCount(userId: string): Promise<number> {
  const cards = await getLeechCards(userId)
  return cards.length
}
