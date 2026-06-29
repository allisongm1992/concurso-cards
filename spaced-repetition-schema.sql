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
