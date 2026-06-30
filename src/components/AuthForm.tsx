'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthFormProps {
  onAuthSuccess: () => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Verifique seu email para confirmar o cadastro.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        onAuthSuccess()
      }
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Concurso Cards</h1>
        <p className="text-neutral-500 text-sm mt-2">
          {isSignUp ? 'Crie sua conta' : 'Entre para continuar'}
        </p>
      </div>

      <div>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar com Google
        </button>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-neutral-800"></div>
          <span className="px-3 text-xs text-neutral-600">ou</span>
          <div className="flex-1 border-t border-neutral-800"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-emerald-600 transition-colors"
            placeholder="Senha"
          />

          {error && (
            <div className="text-red-400 text-xs p-3 border border-red-900/30 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="text-emerald-400 text-xs p-3 border border-emerald-900/30 rounded-lg">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
            setMessage(null)
          }}
          className="w-full mt-4 text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          {isSignUp ? 'Já tem conta? Entre' : 'Criar conta'}
        </button>
      </div>

      <button
        onClick={onAuthSuccess}
        className="w-full mt-12 py-3 text-neutral-700 hover:text-neutral-400 text-xs transition-colors cursor-pointer"
      >
        Continuar sem conta
      </button>
    </div>
  )
}
