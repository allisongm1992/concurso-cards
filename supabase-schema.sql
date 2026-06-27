-- Schema para o Concurso Cards
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Tabela de decks (baralhos)
create table public.decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  subject text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de cards (pares de flashcards)
create table public.cards (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references public.decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  times_seen integer default 0,
  times_correct integer default 0,
  next_review timestamptz,
  created_at timestamptz default now()
);

-- Tabela de sessões de jogo
create table public.game_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  deck_id uuid references public.decks(id) on delete cascade not null,
  score integer not null,
  total_pairs integer not null,
  time_seconds integer not null,
  played_at timestamptz default now()
);

-- Índices
create index decks_user_id_idx on public.decks(user_id);
create index cards_deck_id_idx on public.cards(deck_id);
create index game_sessions_user_id_idx on public.game_sessions(user_id);
create index game_sessions_deck_id_idx on public.game_sessions(deck_id);

-- Row Level Security
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.game_sessions enable row level security;

-- Políticas: usuário vê seus próprios dados + decks públicos
create policy "Users can view own decks" on public.decks
  for select using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own decks" on public.decks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own decks" on public.decks
  for update using (auth.uid() = user_id);

create policy "Users can delete own decks" on public.decks
  for delete using (auth.uid() = user_id);

-- Cards: acesso via deck
create policy "Users can view cards of accessible decks" on public.cards
  for select using (
    exists (
      select 1 from public.decks
      where decks.id = cards.deck_id
      and (decks.user_id = auth.uid() or decks.is_public = true)
    )
  );

create policy "Users can insert cards in own decks" on public.cards
  for insert with check (
    exists (
      select 1 from public.decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

create policy "Users can update cards in own decks" on public.cards
  for update using (
    exists (
      select 1 from public.decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

create policy "Users can delete cards in own decks" on public.cards
  for delete using (
    exists (
      select 1 from public.decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- Game sessions: só o próprio usuário
create policy "Users can view own sessions" on public.game_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on public.game_sessions
  for insert with check (auth.uid() = user_id);
