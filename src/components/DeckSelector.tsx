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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Decks</h1>
        <p className="text-sm text-slate-500 mt-1">Escolha um deck para o matching game</p>
      </div>

      <div className="space-y-2">
        {/* Criar novo + Importar */}
        <div className="flex gap-2">
          <button
            onClick={onCreateNew}
            className="flex-1 px-4 py-4 rounded-xl border border-dashed border-slate-700 text-left transition-all hover:border-slate-500 hover:bg-slate-800/30 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm">+</div>
              <div>
                <div className="text-sm font-medium text-slate-300">Criar</div>
                <div className="text-xs text-slate-600">Novo deck</div>
              </div>
            </div>
          </button>
          <button
            onClick={onImport}
            className="flex-1 px-4 py-4 rounded-xl border border-dashed border-slate-700 text-left transition-all hover:border-slate-500 hover:bg-slate-800/30 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm">↑</div>
              <div>
                <div className="text-sm font-medium text-slate-300">Importar</div>
                <div className="text-xs text-slate-600">CSV ou JSON</div>
              </div>
            </div>
          </button>
        </div>

        {/* Lista de decks */}
        {decks.map((deck, index) => (
          <div key={index} className="flex items-center gap-1">
            <button
              onClick={() => onSelect(deck)}
              className="flex-1 px-4 py-4 rounded-xl bg-slate-800/50 text-left transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${subjectDots[deck.subject] || 'bg-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{deck.title}</div>
                  <div className="text-xs text-slate-500 truncate">{deck.subject}</div>
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  {deck.cards.length} pares
                </div>
              </div>
            </button>
            <button
              onClick={(e) => handleExport(e, deck)}
              className="p-3 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer"
              title="Exportar como CSV"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
