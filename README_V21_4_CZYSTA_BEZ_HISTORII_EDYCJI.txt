AGROMARBANKA panel v21.4 — czysta wersja bez historii edycji

Cel:
- naprawa problemu, gdzie przy wyborze kontrahenta w operacji wyskakiwało puste okno,
- usunięcie automatycznej historii edycji z widoku operacji,
- przywrócenie normalnego działania formularzy.

Zostaje:
- import kontrahentów,
- raporty,
- wyszukiwarka kontrahenta w raportach,
- poprawki z wersji v20.9.

Nie uruchamiaj SQL dla historii edycji.
Tabeli historii w Supabase nie musisz usuwać — sama nie przeszkadza.

Najbezpieczniejsze wgranie:
1. W GitHub usuń stare pliki README/SQL od v21, v21.1, v21.2, v21.3.
2. Nadpisz foldery src, public oraz pliki index.html, package.json z tej paczki.
3. Commit changes.
4. Poczekaj na deploy Vercel.
5. Otwórz aplikację w trybie incognito lub CTRL+SHIFT+R.
