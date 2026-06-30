'use client'

import { DeckData } from '@/data/sample-decks'
import { exportDeckCSV } from '@/lib/deck-io'
import { copyShareLink } from '@/lib/share'

interface DeckSelectorProps {
  decks: (DeckData & { id?: string })[]
  onSelect: (deck: DeckData & { id?: string }) => void
  onStudy: (deck: DeckData & { id?: string }) => void
  onReverse: (deck: DeckData & { id?: string }) => void
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

export default function DeckSelector({ decks, onSelect, onStudy, onReverse, onCreateNew, onImport }: DeckSelectorProps) {
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
            className="border-b border-neutral-900 py-4 group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${subjectDots[deck.subject] || 'bg-neutral-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-100 truncate">{deck.title}</div>
                <div className="text-xs text-neutral-600 truncate">{deck.subject} · {deck.cards.length} cards</div>
              </div>
            </div>
            {/* Actions row */}
            <div className="flex items-center gap-3 mt-2 ml-4">
              <button
                onClick={() => onStudy(deck)}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Estudar
              </button>
              <button
                onClick={() => onReverse(deck)}
                className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                Reverso
              </button>
              <button
                onClick={async () => {
                  const ok = await copyShareLink(deck)
                  if (ok) alert('Link copiado!')
                }}
                className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                Compartilhar
              </button>
              <button
                onClick={(e) => handleExport(e, deck)}
                className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              >
                Exportar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
