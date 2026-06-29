-- XP, Levels & Medals schema for Concurso Cards
-- Execute in Supabase Dashboard > SQL Editor

-- User progress tracking
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  total_xp integer default 0 not null,
  games_played integer default 0 not null,
  study_sessions integer default 0 not null,
  total_reviews integer default 0 not null,
  total_correct integer default 0 not null,
  fastest_game integer,
  decks_created integer default 0 not null,
  total_freezes_used integer default 0 not null,
  created_at timestamptz default now()
);

create index user_progress_user_id_idx on public.user_progress(user_id);

alter table public.user_progress enable row level security;

create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on public.user_progress
  for update using (auth.uid() = user_id);

-- User medals
create table public.user_medals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  medal_id text not null,
  tier text not null check (tier in ('bronze', 'silver', 'gold')),
  unlocked_at timestamptz default now(),
  unique(user_id, medal_id, tier)
);

create index user_medals_user_id_idx on public.user_medals(user_id);

alter table public.user_medals enable row level security;

create policy "Users can view own medals" on public.user_medals
  for select using (auth.uid() = user_id);

create policy "Users can insert own medals" on public.user_medals
  for insert with check (auth.uid() = user_id);
