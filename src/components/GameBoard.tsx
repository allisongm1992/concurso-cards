'use client'

import { useState, useEffect, useCallback } from 'react'
import { CardPair } from '@/data/sample-decks'

interface GameCard {
  id: number
  text: string
  pairId: number
  type: 'front' | 'back'
  isFlipped: boolean
  isMatched: boolean
}

interface GameBoardProps {
  cards: CardPair[]
  onGameEnd: (score: number, time: number) => void
  onBack: () => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function GameBoard({ cards, onGameEnd, onBack }: GameBoardProps) {
  const [gameCards, setGameCards] = useState<GameCard[]>([])
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [wrongPair, setWrongPair] = useState<number[]>([])

  // Inicializar tabuleiro
  useEffect(() => {
    const gameCardsList: GameCard[] = []
    cards.forEach((card, index) => {
      gameCardsList.push({
        id: index * 2,
        text: card.front,
        pairId: index,
        type: 'front',
        isFlipped: false,
        isMatched: false,
      })
      gameCardsList.push({
        id: index * 2 + 1,
        text: card.back,
        pairId: index,
        type: 'back',
        isFlipped: false,
        isMatched: false,
      })
    })
    setGameCards(shuffleArray(gameCardsList))
    setIsRunning(true)
  }, [cards])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Checar match
  useEffect(() => {
    if (selectedCards.length === 2) {
      const [first, second] = selectedCards
      const firstCard = gameCards.find((c) => c.id === first)
      const secondCard = gameCards.find((c) => c.id === second)

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          setGameCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            )
          )
          setMatches((prev) => prev + 1)
          setSelectedCards([])
        }, 500)
      } else {
        // Errou
        setWrongPair(selectedCards)
        setTimeout(() => {
          setGameCards((prev) =>
            prev.map((c) =>
              selectedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          )
          setSelectedCards([])
          setWrongPair([])
        }, 1000)
      }
      setAttempts((prev) => prev + 1)
    }
  }, [selectedCards, gameCards])

  // Fim do jogo
  useEffect(() => {
    if (matches === cards.length && matches > 0) {
      setIsRunning(false)
      const score = Math.max(0, Math.round((matches / attempts) * 1000 - timer))
      onGameEnd(score, timer)
    }
  }, [matches, cards.length, attempts, timer, onGameEnd])

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (selectedCards.length >= 2) return

      const card = gameCards.find((c) => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched) return

      setGameCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      )
      setSelectedCards((prev) => [...prev, cardId])
    },
    [selectedCards, gameCards]
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header com stats */}
      <div className="flex justify-between items-center mb-6 bg-slate-800 rounded-xl p-4">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Voltar"
        >
          ← Voltar
        </button>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{formatTime(timer)}</div>
          <div className="text-xs text-slate-400">Tempo</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{matches}/{cards.length}</div>
          <div className="text-xs text-slate-400">Pares</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{attempts}</div>
          <div className="text-xs text-slate-400">Tentativas</div>
        </div>
      </div>

      {/* Grid de cartas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gameCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            className={`card-flip aspect-[3/4] ${
              card.isMatched ? 'card-matched' : ''
            } ${wrongPair.includes(card.id) ? 'card-wrong' : ''}`}
            aria-label={card.isFlipped ? card.text : 'Carta virada'}
          >
            <div className={`card-inner ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}>
              <div className="card-front">
                <span className="text-3xl">?</span>
              </div>
              <div className="card-back">
                <span className="text-xs sm:text-sm leading-tight">{card.text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
