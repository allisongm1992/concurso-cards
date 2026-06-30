'use client'

import { useState } from 'react'
import { CardPair } from '@/data/sample-decks'

interface DeckEditorProps {
  onSave: (deck: { title: string; subject: string; description: string; cards: CardPair[] }) => void
  onCancel: () => void
}

const SUBJECTS = [
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Penal',
  'Português',
  'Raciocínio Lógico',
  'Informática',
  'Direito Civil',
  'Legislação Específica',
  'Outro',
]

export default function DeckEditor({ onSave, onCancel }: DeckEditorProps) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<CardPair[]>([{ front: '', back: '' }])
  const [error, setError] = useState<string | null>(null)

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }])
  }

  const removeCard = (index: number) => {
    if (cards.length <= 1) return
    setCards(cards.filter((_, i) => i !== index))
  }

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    setCards(
      cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Dê um título ao deck')
      return
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim())
    if (validCards.length < 3) {
      setError('Adicione pelo menos 3 pares completos')
      return
    }

    onSave({
      title: title.trim(),
      subject,
      description: description.trim(),
      cards: validCards,
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Novo Deck</h1>
        <button
          onClick={onCancel}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info */}
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            maxLength={200}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
            placeholder="Título do deck"
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
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            maxLength={500}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
            placeholder="Descrição (opcional)"
          />
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Pares ({cards.length})</span>
            <button
              type="button"
              onClick={addCard}
              className="text-xs px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              + Adicionar
            </button>
          </div>

          {cards.map((card, index) => (
            <div key={index} className="border-b border-neutral-900 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-700">{index + 1}</span>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-[11px] text-neutral-700 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    remover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={card.front}
                onChange={(e) => updateCard(index, 'front', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
                placeholder="Frente"
                maxLength={2000}
              />
              <input
                type="text"
                value={card.back}
                onChange={(e) => updateCard(index, 'back', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
                placeholder="Verso"
                maxLength={2000}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-400 text-xs p-3 border border-red-900/30 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-sm text-white transition-colors cursor-pointer"
        >
          Salvar Deck
        </button>
      </form>
    </div>
  )
}
