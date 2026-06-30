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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (selectedCards.length === 2) {
      const [first, second] = selectedCards
      const firstCard = gameCards.find((c) => c.id === first)
      const secondCard = gameCards.find((c) => c.id === second)

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-1">
        <button
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
          aria-label="Voltar"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-6 text-xs text-neutral-500 tabular-nums">
          <span>{formatTime(timer)}</span>
          <span className="text-emerald-500">{matches}/{cards.length}</span>
          <span>{attempts} tent.</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {gameCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            className={`card-flip aspect-[3/4] cursor-pointer ${
              card.isMatched ? 'card-matched' : ''
            } ${wrongPair.includes(card.id) ? 'card-wrong' : ''}`}
            aria-label={card.isFlipped ? card.text : 'Carta virada'}
          >
            <div className={`card-inner ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}>
              <div className="card-front">
                <span className="text-2xl">?</span>
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
