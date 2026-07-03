AGROMARBANKA panel v25 — obsługa dużej liczby operacji

Cel:
- naprawa problemu, że po około 1000 rekordach nowe operacje zapisują się w Supabase, ale nie są widoczne w aplikacji.

Co zmieniono:
1. Operacje są pobierane z Supabase stronami po 1000 rekordów.
2. Limit bezpieczeństwa ustawiono na 50 000 operacji.
3. Historia, Raporty i Ostatnie operacje powinny widzieć operacje powyżej ID 1000.
4. Usunięte operacje również są pobierane stronami.
5. Automatyczne odświeżanie zmieniono na ok. 60 sekund, żeby przy dużej bazie nie przeciążać aplikacji.

Bezpieczeństwo:
- Ta wersja NIE usuwa żadnych danych.
- Dane nadal są w Supabase.
- SQL jest opcjonalny i dodaje tylko indeksy.

Supabase:
Opcjonalnie, ale zalecane przed sezonem:
uruchom SUPABASE_V25_INDEKSY_OPERACJE.sql

Wgranie:
1. Rozpakuj ZIP.
2. Wgraj całą zawartość paczki do GitHub repo agromarbanka-panel.
3. Commit changes.
4. Poczekaj na deploy Vercel.
5. Otwórz aplikację i naciśnij Ctrl+F5.
6. Sprawdź, czy ostatnia operacja powyżej ID 1000 jest widoczna w Historii i Raportach.
