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

// Buscar decks do usuário + públicos
export async function fetchDecks(userId: string): Promise<SyncedDeck[]> {
  const { data: decks, error } = await supabase
    .from('decks')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (error || !decks) return []

  const decksWithCards: SyncedDeck[] = []

  for (const deck of decks) {
    const { data: cards } = await supabase
      .from('cards')
      .select('front, back')
      .eq('deck_id', deck.id)

    decksWithCards.push({
      id: deck.id,
      title: deck.title,
      subject: deck.subject,
      description: deck.description,
      is_public: deck.is_public,
      cards: cards ?? [],
    })
  }

  return decksWithCards
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
export async function deleteDeck(deckId: string): Promise<boolean> {
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)

  return !error
}

// Seed: salvar decks de exemplo no Supabase pra um usuário novo
export async function seedSampleDecks(
  userId: string,
  sampleDecks: DeckData[]
): Promise<void> {
  // Checar se já tem decks
  const { data: existing } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) return

  // Inserir decks de exemplo
  for (const deck of sampleDecks) {
    await createDeck(userId, {
      title: deck.title,
      subject: deck.subject,
      description: deck.description,
      cards: deck.cards,
    })
  }
}
