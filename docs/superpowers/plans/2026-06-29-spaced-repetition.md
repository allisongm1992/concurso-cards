# Spaced Repetition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add FSRS spaced repetition algorithm, quick study mode (tap to reveal), and Today View dashboard to the Concurso Cards app.

**Architecture:** New SQL migration adds `card_reviews` table and FSRS columns to `cards`. A `fsrs.ts` module handles scheduling math. A `reviews.ts` module handles DB queries for due cards and recording reviews. Three new components: `TodayView` (dashboard), `StudyMode` (card review), `StudyProgress` (session summary). Integrated into existing `page.tsx` flow.

**Tech Stack:** Next.js 16, React 19, Supabase (PostgreSQL + RLS), Tailwind CSS 4, TypeScript.

## Global Constraints

- Supabase client via `src/lib/supabase.ts` (singleton, browser-only)
- All DB operations follow pattern from `src/lib/sync.ts`
- RLS enabled on all new tables
- Immutable state updates (no mutation)
- Tailwind CSS 4 for styling (no external UI libraries)
- All dates in UTC
- FSRS params: decay = -0.5, factor = 0.9
- Session size: 20 cards max per batch
- Ratings: 'again' | 'good' (only two options)

---

### Task 1: SQL Migration

**Files:**
- Create: `spaced-repetition-schema.sql`

**Interfaces:**
- Consumes: existing `cards` table structure
- Produces: `card_reviews` table, new columns on `cards` (stability, difficulty, due_date, last_review)

- [ ] **Step 1: Write the migration file**

```sql
-- Spaced Repetition schema for Concurso Cards
-- Execute in Supabase Dashboard > SQL Editor

-- Add FSRS columns to cards table
alter table public.cards
  add column stability float default 1.0,
  add column difficulty float default 0.5,
  add column due_date date,
  add column last_review timestamptz;

-- Review history table
create table public.card_reviews (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.cards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating text not null check (rating in ('again', 'good')),
  reviewed_at timestamptz default now()
);

create index card_reviews_card_id_idx on public.card_reviews(card_id);
create index card_reviews_user_id_idx on public.card_reviews(user_id);
create index cards_due_date_idx on public.cards(due_date);

alter table public.card_reviews enable row level security;

create policy "Users can view own reviews" on public.card_reviews
  for select using (auth.uid() = user_id);

create policy "Users can insert own reviews" on public.card_reviews
  for insert with check (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add spaced-repetition-schema.sql
git commit -m "feat: add spaced repetition SQL migration"
```

---

### Task 2: FSRS Algorithm Module

**Files:**
- Create: `src/lib/fsrs.ts`

**Interfaces:**
- Consumes: nothing (pure math)
- Produces:
  - `calculateNextReview(stability: number, difficulty: number, rating: 'again' | 'good'): { stability: number, difficulty: number, dueDate: string }`
  - `getInitialParams(): { stability: number, difficulty: number }`
  - `Rating` type: `'again' | 'good'`

- [ ] **Step 1: Create the FSRS module**

```typescript
export type Rating = 'again' | 'good'

interface ReviewResult {
  stability: number
  difficulty: number
  dueDate: string
}

const DECAY = -0.5
const FACTOR = 0.9

export function getInitialParams() {
  return { stability: 1.0, difficulty: 0.5 }
}

export function calculateNextReview(
  stability: number,
  difficulty: number,
  rating: Rating
): ReviewResult {
  const today = new Date()

  if (rating === 'again') {
    const newStability = Math.max(0.5, stability * 0.5)
    const newDifficulty = Math.min(1, difficulty + 0.2)
    const due = new Date(today)
    due.setUTCDate(due.getUTCDate() + 1)
    return {
      stability: newStability,
      difficulty: newDifficulty,
      dueDate: due.toISOString().split('T')[0],
    }
  }

  // rating === 'good'
  const newStability = stability * (1 + Math.exp(DECAY) * FACTOR * Math.pow(stability, -0.5))
  const newDifficulty = Math.max(0, difficulty - 0.1)
  const intervalDays = Math.ceil(newStability)
  const due = new Date(today)
  due.setUTCDate(due.getUTCDate() + intervalDays)

  return {
    stability: newStability,
    difficulty: newDifficulty,
    dueDate: due.toISOString().split('T')[0],
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fsrs.ts
git commit -m "feat: add FSRS spaced repetition algorithm"
```

