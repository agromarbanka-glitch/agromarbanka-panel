V20.3 POPRAWKI

Zmiany:
1. Aplikacja zapamiętuje zalogowanego użytkownika.
2. Wylogowanie następuje dopiero po kliknięciu „Wyloguj”.
3. Po zapisaniu operacji czyszczą się pola:
   - kontrahent,
   - opakowanie,
   - podpis,
   - ilość wraca do 1.
4. Poprawiono zapis usuniętej operacji:
   - najpierw zapisuje do tabeli usuniete_operacje,
   - dopiero potem usuwa z historii,
   - jeśli zapis do rejestru się nie uda, operacja nie zostanie usunięta.
5. Dodano plik SQL:
   SUPABASE_V20_3_USUNIETE_OPERACJE.sql

Wgraj na GitHub jak poprzednie wersje.
APK nie trzeba budować od nowa, jeśli link Vercel pozostaje ten sam.

WAŻNE:
W Supabase uruchom SQL z pliku:
SUPABASE_V20_3_USUNIETE_OPERACJE.sql
