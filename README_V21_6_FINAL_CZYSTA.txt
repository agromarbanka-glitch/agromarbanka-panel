AGROMARBANKA panel v21.6 FINAL CZYSTA

Baza: działająca v21.5.
Zmiany są zrobione bezpośrednio w src/main.jsx i src/style.css, bez skryptów doklejanych do index.html.

Co zawiera:
1. Operacja:
   - wybór kontrahenta nie otwiera białego okna,
   - po wybraniu kontrahenta lista podpowiedzi znika,
   - po zapisaniu operacji kontrahent/opakowanie są czyszczone.

2. Raporty:
   - wyszukiwanie kontrahenta po pierwszych literach/nazwie,
   - filtr działa tylko w raportach.

3. Kontrahenci:
   - blokada dodania kontrahenta z identyczną nazwą.

4. Użytkownicy:
   - blokada dodania użytkownika z tym samym telefonem.

Nie zawiera:
- historii edycji,
- wielu opakowań w jednym dokumencie,
- realtime.

Supabase:
- Nie trzeba nic uruchamiać.

Wgranie:
1. Rozpakuj ZIP.
2. Wgraj CAŁĄ zawartość paczki do GitHub: src, public, index.html, package.json itd.
3. Commit changes.
4. Poczekaj na deploy Vercel.
5. Otwórz aplikację w trybie incognito albo CTRL+SHIFT+R.
