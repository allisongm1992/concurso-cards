import { DeckData } from '@/data/sample-decks'
import { generateJSON } from './deck-io'

// Encode deck as base64 URL-safe string
export function encodeDeckForShare(deck: DeckData): string {
  const json = generateJSON(deck)
  // Use btoa with URI encoding for special chars
  const encoded = btoa(unescape(encodeURIComponent(json)))
  return encoded
}

// Decode shared deck from base64
export function decodeDeckFromShare(encoded: string): DeckData | null {
  try {
    // Limit payload size (max ~200KB encoded = ~150KB decoded)
    if (encoded.length > 200000) return null

    const json = decodeURIComponent(escape(atob(encoded)))
    const data = JSON.parse(json)
    if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
      // Max 100 cards via share link
      const cards = data.cards
        .filter((c: { front?: string; back?: string }) => c.front && c.back)
        .slice(0, 100)

      if (cards.length === 0) return null

      return {
        title: (data.title || 'Deck compartilhado').slice(0, 200),
        subject: (data.subject || 'Outro').slice(0, 100),
        description: (data.description || '').slice(0, 500),
        cards,
      }
    }
    return null
  } catch {
    return null
  }
}

// Generate shareable URL
export function getShareURL(deck: DeckData): string {
  const encoded = encodeDeckForShare(deck)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}?deck=${encoded}`
}

// Copy to clipboard
export async function copyShareLink(deck: DeckData): Promise<boolean> {
  try {
    const url = getShareURL(deck)
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
