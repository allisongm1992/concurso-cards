'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/AuthForm'
import DeckSelector from '@/components/DeckSelector'
import DeckEditor from '@/components/DeckEditor'
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
import { fetchDecks, createDeck, seedSampleDecks, SyncedDeck } from '@/lib/sync'
import { StreakData, checkAndUpdateStreak, recordDailyPlay } from '@/lib/streaks'
import { fetchDueCards, getDueCount, DueCard } from '@/lib/reviews'
import { calculateLevel, LevelInfo } from '@/lib/xp'
import { MedalCheck, UnlockedMedal } from '@/lib/medals'
import { getProgress, recordStudySession, recordDeckCreated, getUserMedals, UserProgress } from '@/lib/progress'
import { getDailyGoal, setDailyGoalTarget, incrementDailyProgress, DailyGoal } from '@/lib/daily-goal'
import { decodeDeckFromShare } from '@/lib/share'
import DailyGoalBar from '@/components/DailyGoalBar'

type GameState = 'login' | 'menu' | 'editor' | 'history' | 'studying' | 'study-progress' | 'profile' | 'importing'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [gameState, setGameState] = useState<GameState>('login')
  const [decks, setDecks] = useState<(DeckData & { id?: string })[]>(sampleDecks)
  const [syncing, setSyncing] = useState(false)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [showSplash, setShowSplash] = useState(false)
  const [dueCount, setDueCount] = useState(0)
  const [studyCards, setStudyCards] = useState<DueCard[]>([])
  const [studyResults, setStudyResults] = useState({ correct: 0, incorrect: 0 })
  const [studyBatch, setStudyBatch] = useState(0)
  const [studyReversed, setStudyReversed] = useState(false)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [medals, setMedals] = useState<UnlockedMedal[]>([])
  const [medalToast, setMedalToast] = useState<MedalCheck | null>(null)
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(getDailyGoal())

  // Check for shared deck in URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const deckParam = params.get('deck')
    if (deckParam) {
      const shared = decodeDeckFromShare(deckParam)
      if (shared) {
        const confirmed = confirm(`Importar deck "${shared.title}" (${shared.cards.length} cards)?`)
        if (confirmed) {
          handleSaveDeck(shared)
        }
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

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
    const today = new Date().toISOString().split('T')[0]
    const lastSplash = localStorage.getItem('streak-splash-date')
    if (lastSplash !== today) {
      setShowSplash(true)
      localStorage.setItem('streak-splash-date', today)
    }
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

  const handleStartStudy = async (deckId?: string) => {
    if (!user) return
    const cards = await fetchDueCards(user.id, deckId)
    if (cards.length === 0) return
    setStudyCards(shuffleArray(cards))
    setStudyBatch(0)
    setStudyResults({ correct: 0, incorrect: 0 })
    setStudyReversed(false)
    setGameState('studying')
  }

  const handleStudyDeck = (deck: DeckData & { id?: string }, reversed = false) => {
    const dueCards: DueCard[] = deck.cards.map((card, i) => ({
      id: deck.id ? `${deck.id}-${i}` : `local-${i}`,
      front: reversed ? card.back : card.front,
      back: reversed ? card.front : card.back,
      deckId: deck.id || 'local',
      deckTitle: deck.title,
      stability: 1.0,
      difficulty: 0.5,
    }))
    setStudyCards(shuffleArray(dueCards))
    setStudyBatch(0)
    setStudyResults({ correct: 0, incorrect: 0 })
    setStudyReversed(reversed)
    setGameState('studying')
  }

  const handleStudyComplete = async (results: { correct: number; incorrect: number }) => {
    setStudyResults(prev => ({
      correct: prev.correct + results.correct,
      incorrect: prev.incorrect + results.incorrect,
    }))
    setGameState('study-progress')

    // Update daily goal
    const totalCards = results.correct + results.incorrect
    const updatedGoal = incrementDailyProgress(totalCards)
    setDailyGoal(updatedGoal)

    if (user) {
      const updatedStreak = await recordDailyPlay(user.id)
      setStreak(updatedStreak)

      const xpEarned = results.correct * 15 + results.incorrect * 5
      const { progress: prog, newMedals } = await recordStudySession(
        user.id,
        totalCards,
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

  const handleBackToMenu = () => {
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
            <DailyGoalBar
              goal={dailyGoal}
              onChangeTarget={() => {
                const input = prompt('Meta diária (cards):', String(dailyGoal.target))
                if (input) {
                  const n = parseInt(input, 10)
                  if (n > 0) {
                    setDailyGoalTarget(n)
                    setDailyGoal({ ...dailyGoal, target: n })
                  }
                }
              }}
            />
            <TodayView dueCount={dueCount} onStudy={() => handleStartStudy()} />
            <DeckSelector
              decks={decks}
              onSelect={(deck) => handleStudyDeck(deck)}
              onStudy={(deck) => handleStudyDeck(deck)}
              onReverse={(deck) => handleStudyDeck(deck, true)}
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

        {gameState === 'studying' && studyCards.length > 0 && (
          <StudyMode
            cards={studyCards.slice(studyBatch * 20, (studyBatch + 1) * 20)}
            userId={user?.id || ''}
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
