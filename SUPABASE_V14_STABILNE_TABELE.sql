create table if not exists kontrahenci (
  id bigint generated always as identity primary key,
  nazwa text not null,
  grupa text,
  limit_opakowan integer default 0,
  saldo_startowe integer default 0,
  aktywny boolean default true,
  ukryty boolean default false,
  created_at timestamptz default now()
);

create table if not exists opakowania (
  id bigint generated always as identity primary key,
  nazwa text not null,
  aktywne boolean default true,
  ukryte boolean default false,
  created_at timestamptz default now()
);

create table if not exists magazyny (
  id bigint generated always as identity primary key,
  nazwa text not null,
  aktywny boolean default true,
  ukryty boolean default false,
  created_at timestamptz default now()
);

create table if not exists uzytkownicy (
  id bigint generated always as identity primary key,
  imie text not null,
  telefon text not null unique,
  pin text not null,
  rola text not null default 'kierowca',
  magazyn text,
  aktywny boolean default true,
  ukryty boolean default false,
  created_at timestamptz default now()
);

create table if not exists operacje (
  id bigint generated always as identity primary key,
  kontrahent text not null,
  opakowanie text not null,
  magazyn text not null,
  typ text not null,
  ilosc integer not null,
  data_operacji date not null,
  podpis text,
  uzytkownik text,
  created_at timestamptz default now()
);

create table if not exists usuniete_operacje (
  id bigint generated always as identity primary key,
  operacja_id bigint,
  kontrahent text,
  opakowanie text,
  magazyn text,
  typ text,
  ilosc integer,
  data_operacji date,
  powod text,
  usuniete_przez text,
  usunieto_o timestamptz default now()
);

alter table kontrahenci enable row level security;
alter table opakowania enable row level security;
alter table magazyny enable row level security;
alter table uzytkownicy enable row level security;
alter table operacje enable row level security;
alter table usuniete_operacje enable row level security;

create policy if not exists "public all kontrahenci" on kontrahenci for all using (true) with check (true);
create policy if not exists "public all opakowania" on opakowania for all using (true) with check (true);
create policy if not exists "public all magazyny" on magazyny for all using (true) with check (true);
create policy if not exists "public all uzytkownicy" on uzytkownicy for all using (true) with check (true);
create policy if not exists "public all operacje" on operacje for all using (true) with check (true);
create policy if not exists "public all usuniete" on usuniete_operacje for all using (true) with check (true);

insert into magazyny (nazwa)
select 'Magazyn główny' where not exists (select 1 from magazyny where nazwa='Magazyn główny');
insert into magazyny (nazwa)
select 'Magazyn zapasowy' where not exists (select 1 from magazyny where nazwa='Magazyn zapasowy');

insert into opakowania (nazwa)
select 'Real' where not exists (select 1 from opakowania where nazwa='Real');
insert into opakowania (nazwa)
select 'M5' where not exists (select 1 from opakowania where nazwa='M5');
insert into opakowania (nazwa)
select 'Paleta' where not exists (select 1 from opakowania where nazwa='Paleta');
insert into opakowania (nazwa)
select 'Skrzynka 1/2' where not exists (select 1 from opakowania where nazwa='Skrzynka 1/2');

insert into uzytkownicy (imie, telefon, pin, rola, magazyn)
select 'Administrator', '500000000', '1111', 'admin', null
where not exists (select 1 from uzytkownicy where telefon='500000000');
