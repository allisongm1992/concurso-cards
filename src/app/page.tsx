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
import ImportDeck from '@/components/ImportDeck'
import XpBadge from '@/components/XpBadge'
import ProfileScreen from '@/components/ProfileScreen'
import MedalUnlock from '@/components/MedalUnlock'
import { sampleDecks, DeckData, CardPair } from '@/data/sample-decks'
import { fetchDecks, createDeck, seedSampleDecks, saveGameSession, SyncedDeck } from '@/lib/sync'
import { StreakData, checkAndUpdateStreak, recordDailyPlay } from '@/lib/streaks'
import { fetchDueCards, getDueCount, DueCard } from '@/lib/reviews'
import { calculateLevel, LevelInfo, getXpForMatchingGame, getXpForStreak } from '@/lib/xp'
import { MedalCheck, UnlockedMedal } from '@/lib/medals'
import { getProgress, recordStudySession, recordMatchingGame, recordDeckCreated, getUserMedals, UserProgress } from '@/lib/progress'

type GameState = 'login' | 'menu' | 'editor' | 'playing' | 'result' | 'history' | 'studying' | 'study-progress' | 'profile' | 'importing'

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
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [medals, setMedals] = useState<UnlockedMedal[]>([])
  const [medalToast, setMedalToast] = useState<MedalCheck | null>(null)

  // Load everything on login
  useEffect(() => {
    if (user) {
      loadDecks()
      loadStreak()
      loadDueCount()
      loadProgress()
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

  const loadProgress = async () => {
    if (!user) return
    const prog = await getProgress(user.id)
    setProgress(prog)
    setLevelInfo(calculateLevel(prog.totalXp))
    const userMedals = await getUserMedals(user.id)
    setMedals(userMedals)
  }

  const showMedalToast = (newMedals: MedalCheck[]) => {
    if (newMedals.length > 0) {
      setMedalToast(newMedals[0])
    }
  }

  // Auto-navigate to menu if logged in
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
        const { progress: prog, newMedals } = await recordDeckCreated(user.id)
        setProgress(prog)
        setLevelInfo(calculateLevel(prog.totalXp))
        showMedalToast(newMedals)
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

        // XP for matching game
        const matches = selectedDeck?.cards.length || 0
        const attempts = matches > 0 ? Math.round(matches / (score / 1000 + 1)) : matches
        const xp = getXpForMatchingGame(matches, attempts)
        const { progress: prog, newMedals } = await recordMatchingGame(user.id, xp, time)
        setProgress(prog)
        setLevelInfo(calculateLevel(prog.totalXp))
        showMedalToast(newMedals)

        // XP for streak
        if (!updatedStreak.playedToday) {
          // Already handled in recordDailyPlay logic
        }
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

  const handleStudyDeck = (deck: DeckData & { id?: string }) => {
    // Direct flashcard study — use all cards from the deck, no spaced repetition filter
    const dueCards: DueCard[] = deck.cards.map((card, i) => ({
      id: deck.id ? `${deck.id}-${i}` : `local-${i}`,
      front: card.front,
      back: card.back,
      deckId: deck.id || 'local',
      deckTitle: deck.title,
      stability: 1.0,
      difficulty: 0.5,
    }))
    setStudyCards(dueCards)
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

    if (user) {
      // Update streak
      const updatedStreak = await recordDailyPlay(user.id)
      setStreak(updatedStreak)

      // XP for study session
      const xpEarned = results.correct * 15 + results.incorrect * 5
      const { progress: prog, newMedals } = await recordStudySession(
        user.id,
        results.correct + results.incorrect,
        results.correct,
        xpEarned
      )
      setProgress(prog)
      setLevelInfo(calculateLevel(prog.totalXp))
      showMedalToast(newMedals)
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
    if (user) {
      loadDueCount()
      loadProgress()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setDecks(sampleDecks)
    setStreak(null)
    setShowSplash(false)
    setDueCount(0)
    setProgress(null)
    setLevelInfo(null)
    setMedals([])
    setGameState('login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600 text-sm">Carregando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      {gameState !== 'login' && (
        <header className="flex justify-between items-center px-5 py-4">
          <div className="flex items-center gap-4">
            {streak && <StreakBadge streak={streak} />}
            {levelInfo && (
              <XpBadge levelInfo={levelInfo} onClick={() => setGameState('profile')} />
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && gameState === 'menu' && (
              <button
                onClick={() => setGameState('history')}
                className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                Histórico
              </button>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="text-xs text-neutral-800 hover:text-neutral-500 transition-colors cursor-pointer"
              >
                Sair
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main content */}
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
              onStudy={handleStudyDeck}
              onCreateNew={handleCreateNew}
              onImport={() => setGameState('importing')}
            />
          </div>
        )}

        {gameState === 'editor' && (
          <DeckEditor
            onSave={handleSaveDeck}
            onCancel={handleBackToMenu}
          />
        )}

        {gameState === 'importing' && (
          <ImportDeck
            onImport={handleSaveDeck}
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

        {gameState === 'profile' && levelInfo && progress && (
          <ProfileScreen
            levelInfo={levelInfo}
            progress={progress}
            medals={medals}
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

      {/* Medal Toast */}
      {medalToast && (
        <MedalUnlock
          medalId={medalToast.medalId}
          tier={medalToast.tier}
          onDismiss={() => setMedalToast(null)}
        />
      )}
    </main>
  )
}
