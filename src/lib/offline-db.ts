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

class ConcursoCardsDB extends Dexie {
  decks!: Table<OfflineDeck>

  constructor() {
    super('concurso-cards')
    this.version(1).stores({
      decks: '++id, remoteId, title',
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
