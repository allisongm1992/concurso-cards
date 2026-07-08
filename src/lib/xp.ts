export interface LevelInfo {
  level: number
  faixa: string
  faixaColor: string
  xpInLevel: number
  xpForLevel: number
  totalXp: number
}

interface FaixaConfig {
  name: string
  color: string
  levels: number
  xpPerLevel: number
}

const FAIXAS: FaixaConfig[] = [
  { name: 'Iniciante', color: 'text-neutral-500', levels: 5, xpPerLevel: 200 },
  { name: 'Estudante', color: 'text-emerald-400', levels: 5, xpPerLevel: 400 },
  { name: 'Dedicado', color: 'text-purple-400', levels: 5, xpPerLevel: 700 },
  { name: 'Aprovado', color: 'text-amber-400', levels: 5, xpPerLevel: 1000 },
  { name: 'Mestre', color: 'text-emerald-400', levels: 5, xpPerLevel: 1500 },
]

export function calculateLevel(totalXp: number): LevelInfo {
  let remaining = totalXp
  let levelCount = 0

  for (const faixa of FAIXAS) {
    for (let i = 0; i < faixa.levels; i++) {
      if (remaining < faixa.xpPerLevel) {
        return {
          level: levelCount + 1,
          faixa: faixa.name,
          faixaColor: faixa.color,
          xpInLevel: remaining,
          xpForLevel: faixa.xpPerLevel,
          totalXp,
        }
      }
      remaining -= faixa.xpPerLevel
      levelCount++
    }
  }

  // Max level reached
  const lastFaixa = FAIXAS[FAIXAS.length - 1]
  return {
    level: 25,
    faixa: lastFaixa.name,
    faixaColor: lastFaixa.color,
    xpInLevel: lastFaixa.xpPerLevel,
    xpForLevel: lastFaixa.xpPerLevel,
    totalXp,
  }
}




export function getXpForMedal(): number {
  return 30
}
