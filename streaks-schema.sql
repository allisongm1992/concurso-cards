-- Streak system for Concurso Cards
-- Execute in Supabase Dashboard > SQL Editor

create table public.user_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_played_date date,
  freeze_available boolean default true not null,
  freeze_used_at timestamptz,
  created_at timestamptz default now()
);

create index user_streaks_user_id_idx on public.user_streaks(user_id);

alter table public.user_streaks enable row level security;

create policy "Users can view own streak" on public.user_streaks
  for select using (auth.uid() = user_id);

create policy "Users can insert own streak" on public.user_streaks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own streak" on public.user_streaks
  for update using (auth.uid() = user_id);
