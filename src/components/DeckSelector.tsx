'use client'

import { DeckData } from '@/data/sample-decks'

interface DeckSelectorProps {
  decks: DeckData[]
  onSelect: (deck: DeckData) => void
  onCreateNew: () => void
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

export default function DeckSelector({ decks, onSelect, onCreateNew }: DeckSelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Decks</h1>
        <p className="text-sm text-slate-500 mt-1">Escolha um deck para o matching game</p>
      </div>

      <div className="space-y-2">
        {/* Criar novo deck */}
        <button
          onClick={onCreateNew}
          className="w-full px-4 py-4 rounded-xl border border-dashed border-slate-700 text-left transition-all hover:border-slate-500 hover:bg-slate-800/30 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm">+</div>
            <div>
              <div className="text-sm font-medium text-slate-300">Criar novo deck</div>
              <div className="text-xs text-slate-600">Adicione seus próprios pares</div>
            </div>
          </div>
        </button>

        {/* Lista de decks */}
        {decks.map((deck, index) => (
          <button
            key={index}
            onClick={() => onSelect(deck)}
            className="w-full px-4 py-4 rounded-xl bg-slate-800/50 text-left transition-all hover:bg-slate-800 active:scale-[0.99]"
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
        ))}
      </div>
    </div>
  )
}
