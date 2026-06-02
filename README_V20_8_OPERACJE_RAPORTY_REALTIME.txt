AGROMARBANKA panel v20.8 — operacje, edycja, raporty, realtime

Ta wersja zawiera też poprawkę v20.7, więc nie trzeba wgrywać v20.7 osobno.

Zmiany:
1. Operacje wielopozycyjne:
   - jeden kontrahent i magazyn,
   - kilka rodzajów opakowań w jednym dokumencie,
   - przycisk „+ Dodaj kolejne opakowanie”.

2. Edycja operacji:
   - przy pojedynczej pozycji admin widzi przycisk „Edytuj”,
   - można poprawić kontrahenta, opakowanie, ilość, magazyn i datę,
   - raporty i salda liczone z operacji przeliczają się po zmianie.

3. Blokada duplikatów użytkowników:
   - aplikacja nie pozwoli dodać użytkownika z takim samym telefonem albo imieniem.

4. Odświeżanie na bieżąco:
   - po zmianie operacji przez innego użytkownika lista odświeża się automatycznie dzięki Supabase Realtime.

5. Raporty:
   - wyszukiwarka kontrahenta z v20.7 zostaje zachowana.

Supabase:
- Jeśli chcesz, aby wielopozycyjne dokumenty były trwale grupowane jako jeden dokument, uruchom:
  SUPABASE_V20_8_DOKUMENTY_WIELOPOZYCYJNE.sql
- Ten SQL nie usuwa danych.

Wgranie:
1. Rozpakuj paczkę.
2. Wgraj zawartość do repo GitHub aplikacji agromarbanka-panel.
3. Commit changes.
4. Poczekaj na deploy Vercel.
5. Odśwież aplikację CTRL+F5.
6. Opcjonalnie uruchom SQL v20.8.