---

### Task 3: Reviews Data Module

**Files:**
- Create: `src/lib/reviews.ts`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.ts`, `calculateNextReview` and `Rating` from `src/lib/fsrs.ts`
- Produces:
  - `fetchDueCards(userId: string, deckId?: string): Promise<DueCard[]>`
  - `recordReview(userId: string, cardId: string, deckId: string, rating: Rating): Promise<void>`
  - `getDueCount(userId: string): Promise<number>`
  - `getDueCountByDeck(userId: string): Promise<{ deckId: string, deckTitle: string, count: number }[]>`
  - `DueCard` type: `{ id: string, front: string, back: string, deckId: string, stability: number, difficulty: number }`

- [ ] **Step 1: Create the reviews module**

```typescript
import { supabase } from './supabase'
import { calculateNextReview, Rating } from './fsrs'

export type { Rating } from './fsrs'

export interface DueCard {
  id: string
  front: string
  back: string
  deckId: string
  stability: number
  difficulty: number
}

export async function fetchDueCards(userId: string, deckId?: string): Promise<DueCard[]> {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('cards')
    .select('id, front, back, deck_id, stability, difficulty, due_date')
    .or(`due_date.lte.${today},due_date.is.null`)
    .order('due_date', { ascending: true, nullsFirst: true })

  if (deckId) {
    query = query.eq('deck_id', deckId)
  } else {
    // Filter to user's decks
    const { data: userDecks } = await supabase
      .from('decks')
      .select('id')
      .eq('user_id', userId)

    if (!userDecks || userDecks.length === 0) return []
    const deckIds = userDecks.map(d => d.id)
    query = query.in('deck_id', deckIds)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back,
    deckId: card.deck_id,
    stability: card.stability ?? 1.0,
    difficulty: card.difficulty ?? 0.5,
  }))
}

export async function recordReview(
  userId: string,
  cardId: string,
  deckId: string,
  rating: Rating
): Promise<void> {
  // Get current card params
  const { data: card } = await supabase
    .from('cards')
    .select('stability, difficulty')
    .eq('id', cardId)
    .single()

  const stability = card?.stability ?? 1.0
  const difficulty = card?.difficulty ?? 0.5

  // Calculate next review
  const result = calculateNextReview(stability, difficulty, rating)

  // Update card with new FSRS params
  await supabase
    .from('cards')
    .update({
      stability: result.stability,
      difficulty: result.difficulty,
      due_date: result.dueDate,
      last_review: new Date().toISOString(),
      times_seen: (card as any)?.times_seen ? (card as any).times_seen + 1 : 1,
      times_correct: rating === 'good' ? ((card as any)?.times_correct ? (card as any).times_correct + 1 : 1) : (card as any)?.times_correct ?? 0,
    })
    .eq('id', cardId)

  // Record review history
  await supabase
    .from('card_reviews')
    .insert({
      card_id: cardId,
      user_id: userId,
      rating,
    })
}

export async function getDueCount(userId: string): Promise<number> {
  const cards = await fetchDueCards(userId)
  return cards.length
}

