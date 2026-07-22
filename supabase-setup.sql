-- ===================================================
-- PAC-MAN OPTIMUM — Leaderboard schema for Supabase
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- ===================================================

-- 1) The table itself: one row per nickname (best score wins)
create table if not exists public.leaderboard (
    id uuid primary key default gen_random_uuid(),
    nickname text not null unique,
    score integer not null default 0,
    level integer not null default 1,
    updated_at timestamptz not null default now()
);

-- 2) Lock the table down. Nobody can insert/update it directly —
--    all writes go through the submit_score() function below.
alter table public.leaderboard enable row level security;

drop policy if exists "Public can read leaderboard" on public.leaderboard;
create policy "Public can read leaderboard"
    on public.leaderboard
    for select
    using (true);

-- 3) Safe score submission: validates input and only ever keeps the
--    player's BEST score, so replaying doesn't create duplicate rows
--    or overwrite a high score with a lower one. Runs as the table
--    owner (security definer), so it works even though the table has
--    no public insert/update policy.
create or replace function public.submit_score(
    p_nickname text,
    p_score integer,
    p_level integer default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_score < 0 or p_score > 200000 then
        raise exception 'invalid score';
    end if;
    if length(trim(p_nickname)) < 1 or length(trim(p_nickname)) > 20 then
        raise exception 'invalid nickname';
    end if;

    insert into public.leaderboard (nickname, score, level)
    values (trim(p_nickname), p_score, greatest(1, p_level))
    on conflict (nickname) do update
    set score = greatest(public.leaderboard.score, excluded.score),
        level = case when excluded.score > public.leaderboard.score
                      then excluded.level
                      else public.leaderboard.level end,
        updated_at = now();
end;
$$;

grant execute on function public.submit_score(text, integer, integer) to anon;

-- 4) Helpful index for the "top scores" query the game runs.
create index if not exists leaderboard_score_idx on public.leaderboard (score desc);
