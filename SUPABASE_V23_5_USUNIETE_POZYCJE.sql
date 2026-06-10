-- AGROMARBANKA panel v23.5 — usunięte pozycje dokumentów
-- Uruchom w Supabase SQL Editor -> Run

alter table public.usuniete_operacje
add column if not exists dokument_id text;

create index if not exists idx_usuniete_operacje_dokument_id
on public.usuniete_operacje(dokument_id);
