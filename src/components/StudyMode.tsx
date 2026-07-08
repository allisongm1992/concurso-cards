'use client'

import { useState, useCallback } from 'react'
import { DueCard, Rating, recordReview } from '@/lib/reviews'

interface StudyModeProps {
  cards: DueCard[]
  userId: string
  onComplete: (results: { correct: number; incorrect: number }) => void
  onBack: () => void
}

interface ReviewHistory {
  index: number
  rating: Rating
}

// Render cloze: replace {{text}} with blank or revealed text
function renderCloze(text: string, reveal: boolean): string {
  if (!text.includes('{{')) return text
  if (reveal) {
    return text.replace(/\{\{(.+?)\}\}/g, '[$1]')
  }
  return text.replace(/\{\{(.+?)\}\}/g, '[___]')
}

function hasCloze(text: string): boolean {
  return text.includes('{{')
}

export default function StudyMode({ cards, userId, onComplete, onBack }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [history, setHistory] = useState<ReviewHistory[]>([])
  const [suspended, setSuspended] = useState<Set<number>>(new Set())
  const [showUndo, setShowUndo] = useState(false)

  // Filter out suspended cards
  const activeCards = cards.filter((_, i) => !suspended.has(i))
  const activeIndex = suspended.size > 0
    ? activeCards.indexOf(cards[currentIndex])
    : currentIndex

  const currentCard = cards[currentIndex]
  const isClozeCard = currentCard ? hasCloze(currentCard.front) : false

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleUndo = useCallback(() => {
    if (history.length === 0) return

    const last = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))

    // Revert counts
    if (last.rating === 'good') {
      setCorrect(prev => prev - 1)
    } else {
      setIncorrect(prev => prev - 1)
    }

    // Go back to that card
    setCurrentIndex(last.index)
    setRevealed(false)
    setSlideDirection(null)
    setShowUndo(false)
  }, [history])

  const handleSuspend = useCallback(() => {
    // Suspend current card and move to next
    setSuspended(prev => new Set([...prev, currentIndex]))

    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      onComplete({ correct, incorrect })
    } else {
      setCurrentIndex(nextIndex)
      setRevealed(false)
    }
  }, [currentIndex, cards.length, correct, incorrect, onComplete])

  const handleRate = useCallback(async (rating: Rating) => {
    if (transitioning) return
    setTransitioning(true)

    // Haptic feedback on error
    if (rating === 'again' && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Record review only if user is logged in and card has a real ID
    if (userId && !currentCard.id.startsWith('local-')) {
      await recordReview(userId, currentCard.id, currentCard.deckId, rating)
    }

    const newCorrect = rating === 'good' ? correct + 1 : correct
    const newIncorrect = rating === 'again' ? incorrect + 1 : incorrect

    if (rating === 'good') {
      setCorrect(newCorrect)
    } else {
      setIncorrect(newIncorrect)
    }

    // Save to history for undo
    setHistory(prev => [...prev, { index: currentIndex, rating }])
    setShowUndo(true)

    // Slide animation
    setSlideDirection(rating === 'good' ? 'left' : 'right')

    setTimeout(() => {
      const nextIndex = currentIndex + 1

      if (nextIndex >= cards.length) {
        onComplete({ correct: newCorrect, incorrect: newIncorrect })
      } else {
        setCurrentIndex(nextIndex)
        setRevealed(false)
        setSlideDirection(null)
      }

      setTransitioning(false)
    }, 200)
  }, [currentIndex, cards, userId, currentCard, correct, incorrect, transitioning, onComplete])

  if (!currentCard) return null

  // Determine display text (cloze support)
  const frontDisplay = isClozeCard ? renderCloze(currentCard.front, revealed) : currentCard.front
  const backDisplay = isClozeCard && revealed
    ? currentCard.front.replace(/\{\{(.+?)\}\}/g, '$1')
    : currentCard.back

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
          {suspended.size > 0 && (
            <span className="text-neutral-700">{suspended.size} pulados</span>
          )}
        </div>
      </div>

      {/* Card */}
      <div
        className={`min-h-[320px] flex flex-col items-center justify-center text-center transition-all duration-200 ${
          slideDirection === 'left' ? 'opacity-0 -translate-x-4' :
          slideDirection === 'right' ? 'opacity-0 translate-x-4' :
          'opacity-100 translate-x-0'
        }`}
      >
        {currentCard.deckTitle && (
          <div className="text-[11px] text-neutral-700 uppercase tracking-wider mb-6">
            {currentCard.deckTitle}
          </div>
        )}
        <div className="text-xl font-medium text-neutral-100 leading-relaxed">
          {frontDisplay}
        </div>

        {revealed && !isClozeCard && (
          <div className="mt-10 pt-10 border-t border-neutral-900 w-full animate-fade-in">
            <div className="text-base text-emerald-300 leading-relaxed">
              {backDisplay}
            </div>
          </div>
        )}

        {revealed && isClozeCard && (
          <div className="mt-6 animate-fade-in">
            <div className="text-sm text-emerald-400">
              Resposta: {backDisplay}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-12">
        {!revealed ? (
          <div className="space-y-3">
            <button
              onClick={handleReveal}
              className="w-full py-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Revelar
            </button>
            {/* Suspend button */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSuspend}
                className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                Pular este card
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
            {/* Undo */}
            {showUndo && history.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handleUndo}
                  className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  Desfazer anterior
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
