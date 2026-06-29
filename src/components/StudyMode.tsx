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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div className="text-sm text-slate-400">
          {currentIndex + 1}/{cards.length}
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-green-400">✅ {correct}</span>
          <span className="text-red-400">❌ {incorrect}</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="text-xl font-semibold text-white mb-6">
          {currentCard.front}
        </div>

        {revealed && (
          <div className="text-lg text-blue-300 border-t border-slate-700 pt-6 mt-2 w-full animate-fade-in">
            {currentCard.back}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6">
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-lg transition-colors"
          >
            Revelar Resposta
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => handleRate('again')}
              className="flex-1 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-xl font-medium text-lg transition-colors"
            >
              Não sabia ❌
            </button>
            <button
              onClick={() => handleRate('good')}
              className="flex-1 py-4 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl font-medium text-lg transition-colors"
            >
              Sabia ✅
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
