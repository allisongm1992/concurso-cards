'use client'

import { useState, useEffect, useCallback } from 'react'
import { DueCard, Rating } from '@/lib/reviews'

interface ExamModeProps {
  cards: DueCard[]
  timeLimit: number // seconds
  onComplete: (results: { correct: number; incorrect: number; timeUsed: number }) => void
  onBack: () => void
}

export default function ExamMode({ cards, timeLimit, onComplete, onBack }: ExamModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [finished, setFinished] = useState(false)

  const currentCard = cards[currentIndex]

  // Timer
  useEffect(() => {
    if (finished) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [finished])

  // When time runs out or all cards done
  useEffect(() => {
    if (finished) {
      // Use refs to avoid stale closure
      onComplete({ correct, incorrect, timeUsed: timeLimit - timeLeft })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const handleReveal = () => setRevealed(true)

  const handleRate = useCallback((rating: Rating) => {
    if (rating === 'good') {
      setCorrect(prev => prev + 1)
    } else {
      setIncorrect(prev => prev + 1)
    }

    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      setFinished(true)
    } else {
      setCurrentIndex(nextIndex)
      setRevealed(false)
    }
  }, [currentIndex, cards.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (finished) return
      if (e.key === ' ' && !revealed) {
        e.preventDefault()
        handleReveal()
      } else if (e.key === 'ArrowRight' && revealed) {
        handleRate('good')
      } else if (e.key === 'ArrowLeft' && revealed) {
        handleRate('again')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [revealed, finished, handleRate])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (finished || !currentCard) return null

  const timePercent = (timeLeft / timeLimit) * 100
  const isLowTime = timeLeft <= 30

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          ← Sair
        </button>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-600 tabular-nums">{currentIndex + 1}/{cards.length}</span>
          <span className={`tabular-nums font-medium ${isLowTime ? 'text-red-400' : 'text-neutral-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-0.5 bg-neutral-900 rounded-full mb-12 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isLowTime ? 'bg-red-500' : 'bg-emerald-600'}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Card */}
      <div className="min-h-[280px] flex flex-col items-center justify-center text-center">
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
      <div className="mt-10">
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
              className="flex-1 py-4 bg-neutral-900 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Errei
            </button>
            <button
              onClick={() => handleRate('good')}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Acertei
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
