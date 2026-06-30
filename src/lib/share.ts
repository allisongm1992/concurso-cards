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
    const json = decodeURIComponent(escape(atob(encoded)))
    const data = JSON.parse(json)
    if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
      return {
        title: data.title || 'Deck compartilhado',
        subject: data.subject || 'Outro',
        description: data.description || '',
        cards: data.cards.filter((c: { front?: string; back?: string }) => c.front && c.back),
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
