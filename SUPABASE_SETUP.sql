-- Fatemeh Live v4 - one-time Supabase setup
-- Run this whole file in Supabase > SQL Editor.

create table if not exists public.couple_progress (
  room_id uuid primary key,
  room_key text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.couple_progress enable row level security;

grant select, insert, update on public.couple_progress to anon;
grant select, insert, update on public.couple_progress to authenticated;

-- A client can only see/update a row when it sends the matching private room key.
drop policy if exists "room_select_by_private_key" on public.couple_progress;
create policy "room_select_by_private_key"
on public.couple_progress for select
to anon, authenticated
using (
  room_key = coalesce(current_setting('request.headers', true)::json ->> 'x-room-key', '')
);

drop policy if exists "room_insert_by_private_key" on public.couple_progress;
create policy "room_insert_by_private_key"
on public.couple_progress for insert
to anon, authenticated
with check (
  room_key = coalesce(current_setting('request.headers', true)::json ->> 'x-room-key', '')
);

drop policy if exists "room_update_by_private_key" on public.couple_progress;
create policy "room_update_by_private_key"
on public.couple_progress for update
to anon, authenticated
using (
  room_key = coalesce(current_setting('request.headers', true)::json ->> 'x-room-key', '')
)
with check (
  room_key = coalesce(current_setting('request.headers', true)::json ->> 'x-room-key', '')
);

-- No DELETE policy is created intentionally.
-- Realtime in this project uses a private-looking Broadcast topic as a refresh signal,
-- while reads/writes remain protected by the room key RLS above.
