-- AGROMARBANKA panel v25 — indeksy pod dużą liczbę operacji
-- Uruchom opcjonalnie w Supabase SQL Editor -> Run.
-- Ten SQL NIE usuwa danych. Dodaje tylko indeksy przyspieszające historię i raporty.

create index if not exists idx_operacje_id_desc
on public.operacje(id desc);

create index if not exists idx_operacje_data_operacji
on public.operacje(data_operacji);

create index if not exists idx_operacje_kontrahent
on public.operacje(kontrahent);

create index if not exists idx_operacje_dokument_id
on public.operacje(dokument_id);

create index if not exists idx_operacje_typ
on public.operacje(typ);

create index if not exists idx_usuniete_operacje_id_desc
on public.usuniete_operacje(id desc);

create index if not exists idx_usuniete_operacje_data_operacji
on public.usuniete_operacje(data_operacji);
