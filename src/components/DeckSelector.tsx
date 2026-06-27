'use client'

import { DeckData } from '@/data/sample-decks'

interface DeckSelectorProps {
  decks: DeckData[]
  onSelect: (deck: DeckData) => void
  onCreateNew: () => void
}

export default function DeckSelector({ decks, onSelect, onCreateNew }: DeckSelectorProps) {
  const subjectColors: Record<string, string> = {
    'Direito Constitucional': 'from-blue-600 to-blue-800',
    'Direito Administrativo': 'from-purple-600 to-purple-800',
    'Português': 'from-emerald-600 to-emerald-800',
    'Raciocínio Lógico': 'from-amber-600 to-amber-800',
    'Informática': 'from-cyan-600 to-cyan-800',
    'Direito Penal': 'from-red-600 to-red-800',
    'Direito Civil': 'from-orange-600 to-orange-800',
    'Legislação Específica': 'from-indigo-600 to-indigo-800',
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">📚 Concurso Cards</h1>
        <p className="text-slate-400">Escolha um deck para jogar</p>
      </div>

      <div className="space-y-4">
        {/* Botão criar novo deck */}
        <button
          onClick={onCreateNew}
          className="w-full p-5 rounded-xl border-2 border-dashed border-slate-600 text-left transition-all hover:border-blue-500 hover:bg-slate-800/50 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">➕</span>
            <div>
              <h2 className="text-lg font-bold text-slate-300">Criar novo deck</h2>
              <p className="text-sm text-slate-500">Adicione seus próprios pares de estudo</p>
            </div>
          </div>
        </button>

        {/* Lista de decks */}
        {decks.map((deck, index) => (
          <button
            key={index}
            onClick={() => onSelect(deck)}
            className={`w-full p-5 rounded-xl bg-gradient-to-r ${
              subjectColors[deck.subject] || 'from-slate-600 to-slate-800'
            } text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">{deck.title}</h2>
                <p className="text-sm text-white/70 mt-1">{deck.subject}</p>
                <p className="text-xs text-white/50 mt-1">{deck.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white/90">{deck.cards.length}</div>
                <div className="text-xs text-white/50">pares</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
