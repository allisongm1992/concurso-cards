export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string
          user_id: string
          title: string
          subject: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subject: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subject?: string
          description?: string | null
          is_public?: boolean
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          deck_id: string
          front: string
          back: string
          times_seen: number
          times_correct: number
          next_review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          front: string
          back: string
          times_seen?: number
          times_correct?: number
          next_review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          front?: string
          back?: string
          times_seen?: number
          times_correct?: number
          next_review?: string | null
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          deck_id: string
          score: number
          total_pairs: number
          time_seconds: number
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deck_id: string
          score: number
          total_pairs: number
          time_seconds: number
          played_at?: string
        }
        Update: {
          id?: string
          score?: number
          total_pairs?: number
          time_seconds?: number
        }
      }
    }
  }
}
