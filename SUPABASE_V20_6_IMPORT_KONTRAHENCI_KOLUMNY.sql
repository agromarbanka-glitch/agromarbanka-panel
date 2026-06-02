-- AGROMARBANKA v20.6 — opcjonalne kolumny dla importu kontrahentów
alter table kontrahenci add column if not exists telefon text;
alter table kontrahenci add column if not exists miasto text;
alter table kontrahenci add column if not exists nip text;
