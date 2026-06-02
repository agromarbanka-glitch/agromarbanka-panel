AGROMARBANKA panel v23 — edycja dokumentu i historia

Bazą jest v22.1.

Dodano:
1. Edycję dokumentu/operacji z poziomu „Ostatnie operacje”.
2. Możliwość zmiany:
   - kontrahenta,
   - typu,
   - magazynu,
   - daty,
   - pozycji opakowań i ilości.
3. Historia edycji zapisywana w Supabase:
   - kto edytował,
   - kiedy,
   - opis zmian,
   - stan przed i po.
4. Historia edycji widoczna w podglądzie dokumentu.

Supabase:
Uruchom:
SUPABASE_V23_HISTORIA_EDYCJI.sql

Uwaga:
Edycja działa dla nowych dokumentów wielopozycyjnych z dokument_id. Dla starszych pojedynczych operacji również jest obsługa podstawowa.
