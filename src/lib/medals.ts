export type Tier = 'bronze' | 'silver' | 'gold'

export interface MedalDef {
  id: string
  emoji: string
  name: string
  bronze: { requirement: number; description: string }
  silver: { requirement: number; description: string }
  gold: { requirement: number; description: string }
}

export interface UnlockedMedal {
  medalId: string
  tier: Tier
  unlockedAt: string
}

export interface MedalCheck {
  medalId: string
  tier: Tier
}

export const MEDALS: MedalDef[] = [
  {
    id: 'reviewer',
    emoji: '📚',
    name: 'Revisor',
    bronze: { requirement: 50, description: '50 cards revisados' },
    silver: { requirement: 200, description: '200 cards revisados' },
    gold: { requirement: 1000, description: '1000 cards revisados' },
  },
  {
    id: 'consistent',
    emoji: '🔥',
    name: 'Consistente',
    bronze: { requirement: 7, description: '7 dias de streak' },
    silver: { requirement: 30, description: '30 dias de streak' },
    gold: { requirement: 100, description: '100 dias de streak' },
  },
  {
    id: 'accurate',
    emoji: '🎯',
    name: 'Preciso',
    bronze: { requirement: 80, description: '80% acurácia (50+ cards)' },
    silver: { requirement: 90, description: '90% acurácia (100+ cards)' },
    gold: { requirement: 95, description: '95% acurácia (300+ cards)' },
  },
  {
    id: 'matcher',
    emoji: '🃏',
    name: 'Pareador',
    bronze: { requirement: 10, description: '10 matching games' },
    silver: { requirement: 50, description: '50 matching games' },
    gold: { requirement: 200, description: '200 matching games' },
  },
  {
    id: 'creator',
    emoji: '✍️',
    name: 'Criador',
    bronze: { requirement: 1, description: '1 deck criado' },
    silver: { requirement: 5, description: '5 decks criados' },
    gold: { requirement: 15, description: '15 decks criados' },
  },
  {
    id: 'speedy',
    emoji: '⚡',
    name: 'Veloz',
    bronze: { requirement: 60, description: 'Matching em menos de 60s' },
    silver: { requirement: 45, description: 'Matching em menos de 45s' },
    gold: { requirement: 30, description: 'Matching em menos de 30s' },
  },
  {
    id: 'studious',
    emoji: '📖',
    name: 'Estudioso',
    bronze: { requirement: 5, description: '5 sessões de estudo' },
    silver: { requirement: 30, description: '30 sessões de estudo' },
    gold: { requirement: 100, description: '100 sessões de estudo' },
  },
  {
    id: 'veteran',
    emoji: '🏆',
    name: 'Veterano',
    bronze: { requirement: 5, description: 'Nível 5' },
    silver: { requirement: 10, description: 'Nível 10' },
    gold: { requirement: 20, description: 'Nível 20' },
  },
  {
    id: 'freezer',
    emoji: '🧊',
    name: 'Congelante',
    bronze: { requirement: 1, description: '1 freeze usado' },
    silver: { requirement: 5, description: '5 freezes usados' },
    gold: { requirement: 20, description: '20 freezes usados' },
  },
  {
    id: 'diamond',
    emoji: '💎',
    name: 'Diamante',
    bronze: { requirement: 1000, description: '1000 XP total' },
    silver: { requirement: 5000, description: '5000 XP total' },
    gold: { requirement: 15000, description: '15000 XP total' },
  },
]

interface UserStats {
  totalReviews: number
  longestStreak: number
  accuracy: number // 0-100
  totalReviewsForAccuracy: number // minimum cards for accuracy medal
  gamesPlayed: number
  decksCreated: number
  fastestGame: number | null // seconds
  studySessions: number
  currentLevel: number
  totalFreezesUsed: number
  totalXp: number
}

const TIERS: Tier[] = ['bronze', 'silver', 'gold']

export function checkMedals(
  stats: UserStats,
  alreadyUnlocked: UnlockedMedal[]
): MedalCheck[] {
  const newMedals: MedalCheck[] = []

  for (const medal of MEDALS) {
    for (const tier of TIERS) {
      // Skip if already unlocked
      const hasIt = alreadyUnlocked.some(
        (m) => m.medalId === medal.id && m.tier === tier
      )
      if (hasIt) continue

      // Check if requirement is met
      const requirement = medal[tier].requirement
      let met = false

      switch (medal.id) {
        case 'reviewer':
          met = stats.totalReviews >= requirement
          break
        case 'consistent':
          met = stats.longestStreak >= requirement
          break
        case 'accurate':
          if (tier === 'bronze') met = stats.accuracy >= requirement && stats.totalReviewsForAccuracy >= 50
          else if (tier === 'silver') met = stats.accuracy >= requirement && stats.totalReviewsForAccuracy >= 100
          else met = stats.accuracy >= requirement && stats.totalReviewsForAccuracy >= 300
          break
        case 'matcher':
          met = stats.gamesPlayed >= requirement
          break
        case 'creator':
          met = stats.decksCreated >= requirement
          break
        case 'speedy':
          met = stats.fastestGame !== null && stats.fastestGame <= requirement
          break
        case 'studious':
          met = stats.studySessions >= requirement
          break
        case 'veteran':
          met = stats.currentLevel >= requirement
          break
        case 'freezer':
          met = stats.totalFreezesUsed >= requirement
          break
        case 'diamond':
          met = stats.totalXp >= requirement
          break
      }

      if (met) {
        newMedals.push({ medalId: medal.id, tier })
      } else {
        // Don't check higher tiers if lower isn't met
        break
      }
    }
  }

  return newMedals
}
