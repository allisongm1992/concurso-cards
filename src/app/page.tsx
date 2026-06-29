'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/AuthForm'
import DeckSelector from '@/components/DeckSelector'
import DeckEditor from '@/components/DeckEditor'
import GameBoard from '@/components/GameBoard'
import GameResult from '@/components/GameResult'
import GameHistory from '@/components/GameHistory'
import StreakSplash from '@/components/StreakSplash'
import StreakBadge from '@/components/StreakBadge'
import TodayView from '@/components/TodayView'
import StudyMode from '@/components/StudyMode'
import StudyProgress from '@/components/StudyProgress'
import { sampleDecks, DeckData, CardPair } from '@/data/sample-decks'
import { fetchDecks, createDeck, seedSampleDecks, saveGameSession, SyncedDeck } from '@/lib/sync'
import { StreakData, checkAndUpdateStreak, recordDailyPlay } from '@/lib/streaks'
import { fetchDueCards, getDueCount, DueCard } from '@/lib/reviews'

type GameState = 'login' | 'menu' | 'editor' | 'playing' | 'result' | 'history' | 'studying' | 'study-progress'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [gameState, setGameState] = useState<GameState>('login')
  const [selectedDeck, setSelectedDeck] = useState<DeckData | null>(null)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [lastScore, setLastScore] = useState(0)
  const [lastTime, setLastTime] = useState(0)
  const [decks, setDecks] = useState<(DeckData & { id?: string })[]>(sampleDecks)
  const [syncing, setSyncing] = useState(false)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [showSplash, setShowSplash] = useState(false)
  const [dueCount, setDueCount] = useState(0)
  const [studyCards, setStudyCards] = useState<DueCard[]>([])
  const [studyResults, setStudyResults] = useState({ correct: 0, incorrect: 0 })
  const [studyBatch, setStudyBatch] = useState(0)

  // Carregar decks, streak e due count quando loga
  useEffect(() => {
    if (user) {
      loadDecks()
      loadStreak()
      loadDueCount()
    }
  }, [user])

  const loadDecks = async () => {
    if (!user) return
    setSyncing(true)

    await seedSampleDecks(user.id, sampleDecks)

    const syncedDecks = await fetchDecks(user.id)

    if (syncedDecks.length > 0) {
      setDecks(
        syncedDecks.map((d: SyncedDeck) => ({
          title: d.title,
          subject: d.subject,
          description: d.description || '',
          cards: d.cards,
          id: d.id,
        }))
      )
    }

    setSyncing(false)
  }

  const loadStreak = async () => {
    if (!user) return
    const data = await checkAndUpdateStreak(user.id)
    setStreak(data)
    setShowSplash(true)
  }

  const loadDueCount = async () => {
    if (!user) return
    const count = await getDueCount(user.id)
    setDueCount(count)
  }

  // Se já está logado, vai direto pro menu
  useEffect(() => {
    if (!loading && user && gameState === 'login') {
      setGameState('menu')
    }
  }, [loading, user, gameState])

  const handleAuthSuccess = () => {
    setGameState('menu')
  }

  const handleDeckSelect = (deck: DeckData & { id?: string }) => {
    setSelectedDeck(deck)
    setSelectedDeckId(deck.id || null)
    setGameState('playing')
  }

  const handleCreateNew = () => {
    setGameState('editor')
  }

  const handleSaveDeck = async (deck: { title: string; subject: string; description: string; cards: CardPair[] }) => {
    if (user) {
      const newDeck = await createDeck(user.id, deck)
      if (newDeck) {
        await loadDecks()
      }
    } else {
      setDecks((prev) => [{ ...deck, id: undefined }, ...prev])
    }
    setGameState('menu')
  }

  const handleGameEnd = useCallback(
    async (score: number, time: number) => {
      setLastScore(score)
      setLastTime(time)
      setGameState('result')

      if (user && selectedDeckId) {
        await saveGameSession(
          user.id,
          selectedDeckId,
          score,
          selectedDeck?.cards.length || 0,
          time
        )
        // Update streak
        const updatedStreak = await recordDailyPlay(user.id)
        setStreak(updatedStreak)
      }
    },
    [user, selectedDeckId, selectedDeck]
  )

  const handleStartStudy = async (deckId?: string) => {
    if (!user) return
    const cards = await fetchDueCards(user.id, deckId)
    if (cards.length === 0) return
    setStudyCards(cards)
    setStudyBatch(0)
    setStudyResults({ correct: 0, incorrect: 0 })
    setGameState('studying')
  }

  const handleStudyComplete = async (results: { correct: number; incorrect: number }) => {
    setStudyResults(prev => ({
      correct: prev.correct + results.correct,
      incorrect: prev.incorrect + results.incorrect,
    }))
    setGameState('study-progress')

    // Update streak after study session
    if (user) {
      const updatedStreak = await recordDailyPlay(user.id)
      setStreak(updatedStreak)
    }
  }

  const handleStudyContinue = () => {
    setStudyBatch(prev => prev + 1)
    setGameState('studying')
  }

  const handlePlayAgain = () => {
    setGameState('playing')
  }

  const handleBackToMenu = () => {
    setSelectedDeck(null)
    setSelectedDeckId(null)
    setGameState('menu')
    if (user) loadDueCount()
  }

  const handleSignOut = async () => {
    await signOut()
    setDecks(sampleDecks)
    setStreak(null)
    setShowSplash(false)
    setDueCount(0)
    setGameState('login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-lg">Carregando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      {gameState !== 'login' && (
        <header className="flex justify-between items-center px-4 py-3 bg-slate-800/50">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {streak && <StreakBadge streak={streak} />}
            {user ? (
              <span>
                {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizado'}
              </span>
            ) : (
              <span>⚠️ Modo offline</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && gameState === 'menu' && (
              <button
                onClick={() => setGameState('history')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                📊 Histórico
              </button>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </header>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center">
        {gameState === 'login' && (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        )}

        {gameState === 'menu' && (
          <div className="w-full max-w-2xl mx-auto px-4">
            <TodayView dueCount={dueCount} onStudy={() => handleStartStudy()} />
            <DeckSelector
              decks={decks}
              onSelect={handleDeckSelect}
              onCreateNew={handleCreateNew}
            />
          </div>
        )}

        {gameState === 'editor' && (
          <DeckEditor
            onSave={handleSaveDeck}
            onCancel={handleBackToMenu}
          />
        )}

        {gameState === 'history' && user && (
          <GameHistory
            userId={user.id}
            onBack={handleBackToMenu}
          />
        )}

        {gameState === 'playing' && selectedDeck && (
          <GameBoard
            cards={selectedDeck.cards}
            onGameEnd={handleGameEnd}
            onBack={handleBackToMenu}
          />
        )}

        {gameState === 'result' && selectedDeck && (
          <GameResult
            score={lastScore}
            time={lastTime}
            totalPairs={selectedDeck.cards.length}
            onPlayAgain={handlePlayAgain}
            onBack={handleBackToMenu}
          />
        )}

        {gameState === 'studying' && user && studyCards.length > 0 && (
          <StudyMode
            cards={studyCards.slice(studyBatch * 20, (studyBatch + 1) * 20)}
            userId={user.id}
            onComplete={handleStudyComplete}
            onBack={handleBackToMenu}
          />
        )}

        {gameState === 'study-progress' && (
          <StudyProgress
            correct={studyResults.correct}
            incorrect={studyResults.incorrect}
            totalDue={studyCards.length}
            reviewed={Math.min((studyBatch + 1) * 20, studyCards.length)}
            onContinue={handleStudyContinue}
            onBack={handleBackToMenu}
          />
        )}
      </div>

      {/* Streak Splash */}
      {showSplash && streak && gameState === 'menu' && (
        <StreakSplash
          streak={streak}
          onDismiss={() => setShowSplash(false)}
        />
      )}
    </main>
  )
}
