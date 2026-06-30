import Dexie, { type Table } from 'dexie'

export interface OfflineDeck {
  id?: number
  remoteId?: string
  title: string
  subject: string
  description: string
  cards: { front: string; back: string }[]
  updatedAt: number
}

export interface OfflineReview {
  id?: number
  cardId: string
  deckId: string
  rating: 'again' | 'good'
  reviewedAt: number
  synced: boolean
}

class ConcursoCardsDB extends Dexie {
  decks!: Table<OfflineDeck>
  reviews!: Table<OfflineReview>

  constructor() {
    super('concurso-cards')
    this.version(1).stores({
      decks: '++id, remoteId, title, subject',
      reviews: '++id, cardId, deckId, synced',
    })
  }
}

export const db = new ConcursoCardsDB()

// Save decks locally for offline access
export async function cacheDecksLocally(
  decks: { id?: string; title: string; subject: string; description: string; cards: { front: string; back: string }[] }[]
): Promise<void> {
  await db.decks.clear()
  const records: OfflineDeck[] = decks.map(d => ({
    remoteId: d.id,
    title: d.title,
    subject: d.subject,
    description: d.description,
    cards: d.cards,
    updatedAt: Date.now(),
  }))
  await db.decks.bulkAdd(records)
}

// Get cached decks when offline
export async function getCachedDecks(): Promise<OfflineDeck[]> {
  return db.decks.toArray()
}

// Save review for later sync
export async function saveOfflineReview(
  cardId: string,
  deckId: string,
  rating: 'again' | 'good'
): Promise<void> {
  await db.reviews.add({
    cardId,
    deckId,
    rating,
    reviewedAt: Date.now(),
    synced: false,
  })
}

// Get unsynced reviews
export async function getUnsyncedReviews(): Promise<OfflineReview[]> {
  return db.reviews.where('synced').equals(0).toArray()
}

// Mark reviews as synced
export async function markReviewsSynced(ids: number[]): Promise<void> {
  await db.reviews.where('id').anyOf(ids).modify({ synced: true })
}