export async function getDueCountByDeck(
  userId: string
): Promise<{ deckId: string; deckTitle: string; count: number }[]> {
  const { data: decks } = await supabase
    .from('decks')
    .select('id, title')
    .eq('user_id', userId)

  if (!decks) return []

  const today = new Date().toISOString().split('T')[0]
  const results: { deckId: string; deckTitle: string; count: number }[] = []

  for (const deck of decks) {
    const { count } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deck.id)
      .or(`due_date.lte.${today},due_date.is.null`)

    results.push({
      deckId: deck.id,
      deckTitle: deck.title,
      count: count ?? 0,
    })
  }

  return results
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reviews.ts
git commit -m "feat: add reviews data module with due cards queries"
```

---

### Task 4: StudyMode Component

**Files:**
- Create: `src/components/StudyMode.tsx`

**Interfaces:**
- Consumes: `DueCard` and `Rating` from `src/lib/reviews.ts`, `recordReview` from `src/lib/reviews.ts`
- Produces: `StudyMode` component with props `{ cards: DueCard[], userId: string, onComplete: (results: { correct: number, incorrect: number }) => void, onBack: () => void }`

- [ ] **Step 1: Create StudyMode component**

```typescript
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
  const batchSize = 20
  const batchEnd = Math.min(cards.length, Math.ceil((currentIndex + 1) / batchSize) * batchSize)
  const inBatchIndex = currentIndex % batchSize

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleRate = useCallback(async (rating: Rating) => {
    if (transitioning) return
    setTransitioning(true)

    // Record the review
    await recordReview(userId, currentCard.id, currentCard.deckId, rating)

    // Update counts
    if (rating === 'good') {
      setCorrect(prev => prev + 1)
    } else {
      setIncorrect(prev => prev + 1)
    }

    // Next card or complete
    const nextIndex = currentIndex + 1

    if (nextIndex >= cards.length) {
      onComplete({ correct: correct + (rating === 'good' ? 1 : 0), incorrect: incorrect + (rating === 'again' ? 1 : 0) })
    } else if (nextIndex % batchSize === 0) {
      // Show progress at batch boundary (handled by parent via onComplete)
      onComplete({ correct: correct + (rating === 'good' ? 1 : 0), incorrect: incorrect + (rating === 'again' ? 1 : 0) })
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
          {inBatchIndex + 1}/{Math.min(batchSize, cards.length - (batchEnd - batchSize))}
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-green-400">✅ {correct}</span>
          <span className="text-red-400">❌ {incorrect}</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        {/* Front */}
        <div className="text-xl font-semibold text-white mb-6">
          {currentCard.front}
        </div>

        {/* Back (revealed) */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StudyMode.tsx
git commit -m "feat: add StudyMode component with tap-to-reveal flow"
```

---

### Task 5: StudyProgress Component

**Files:**
- Create: `src/components/StudyProgress.tsx`

**Interfaces:**
- Consumes: nothing external
- Produces: `StudyProgress` component with props `{ correct: number, incorrect: number, totalDue: number, reviewed: number, onContinue: () => void, onBack: () => void }`

- [ ] **Step 1: Create StudyProgress component**

```typescript
'use client'

interface StudyProgressProps {
  correct: number
  incorrect: number
  totalDue: number
  reviewed: number
  onContinue: () => void
  onBack: () => void
}

export default function StudyProgress({
  correct,
  incorrect,
  totalDue,
  reviewed,
  onContinue,
  onBack,
}: StudyProgressProps) {
  const remaining = totalDue - reviewed
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 text-center">
      <div className="bg-slate-800 rounded-2xl p-8">
        {/* Title */}
        <div className="text-2xl font-bold text-white mb-2">
          {remaining <= 0 ? '🎉 Sessão completa!' : '📊 Progresso'}
        </div>

        {/* Stats */}
        <div className="text-slate-400 mb-6">
          {reviewed}/{totalDue} cards revisados
        </div>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{correct}</div>
            <div className="text-xs text-slate-500">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{incorrect}</div>
            <div className="text-xs text-slate-500">Erros</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
            <div className="text-xs text-slate-500">Precisão</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {remaining > 0 && (
            <button
              onClick={onContinue}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              Continuar ({remaining} restantes)
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
          >
            Voltar pro menu
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StudyProgress.tsx
git commit -m "feat: add StudyProgress summary component"
```

---

### Task 6: TodayView Component

**Files:**
- Create: `src/components/TodayView.tsx`

**Interfaces:**
- Consumes: `getDueCount` from `src/lib/reviews.ts`
- Produces: `TodayView` component with props `{ dueCount: number, onStudy: () => void }`

- [ ] **Step 1: Create TodayView component**

```typescript
'use client'

interface TodayViewProps {
  dueCount: number
  onStudy: () => void
}

export default function TodayView({ dueCount, onStudy }: TodayViewProps) {
  if (dueCount === 0) {
    return (
      <div className="w-full bg-green-900/20 border border-green-700/30 rounded-2xl p-5 mb-6 text-center">
        <div className="text-2xl mb-1">✅</div>
        <div className="text-green-400 font-medium">Tudo em dia!</div>
        <div className="text-slate-500 text-sm">Próxima revisão amanhã</div>
      </div>
    )
  }

  return (
    <div className="w-full bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-medium">
            📚 {dueCount} {dueCount === 1 ? 'card' : 'cards'} pra revisar
          </div>
          <div className="text-slate-500 text-sm">Estude agora e mantenha a memória fresca</div>
        </div>
        <button
          onClick={onStudy}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
        >
          Estudar agora
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TodayView.tsx
git commit -m "feat: add TodayView dashboard component"
```

---

### Task 7: Integration into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `TodayView`, `StudyMode`, `StudyProgress` components; `fetchDueCards`, `getDueCount`, `DueCard` from `src/lib/reviews.ts`
- Produces: Complete study flow integrated into existing app

- [ ] **Step 1: Add new imports, state, and game states**

Add imports:
```typescript
import TodayView from '@/components/TodayView'
import StudyMode from '@/components/StudyMode'
import StudyProgress from '@/components/StudyProgress'
import { fetchDueCards, getDueCount, DueCard } from '@/lib/reviews'
```

Update GameState type:
```typescript
type GameState = 'login' | 'menu' | 'editor' | 'playing' | 'result' | 'history' | 'studying' | 'study-progress'
```

Add state:
```typescript
const [dueCount, setDueCount] = useState(0)
const [studyCards, setStudyCards] = useState<DueCard[]>([])
const [studyResults, setStudyResults] = useState({ correct: 0, incorrect: 0 })
const [studyBatch, setStudyBatch] = useState(0)
```

- [ ] **Step 2: Add study functions**

```typescript
const loadDueCount = async () => {
  if (!user) return
  const count = await getDueCount(user.id)
  setDueCount(count)
}

const handleStartStudy = async (deckId?: string) => {
  if (!user) return
  const cards = await fetchDueCards(user.id, deckId)
  if (cards.length === 0) return
  setStudyCards(cards)
  setStudyBatch(0)
  setStudyResults({ correct: 0, incorrect: 0 })
  setGameState('studying')
}

const handleStudyComplete = (results: { correct: number; incorrect: number }) => {
  setStudyResults(prev => ({
    correct: prev.correct + results.correct,
    incorrect: prev.incorrect + results.incorrect,
  }))
  setGameState('study-progress')
}

const handleStudyContinue = () => {
  setStudyBatch(prev => prev + 1)
  setGameState('studying')
}
```

- [ ] **Step 3: Call loadDueCount on login**

In the `useEffect` that fires on `user` change, add `loadDueCount()`:
```typescript
useEffect(() => {
  if (user) {
    loadDecks()
    loadStreak()
    loadDueCount()
  }
}, [user])
```

Also reload after study completes (in handleBackToMenu):
```typescript
const handleBackToMenu = () => {
  setSelectedDeck(null)
  setSelectedDeckId(null)
  setGameState('menu')
  if (user) loadDueCount()
}
```

- [ ] **Step 4: Add TodayView to menu render**

Inside the `{gameState === 'menu' && (...)}` block, wrap DeckSelector with TodayView above:
```typescript
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
```

- [ ] **Step 5: Add StudyMode and StudyProgress to render**

Add below the existing game states:
```typescript
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
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate spaced repetition study flow into main app"
```

---

## Post-Implementation Checklist

- [ ] Run `npm run build` — no errors
- [ ] Run the SQL in Supabase Dashboard
- [ ] Test: open menu → TodayView shows card count → tap "Estudar agora" → study flow works
- [ ] Test: reveal card → rate "Sabia" → next card appears
- [ ] Test: after 20 cards → progress screen → can continue or go back
- [ ] Test: after study → due count decreases
- [ ] Test: matching game still works independently
