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

    // Validações
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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">✏️ Novo Deck</h1>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕ Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info do deck */}
        <div className="bg-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-slate-400 mb-1">
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Direitos Fundamentais - Art. 5º"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm text-slate-400 mb-1">
              Matéria
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-slate-400 mb-1">
              Descrição (opcional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Incisos I ao X"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pares ({cards.length})</h2>
            <button
              type="button"
              onClick={addCard}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Adicionar par
            </button>
          </div>

          {cards.map((card, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Par {index + 1}</span>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={card.front}
                onChange={(e) => updateCard(index, 'front', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Frente (pergunta/conceito)"
              />
              <input
                type="text"
                value={card.back}
                onChange={(e) => updateCard(index, 'back', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Verso (resposta/definição)"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Botão salvar */}
        <button
          type="submit"
          className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-colors"
        >
          💾 Salvar Deck
        </button>
      </form>
    </div>
  )
}
