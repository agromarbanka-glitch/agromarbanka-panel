AGROMARBANKA panel v22 — ETAP 2: wiele opakowań w jednym dokumencie

Baza: działająca v21.6.1 z raportami.

Co dodano:
1. W zakładce Operacja można dodać kilka pozycji opakowań dla jednego kontrahenta.
2. Jeden zapis tworzy jeden dokument wielopozycyjny.
3. Każda pozycja zapisuje się jako osobny wpis w operacje, ale ma wspólny dokument_id.
4. Podgląd/druk dokumentu pokazuje tabelę pozycji.
5. Po zapisie formularz się czyści.

Supabase:
Uruchom plik:
SUPABASE_V22_DOKUMENT_WIELOPOZYCYJNY.sql

Jeśli SQL nie zostanie uruchomiony, aplikacja spróbuje zapisać pozycje bez dokument_id, ale wtedy podgląd grupowy dokumentu nie będzie pełny.

Nie zawiera jeszcze:
- edycji dokumentu,
- historii edycji,
- realtime.

Wgranie:
1. Rozpakuj ZIP.
2. Wgraj całą zawartość do GitHub: src, public, index.html, package.json itd.
3. Commit changes.
4. Poczekaj na Vercel.
5. Uruchom SQL w Supabase.
6. Otwórz aplikację CTRL+SHIFT+R albo incognito.
