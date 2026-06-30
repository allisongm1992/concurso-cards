'use client'

import { useState, useEffect } from 'react'
import { fetchGameHistory } from '@/lib/sync'

interface GameHistoryProps {
  userId: string
  onBack: () => void
}

interface GameRecord {
  id: string
  score: number
  total_pairs: number
  time_seconds: number
  played_at: string
  decks: { title: string; subject: string } | null
}

export default function GameHistory({ userId, onBack }: GameHistoryProps) {
  const [history, setHistory] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [userId])

  const loadHistory = async () => {
    setLoading(true)
    const data = await fetchGameHistory(userId)
    setHistory(data as GameRecord[])
    setLoading(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalGames = history.length
  const avgScore = totalGames
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / totalGames)
    : 0
  const bestScore = totalGames
    ? Math.max(...history.map((h) => h.score))
    : 0

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <button
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          ← Voltar
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-12 mb-10">
        <div>
          <div className="text-2xl font-bold tabular-nums">{totalGames}</div>
          <div className="text-xs text-neutral-600">Partidas</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{avgScore}</div>
          <div className="text-xs text-neutral-600">Média</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{bestScore}</div>
          <div className="text-xs text-neutral-600">Recorde</div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-neutral-600 text-sm py-8">Carregando...</div>
      ) : history.length === 0 ? (
        <div className="text-neutral-700 text-sm py-8">
          Nenhuma partida ainda.
        </div>
      ) : (
        <div className="border-t border-neutral-900">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex justify-between items-center py-4 border-b border-neutral-900"
            >
              <div>
                <div className="text-sm text-neutral-200">
                  {record.decks?.title || 'Deck removido'}
                </div>
                <div className="text-xs text-neutral-700 mt-0.5">
                  {formatDate(record.played_at)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium tabular-nums">{record.score}</div>
                <div className="text-xs text-neutral-700 tabular-nums">
                  {formatTime(record.time_seconds)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
