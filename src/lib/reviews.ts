import { supabase } from './supabase'
import { calculateNextReview, Rating } from './fsrs'

export type { Rating } from './fsrs'

export interface DueCard {
  id: string
  front: string
  back: string
  deckId: string
  stability: number
  difficulty: number
}

export async function fetchDueCards(userId: string, deckId?: string): Promise<DueCard[]> {
  const today = new Date().toISOString().split('T')[0]

  if (deckId) {
    const { data, error } = await supabase
      .from('cards')
      .select('id, front, back, deck_id, stability, difficulty, due_date')
      .eq('deck_id', deckId)
      .or(`due_date.lte.${today},due_date.is.null`)
      .order('due_date', { ascending: true, nullsFirst: true })

    if (error || !data) return []

    return data.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      deckId: card.deck_id,
      stability: card.stability ?? 1.0,
      difficulty: card.difficulty ?? 0.5,
    }))
  }

  // All decks for user
  const { data: userDecks } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)

  if (!userDecks || userDecks.length === 0) return []
  const deckIds = userDecks.map(d => d.id)

  const { data, error } = await supabase
    .from('cards')
    .select('id, front, back, deck_id, stability, difficulty, due_date')
    .in('deck_id', deckIds)
    .or(`due_date.lte.${today},due_date.is.null`)
    .order('due_date', { ascending: true, nullsFirst: true })

  if (error || !data) return []

  return data.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back,
    deckId: card.deck_id,
    stability: card.stability ?? 1.0,
    difficulty: card.difficulty ?? 0.5,
  }))
}

export async function recordReview(
  userId: string,
  cardId: string,
  deckId: string,
  rating: Rating
): Promise<void> {
  // Get current card params
  const { data: card } = await supabase
    .from('cards')
    .select('stability, difficulty, times_seen, times_correct')
    .eq('id', cardId)
    .single()

  const stability = card?.stability ?? 1.0
  const difficulty = card?.difficulty ?? 0.5
  const timesSeen = card?.times_seen ?? 0
  const timesCorrect = card?.times_correct ?? 0

  // Calculate next review
  const result = calculateNextReview(stability, difficulty, rating)

  // Update card with new FSRS params
  await supabase
    .from('cards')
    .update({
      stability: result.stability,
      difficulty: result.difficulty,
      due_date: result.dueDate,
      last_review: new Date().toISOString(),
      times_seen: timesSeen + 1,
      times_correct: rating === 'good' ? timesCorrect + 1 : timesCorrect,
    })
    .eq('id', cardId)

  // Record review history
  await supabase
    .from('card_reviews')
    .insert({
      card_id: cardId,
      user_id: userId,
      rating,
    })
}

export async function getDueCount(userId: string): Promise<number> {
  const cards = await fetchDueCards(userId)
  return cards.length
}

export async function getDueCountByDeck(
  userId: string
): Promise<{ deckId: string; deckTitle: string; count: number }[]> {
  const { data: decks } = await supabase
    .from('decks')
    .select('id, title')
    .eq('user_id', userId)

  if (!decks) return []

  const today = new Date().toISOString().split('T')[0]
  const results: { deckId: string; deckTitle: string; count: number }[] = []

  for (const deck of decks) {
    const { count } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deck.id)
      .or(`due_date.lte.${today},due_date.is.null`)

    results.push({
      deckId: deck.id,
      deckTitle: deck.title,
      count: count ?? 0,
    })
  }

  return results
}
