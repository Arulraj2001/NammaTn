-- supabase/migrations/20261017_youtube_broadcast_log.sql
-- Persistent YouTube Broadcast History & Anti-Duplication Table

create table if not exists public.youtube_broadcast_log (
  id uuid primary key default gen_random_uuid(),
  broadcast_date date not null,
  format text not null,               -- 'long-form' | 'podcast' | 'civic-shorts'
  time_ist text not null,             -- '07:00 AM' | '06:00 PM' | '07:30 PM'
  title text not null,
  youtube_video_id text not null,
  youtube_url text not null,
  meta_video_id text,
  meta_reel_id text,
  status text default 'published',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_yt_broadcast_date on public.youtube_broadcast_log(broadcast_date);
create index if not exists idx_yt_broadcast_format on public.youtube_broadcast_log(format);
create index if not exists idx_yt_broadcast_date_format on public.youtube_broadcast_log(broadcast_date, format);

-- Enable RLS
alter table public.youtube_broadcast_log enable row level security;

-- Public can read broadcast logs
create policy "Public can read youtube_broadcast_log"
  on public.youtube_broadcast_log
  for select
  using (true);

-- Service role can insert/update
create policy "Service role can insert youtube_broadcast_log"
  on public.youtube_broadcast_log
  for insert
  with check (true);

create policy "Service role can update youtube_broadcast_log"
  on public.youtube_broadcast_log
  for update
  using (true);
