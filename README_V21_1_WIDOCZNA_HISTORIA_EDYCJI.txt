AGROMARBANKA panel v21.1 — widoczna historia edycji

Zmiany:
- przy operacjach/dokumentach dodany jest przycisk „Historia edycji”,
- po kliknięciu aplikacja próbuje pobrać historię z tabeli historia_edycji_operacji,
- widoczne są: kto edytował, kiedy edytował, opis zmiany, szczegóły przed/po,
- dodany plik SQL: SUPABASE_V21_1_HISTORIA_EDYCJI_WIDOK.sql.

Ważne:
1. Najpierw uruchom SQL w Supabase.
2. Wgraj paczkę do GitHub i zrób deploy.
3. Odśwież aplikację CTRL+SHIFT+R.
4. Jeżeli historia pokazuje „brak zapisanych edycji”, to znaczy, że tabela działa, ale aplikacja nie zapisała jeszcze żadnej edycji.

Uwaga techniczna:
Ta wersja pokazuje historię, jeśli wpisy są w tabeli historia_edycji_operacji. 
Żeby każda edycja automatycznie tworzyła wpis, moduł edycji dokumentu musi zapisywać przed_zmiana i po_zmianie przy zatwierdzeniu edycji.
