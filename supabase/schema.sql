-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Then create Storage bucket "event-flyers" as public (or use SQL below).

-- Events (times stored as UTC; app displays America/Chicago)
create table if not exists public.chapter_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  flyer_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chapter_events_starts_at_idx on public.chapter_events (starts_at);

alter table public.chapter_events enable row level security;

-- Anyone can read events (public site)
create policy "chapter_events_select_public"
  on public.chapter_events for select
  using (true);

-- Only signed-in users can modify (create chapter officer accounts in Authentication)
create policy "chapter_events_insert_authenticated"
  on public.chapter_events for insert
  with check (auth.role() = 'authenticated');

create policy "chapter_events_update_authenticated"
  on public.chapter_events for update
  using (auth.role() = 'authenticated');

create policy "chapter_events_delete_authenticated"
  on public.chapter_events for delete
  using (auth.role() = 'authenticated');

-- Optional: Dashboard → Database → Replication → enable `chapter_events` for live calendar updates.

-- Storage bucket for flyers (public read, authenticated write). If this insert fails, create the bucket
-- in Dashboard → Storage → New bucket → name `event-flyers` → Public bucket.
insert into storage.buckets (id, name, public)
values ('event-flyers', 'event-flyers', true)
on conflict (id) do nothing;

create policy "Flyers public read"
  on storage.objects for select
  using (bucket_id = 'event-flyers');

create policy "Flyers authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'event-flyers' and auth.role() = 'authenticated');

create policy "Flyers authenticated update"
  on storage.objects for update
  using (bucket_id = 'event-flyers' and auth.role() = 'authenticated');

create policy "Flyers authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'event-flyers' and auth.role() = 'authenticated');
