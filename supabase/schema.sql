-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'Pending' check (status in ('Completed', 'In Progress', 'Pending')),
  due_date date not null,
  tags text[] not null default '{}',
  category text not null check (category in ('Work', 'Personal', 'Health')),
  time text,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Enables realtime sync so changes made on one device appear on others instantly.
alter publication supabase_realtime add table public.tasks;
