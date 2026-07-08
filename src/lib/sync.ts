import { supabase } from './supabase'
import { DeckData, CardPair } from '@/data/sample-decks'

export interface SyncedDeck {
  id: string
  title: string
  subject: string
  description: string | null
  is_public: boolean
  cards: CardPair[]
}

// Buscar decks do usuário + públicos (single query, no N+1)
export async function fetchDecks(userId: string): Promise<SyncedDeck[]> {
  const { data: decks, error } = await supabase
    .from('decks')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (error || !decks || decks.length === 0) return []

  // Fetch ALL cards for these decks in one query
  const deckIds = decks.map(d => d.id)
  const { data: allCards } = await supabase
    .from('cards')
    .select('deck_id, front, back')
    .in('deck_id', deckIds)

  // Group cards by deck_id
  const cardsByDeck: Record<string, CardPair[]> = {}
  for (const card of allCards ?? []) {
    if (!cardsByDeck[card.deck_id]) cardsByDeck[card.deck_id] = []
    cardsByDeck[card.deck_id].push({ front: card.front, back: card.back })
  }

  return decks.map(deck => ({
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    description: deck.description,
    is_public: deck.is_public,
    cards: cardsByDeck[deck.id] ?? [],
  }))
}

// Criar novo deck com cards
export async function createDeck(
  userId: string,
  deck: { title: string; subject: string; description: string; cards: CardPair[] }
): Promise<SyncedDeck | null> {
  const { data: newDeck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      title: deck.title,
      subject: deck.subject,
      description: deck.description,
      is_public: false,
    })
    .select()
    .single()

  if (deckError || !newDeck) return null

  const cardsToInsert = deck.cards.map((card) => ({
    deck_id: newDeck.id,
    front: card.front,
    back: card.back,
  }))

  const { error: cardsError } = await supabase
    .from('cards')
    .insert(cardsToInsert)

  if (cardsError) return null

  return {
    id: newDeck.id,
    title: newDeck.title,
    subject: newDeck.subject,
    description: newDeck.description,
    is_public: newDeck.is_public,
    cards: deck.cards,
  }
}

// Deletar deck

// Seed: salvar decks de exemplo no Supabase pra um usuário novo
export async function seedSampleDecks(
  userId: string,
  sampleDecks: DeckData[]
): Promise<void> {
  // Buscar títulos dos decks existentes do usuário
  const { data: existing } = await supabase
    .from('decks')
    .select('title')
    .eq('user_id', userId)

  const existingTitles = new Set((existing ?? []).map(d => d.title))
  const newDecks = sampleDecks.filter(d => !existingTitles.has(d.title))

  if (newDecks.length === 0) return

  // Batch insert: create all decks first, then all cards
  const deckInserts = newDecks.map(d => ({
    user_id: userId,
    title: d.title,
    subject: d.subject,
    description: d.description,
    is_public: false,
  }))

  const { data: createdDecks } = await supabase
    .from('decks')
    .insert(deckInserts)
    .select('id, title')

  if (!createdDecks || createdDecks.length === 0) return

  // Map created deck IDs to their cards
  const allCards: { deck_id: string; front: string; back: string }[] = []
  for (const created of createdDecks) {
    const source = newDecks.find(d => d.title === created.title)
    if (!source) continue
    for (const card of source.cards) {
      allCards.push({ deck_id: created.id, front: card.front, back: card.back })
    }
  }

  // Insert cards in batches of 500 (Supabase limit)
  for (let i = 0; i < allCards.length; i += 500) {
    const batch = allCards.slice(i, i + 500)
    await supabase.from('cards').insert(batch)
  }
}
