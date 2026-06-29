import { CardPair, DeckData } from '@/data/sample-decks'

export interface ParseResult {
  success: boolean
  deck?: DeckData
  error?: string
}

// Parse CSV format
export function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '')

  if (lines.length < 2) {
    return { success: false, error: 'Arquivo vazio ou com poucas linhas.' }
  }

  let title = ''
  let subject = ''
  let description = ''
  const cards: CardPair[] = []

  for (const line of lines) {
    // Metadata lines start with #
    if (line.startsWith('#')) {
      const meta = line.slice(1).trim()
      if (meta.toLowerCase().startsWith('title:')) {
        title = meta.slice(6).trim()
      } else if (meta.toLowerCase().startsWith('subject:')) {
        subject = meta.slice(8).trim()
      } else if (meta.toLowerCase().startsWith('description:')) {
        description = meta.slice(12).trim()
      }
      continue
    }

    // Skip header line
    if (line.toLowerCase() === 'front;back' || line.toLowerCase() === 'front,back') {
      continue
    }

    // Try semicolon first, then comma
    let separator = ';'
    if (!line.includes(';') && line.includes(',')) {
      separator = ','
    }

    const separatorIndex = line.indexOf(separator)
    if (separatorIndex === -1) continue

    const front = line.slice(0, separatorIndex).trim()
    const back = line.slice(separatorIndex + 1).trim()

    if (front && back) {
      cards.push({ front, back })
    }
  }

  if (cards.length === 0) {
    return { success: false, error: 'Nenhum card encontrado. Use formato: front;back' }
  }

  return {
    success: true,
    deck: { title, subject, description, cards },
  }
}

// Parse JSON format
export function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content)

    // Handle array of cards (simple format)
    if (Array.isArray(data)) {
      const cards = data.filter(c => c.front && c.back) as CardPair[]
      if (cards.length === 0) {
        return { success: false, error: 'Nenhum card válido no JSON.' }
      }
      return {
        success: true,
        deck: { title: '', subject: '', description: '', cards },
      }
    }

    // Handle full deck format
    if (data.cards && Array.isArray(data.cards)) {
      const cards = data.cards.filter((c: CardPair) => c.front && c.back) as CardPair[]
      if (cards.length === 0) {
        return { success: false, error: 'Nenhum card válido no JSON.' }
      }
      return {
        success: true,
        deck: {
          title: data.title || '',
          subject: data.subject || '',
          description: data.description || '',
          cards,
        },
      }
    }

    return { success: false, error: 'Formato JSON não reconhecido. Esperado: { cards: [...] }' }
  } catch {
    return { success: false, error: 'JSON inválido.' }
  }
}

// Auto-detect format and parse
export function parseDeckFile(content: string, filename: string): ParseResult {
  if (filename.endsWith('.json')) {
    return parseJSON(content)
  }
  // Try CSV first, fallback to JSON
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    return parseJSON(content)
  }
  return parseCSV(content)
}

// Generate CSV from deck
export function generateCSV(deck: DeckData): string {
  const lines: string[] = []

  if (deck.title) lines.push(`# title: ${deck.title}`)
  if (deck.subject) lines.push(`# subject: ${deck.subject}`)
  if (deck.description) lines.push(`# description: ${deck.description}`)
  lines.push('front;back')

  for (const card of deck.cards) {
    // Escape semicolons in content by replacing with comma
    const front = card.front.replace(/;/g, ',')
    const back = card.back.replace(/;/g, ',')
    lines.push(`${front};${back}`)
  }

  return lines.join('\n')
}

// Generate JSON from deck
export function generateJSON(deck: DeckData): string {
  return JSON.stringify({
    title: deck.title,
    subject: deck.subject,
    description: deck.description,
    cards: deck.cards,
  }, null, 2)
}

// Trigger file download in browser
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Export deck as CSV
export function exportDeckCSV(deck: DeckData) {
  const csv = generateCSV(deck)
  const filename = `${deck.title || 'deck'}.csv`
  downloadFile(csv, filename, 'text/csv;charset=utf-8')
}

// Export deck as JSON
export function exportDeckJSON(deck: DeckData) {
  const json = generateJSON(deck)
  const filename = `${deck.title || 'deck'}.json`
  downloadFile(json, filename, 'application/json')
}
