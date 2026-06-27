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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📊 Histórico</h1>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
          <div className="text-xs text-slate-400">Partidas</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{avgScore}</div>
          <div className="text-xs text-slate-400">Média</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{bestScore}</div>
          <div className="text-xs text-slate-400">Recorde</div>
        </div>
      </div>

      {/* Lista de partidas */}
      {loading ? (
        <div className="text-center text-slate-400 py-8">Carregando...</div>
      ) : history.length === 0 ? (
        <div className="text-center text-slate-500 py-8">
          <p className="text-4xl mb-3">🎮</p>
          <p>Nenhuma partida ainda. Jogue para ver seu histórico!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-slate-800 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-sm">
                  {record.decks?.title || 'Deck removido'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {record.decks?.subject} • {formatDate(record.played_at)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-400">{record.score} pts</div>
                <div className="text-xs text-slate-500">
                  {formatTime(record.time_seconds)} • {record.total_pairs} pares
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
