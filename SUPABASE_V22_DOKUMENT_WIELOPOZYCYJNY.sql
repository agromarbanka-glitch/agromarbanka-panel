-- AGROMARBANKA panel v22 — dokument wielopozycyjny
-- Uruchom w Supabase SQL Editor -> Run
-- Dodaje wspólny identyfikator dokumentu dla kilku pozycji w jednej operacji.

alter table public.operacje
add column if not exists dokument_id text;

create index if not exists idx_operacje_dokument_id
on public.operacje(dokument_id);
