AGROMARBANKA panel v21.6 — ETAP 1 BEZPIECZNY

Baza: działająca v21.5.
Zmiany są wykonane bezpośrednio w src/main.jsx i src/style.css.
Nie ma żadnych doklejanych skryptów w index.html.

Zawiera:
1. Operacja:
   - wybór kontrahenta nie otwiera białego okna,
   - po wybraniu kontrahenta podpowiedzi znikają,
   - po zapisaniu operacji pola kontrahent/opakowanie są czyszczone tak jak w bazowej v21.5.

2. Raporty:
   - wyszukiwanie kontrahenta po pierwszych literach/nazwie,
   - działa tylko w zakładce Raporty.

3. Kontrahenci:
   - blokada dodania kontrahenta o identycznej nazwie.

4. Użytkownicy:
   - blokada dodania użytkownika z tym samym telefonem.

Nie zawiera:
- historii edycji,
- wielu opakowań w jednym dokumencie,
- realtime.

Supabase:
- Nie trzeba nic uruchamiać.
