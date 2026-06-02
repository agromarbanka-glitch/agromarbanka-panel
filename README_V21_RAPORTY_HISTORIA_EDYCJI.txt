AGROMARBANKA panel v21 — raporty i historia edycji

Zmiany:
1. Poprawiona wyszukiwarka kontrahenta w raportach:
   - zostaje tylko jedno pole,
   - wpisujesz nazwę,
   - pojawia się lista podpowiedzi,
   - klikasz kontrahenta.

2. Dodany plik SQL pod historię edycji:
   SUPABASE_V21_HISTORIA_EDYCJI_DOKUMENTOW.sql

Po uruchomieniu SQL powstaje tabela:
historia_edycji_operacji

Będzie można zapisywać:
- kto edytował dokument,
- kiedy edytował,
- co było przed zmianą,
- co jest po zmianie,
- opis zmiany.

Ważne:
Sama tabela SQL przygotowuje bazę. Żeby w aplikacji widzieć historię przy dokumencie, kod edycji dokumentu musi zapisywać wpis do tej tabeli podczas każdej edycji.
