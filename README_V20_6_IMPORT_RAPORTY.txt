AGROMARBANKA v20.6 — poprawka importu i raportów

Zmiany:
1. Import kontrahentów obsługuje CSV ze średnikiem i przecinkiem oraz XLS/XLSX.
2. Import nie powinien już odrzucać pliku tylko dlatego, że baza nie ma kolumn telefon/miasto/nip — ma fallback do podstawowych kolumn.
3. W raportach dodano podgląd raportu. Najpierw wybierasz zakres dat, kontrahenta i rodzaj skrzynki, potem klikasz „Pokaż raport”.
4. W podglądzie raportu są przyciski „Drukuj” i „Pobierz Excel”.
5. Podsumowanie pokazuje: wydano, zwrócono, saldo, liczba operacji oraz rozbicie wg rodzaju skrzynki.

Instrukcja:
1. Wgraj całą paczkę do GitHub przez nadpisanie plików.
2. Commit changes.
3. Poczekaj na deploy Vercel.
4. Opcjonalnie w Supabase uruchom plik SUPABASE_V20_6_IMPORT_KONTRAHENCI_KOLUMNY.sql, jeśli chcesz zapisywać telefon, miasto i NIP.
