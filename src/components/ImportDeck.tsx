'use client'

import { useState, useRef } from 'react'
import { parseDeckFile, ParseResult } from '@/lib/deck-io'
import { CardPair } from '@/data/sample-decks'

const SUBJECTS = [
  'Português', 'Direito Constitucional', 'Direito Administrativo',
  'Direito Penal', 'Direito Civil', 'Raciocínio Lógico',
  'Informática', 'Legislação Específica', 'Outro',
]

interface ImportDeckProps {
  onImport: (deck: { title: string; subject: string; description: string; cards: CardPair[] }) => void
  onCancel: () => void
}

export default function ImportDeck({ onImport, onCancel }: ImportDeckProps) {
  const [result, setResult] = useState<ParseResult | null>(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('Português')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = parseDeckFile(content, file.name)

      if (!parsed.success) {
        setError(parsed.error || 'Erro ao ler arquivo.')
        setResult(null)
        return
      }

      setResult(parsed)
      if (parsed.deck?.title) setTitle(parsed.deck.title)
      if (parsed.deck?.subject) setSubject(parsed.deck.subject)
      if (parsed.deck?.description) setDescription(parsed.deck.description)
    }
    reader.readAsText(file)
  }

  const handleConfirm = () => {
    if (!result?.deck || !title.trim()) return

    onImport({
      title: title.trim(),
      subject,
      description: description.trim(),
      cards: result.deck.cards,
    })
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div className="flex-1 text-center text-white font-medium">Importar Deck</div>
        <div className="w-16" />
      </div>

      {/* File picker */}
      {!result && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className="text-slate-400 text-sm mb-2">Toque para escolher arquivo</div>
            <div className="text-slate-600 text-xs">CSV ou JSON</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && (
            <div className="mt-4 text-red-400 text-xs bg-red-400/5 border border-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-6 text-slate-600 text-xs space-y-2">
            <p>Formatos aceitos:</p>
            <p className="text-slate-500">CSV: front;back (uma linha por card)</p>
            <p className="text-slate-500">JSON: {'{"cards": [{"front": "...", "back": "..."}]}'}</p>
          </div>
        </div>
      )}

      {/* Preview + metadata */}
      {result?.deck && (
        <div className="space-y-4">
          {/* Card count */}
          <div className="text-sm text-green-400 mb-4">
            ✓ {result.deck.cards.length} cards encontrados
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do deck"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Subject */}
          <div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Preview (primeiros 5 cards):</div>
            <div className="space-y-1">
              {result.deck.cards.slice(0, 5).map((card, i) => (
                <div key={i} className="text-xs bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="text-white">{card.front}</span>
                  <span className="text-slate-600 mx-2">→</span>
                  <span className="text-slate-400">{card.back.slice(0, 60)}{card.back.length > 60 ? '...' : ''}</span>
                </div>
              ))}
              {result.deck.cards.length > 5 && (
                <div className="text-xs text-slate-600 px-3">
                  ...e mais {result.deck.cards.length - 5} cards
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex-1 py-3 text-slate-500 hover:text-white text-sm transition-colors"
            >
              Trocar arquivo
            </button>
            <button
              onClick={handleConfirm}
              disabled={!title.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Importar {result.deck.cards.length} cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
