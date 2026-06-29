'use client'

import { useState, useCallback } from 'react'
import { DueCard, Rating, recordReview } from '@/lib/reviews'

interface StudyModeProps {
  cards: DueCard[]
  userId: string
  onComplete: (results: { correct: number; incorrect: number }) => void
  onBack: () => void
}

export default function StudyMode({ cards, userId, onComplete, onBack }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const currentCard = cards[currentIndex]

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleRate = useCallback(async (rating: Rating) => {
    if (transitioning) return
    setTransitioning(true)

    await recordReview(userId, currentCard.id, currentCard.deckId, rating)

    const newCorrect = rating === 'good' ? correct + 1 : correct
    const newIncorrect = rating === 'again' ? incorrect + 1 : incorrect

    if (rating === 'good') {
      setCorrect(newCorrect)
    } else {
      setIncorrect(newIncorrect)
    }

    const nextIndex = currentIndex + 1

    if (nextIndex >= cards.length) {
      onComplete({ correct: newCorrect, incorrect: newIncorrect })
    } else {
      setCurrentIndex(nextIndex)
      setRevealed(false)
    }

    setTransitioning(false)
  }, [currentIndex, cards, userId, currentCard, correct, incorrect, transitioning, onComplete])

  if (!currentCard) return null

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <span className="tabular-nums">{currentIndex + 1}/{cards.length}</span>
          <span className="text-emerald-500">{correct}✓</span>
          <span className="text-red-400">{incorrect}✗</span>
        </div>
      </div>

      {/* Card */}
      <div className="min-h-[320px] flex flex-col items-center justify-center text-center">
        {currentCard.deckTitle && (
          <div className="text-[11px] text-neutral-700 uppercase tracking-wider mb-6">
            {currentCard.deckTitle}
          </div>
        )}
        <div className="text-xl font-medium text-neutral-100 leading-relaxed">
          {currentCard.front}
        </div>

        {revealed && (
          <div className="mt-10 pt-10 border-t border-neutral-900 w-full animate-fade-in">
            <div className="text-base text-emerald-300 leading-relaxed">
              {currentCard.back}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-12">
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Revelar
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleRate('again')}
              disabled={transitioning}
              className="flex-1 py-4 bg-neutral-900 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-300 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Não sabia
            </button>
            <button
              onClick={() => handleRate('good')}
              disabled={transitioning}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Sabia
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
