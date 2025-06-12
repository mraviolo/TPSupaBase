create table public.games (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  board text[] not null default array_fill(null::text, array[9]),
  current_player text not null check (current_player in ('X', 'O')),
  status text not null check (status in ('playing', 'won', 'draw')),
  winner text check (winner in ('X', 'O')),
  user_id uuid references auth.users(id)
);

-- Habilitar RLS
alter table public.games enable row level security;

-- Crear políticas de seguridad
create policy "Los usuarios pueden ver sus propios juegos"
  on public.games for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear juegos"
  on public.games for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios juegos"
  on public.games for update
  using (auth.uid() = user_id); 