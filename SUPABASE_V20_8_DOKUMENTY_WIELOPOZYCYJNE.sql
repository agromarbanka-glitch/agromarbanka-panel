
-- AGROMARBANKA v20.8 — kolumny dla dokumentów wielopozycyjnych
-- Uruchom opcjonalnie w Supabase SQL Editor.
-- Nie usuwa danych. Dodaje tylko kolumny, jeśli ich nie ma.

alter table operacje add column if not exists dokument_id text;
alter table operacje add column if not exists pozycja_nr int;

create index if not exists idx_operacje_dokument_id on operacje(dokument_id);
