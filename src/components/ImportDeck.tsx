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
    // File size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande (máx 5MB).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = parseDeckFile(content, file.name)

      if (!parsed.success) {
        setError(parsed.error || 'Erro ao ler arquivo.')
        setResult(null)
        return
      }

      // Max 500 cards per import
      if (parsed.deck && parsed.deck.cards.length > 500) {
        setError(`Limite de 500 cards por import (arquivo tem ${parsed.deck.cards.length}).`)
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
    <div className="w-full max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-10">
        <button
          onClick={onCancel}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          ← Voltar
        </button>
        <div className="flex-1 text-center text-sm font-medium text-neutral-300">Importar</div>
        <div className="w-16" />
      </div>

      {/* File picker */}
      {!result && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-neutral-800 rounded-lg p-10 text-center cursor-pointer hover:border-neutral-600 transition-colors"
          >
            <div className="text-neutral-400 text-sm">Toque para escolher arquivo</div>
            <div className="text-neutral-700 text-xs mt-1">CSV ou JSON</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && (
            <div className="mt-4 text-red-400 text-xs p-3 border border-red-900/30 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8 text-neutral-700 text-xs space-y-1">
            <p>CSV: front;back (uma linha por card)</p>
            <p>JSON: {'{"cards": [{"front": "...", "back": "..."}]}'}</p>
          </div>
        </div>
      )}

      {/* Preview + metadata */}
      {result?.deck && (
        <div className="space-y-4">
          <div className="text-sm text-emerald-500 mb-6">
            ✓ {result.deck.cards.length} cards encontrados
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do deck"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />

          {/* Preview */}
          <div className="mt-6">
            <div className="text-[11px] text-neutral-700 uppercase tracking-wider mb-3">Preview</div>
            <div className="space-y-1">
              {result.deck.cards.slice(0, 5).map((card, i) => (
                <div key={i} className="text-xs py-2 border-b border-neutral-900">
                  <span className="text-neutral-300">{card.front}</span>
                  <span className="text-neutral-800 mx-2">→</span>
                  <span className="text-neutral-600">{card.back.slice(0, 50)}{card.back.length > 50 ? '...' : ''}</span>
                </div>
              ))}
              {result.deck.cards.length > 5 && (
                <div className="text-[11px] text-neutral-700 pt-1">
                  +{result.deck.cards.length - 5} mais
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex-1 py-3 text-neutral-600 hover:text-neutral-300 text-sm transition-colors cursor-pointer"
            >
              Trocar arquivo
            </button>
            <button
              onClick={handleConfirm}
              disabled={!title.trim()}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Importar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
