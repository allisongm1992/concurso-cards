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
    <div className="w-full max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="tabular-nums">{currentIndex + 1}/{cards.length}</span>
          <span className="text-green-400">{correct}✓</span>
          <span className="text-red-400">{incorrect}✗</span>
        </div>
      </div>

      {/* Card */}
      <div className="min-h-[280px] flex flex-col items-center justify-center text-center px-6">
        {currentCard.deckTitle && (
          <div className="text-[11px] text-slate-600 mb-4">
            {currentCard.deckTitle}
          </div>
        )}
        <div className="text-lg font-medium text-white leading-relaxed">
          {currentCard.front}
        </div>

        {revealed && (
          <div className="mt-8 pt-8 border-t border-slate-800 w-full animate-fade-in">
            <div className="text-base text-blue-300 leading-relaxed">
              {currentCard.back}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8">
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Revelar
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleRate('again')}
              disabled={transitioning}
              className="flex-1 py-4 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Não sabia
            </button>
            <button
              onClick={() => handleRate('good')}
              disabled={transitioning}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Sabia
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
