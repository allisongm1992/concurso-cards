'use client'

import { DeckData } from '@/data/sample-decks'
import { exportDeckCSV } from '@/lib/deck-io'

interface DeckSelectorProps {
  decks: (DeckData & { id?: string })[]
  onSelect: (deck: DeckData & { id?: string }) => void
  onCreateNew: () => void
  onImport: () => void
}

const subjectDots: Record<string, string> = {
  'Direito Constitucional': 'bg-blue-500',
  'Direito Administrativo': 'bg-purple-500',
  'Português': 'bg-emerald-500',
  'Raciocínio Lógico': 'bg-amber-500',
  'Informática': 'bg-cyan-500',
  'Direito Penal': 'bg-red-500',
  'Direito Civil': 'bg-orange-500',
  'Legislação Específica': 'bg-indigo-500',
}

export default function DeckSelector({ decks, onSelect, onCreateNew, onImport }: DeckSelectorProps) {
  const handleExport = (e: React.MouseEvent, deck: DeckData) => {
    e.stopPropagation()
    exportDeckCSV(deck)
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Decks</h1>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          + Criar
        </button>
        <button
          onClick={onImport}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          ↑ Importar
        </button>
      </div>

      {/* Deck list */}
      <div className="border-t border-neutral-900">
        {decks.map((deck, index) => (
          <div
            key={index}
            className="flex items-center border-b border-neutral-900 group"
          >
            <button
              onClick={() => onSelect(deck)}
              className="flex-1 flex items-center gap-3 py-4 text-left hover:pl-1 transition-all cursor-pointer"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${subjectDots[deck.subject] || 'bg-neutral-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-100 truncate">{deck.title}</div>
                <div className="text-xs text-neutral-600 truncate">{deck.subject}</div>
              </div>
              <div className="text-xs text-neutral-700 tabular-nums">
                {deck.cards.length}
              </div>
            </button>
            <button
              onClick={(e) => handleExport(e, deck)}
              className="p-3 text-neutral-800 hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Exportar CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
