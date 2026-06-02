AGROMARBANKA panel v21.5 — awaryjna czysta stabilna wersja

Cel:
- usunięcie pustego okna przy wpisywaniu kontrahenta w Operacji,
- usunięcie nakładek wyszukiwarki/podpowiedzi, które działały za szeroko,
- usunięcie historii edycji z widoku,
- powrót do stabilnej wersji bazowej v20.6.

Zostaje:
- poprawiony import kontrahentów,
- raporty z podglądem,
- drukowanie i Excel z raportu.

Wyłączone tymczasowo:
- wyszukiwarka z podpowiedziami w raportach,
- historia edycji.

Co zrobić:
1. W GitHub usuń stare pliki README_V20_7, README_V20_8, README_V20_9, README_V21* oraz SQL V21*.
2. Wgraj zawartość tej paczki v21.5.
3. Commit changes.
4. Poczekaj na deploy Vercel.
5. Otwórz aplikację w trybie incognito.
6. Dodatkowo możesz wyczyścić cache strony.

Jeśli problem nadal wystąpi po v21.5, to znaczy, że przeglądarka trzyma starą wersję aplikacji w cache/PWA.
