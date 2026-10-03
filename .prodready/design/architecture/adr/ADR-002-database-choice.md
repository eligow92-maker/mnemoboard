# ADR-002: Database Choice

## Status
Accepted

## Date
2026-10-03

## Context
Dane są relacyjne (plansza → karteczki, strefy, połączenia, sesje → wyniki) z regułami integralności: kaskadowe usuwanie, jedno połączenie na parę karteczek, jeden następnik i poprzednik w łańcuchu. Skala jest minimalna (1 użytkownik), ale dane mają być wspólne dla dwóch urządzeń, a aplikacja ma później trafić na VPS i być może zyskać konta.

## Decision
We will use PostgreSQL 16 with Prisma 6 because:
- Schemat z fazy Define (`schema.sql`) używa indeksów częściowych i wyrażeniowych oraz typu enum — PostgreSQL obsługuje je natywnie, więc reguły łańcucha i unikalności egzekwuje baza.
- Ta sama baza sprawdzi się bez migracji danych po przeniesieniu na VPS i dodaniu kont.
- Prisma daje migracje, typowany klient i mechanizm seed dla listy 110 haseł GSP.

## Consequences

### Positive
- Integralność danych gwarantowana na poziomie bazy, nie tylko aplikacji.
- Identyczne środowisko lokalnie, w CI i na serwerze (kontener `postgres:16-alpine`).

### Negative
- Drugi kontener i wolumen do utrzymania; kopia zapasowa wymaga `pg_dump` zamiast skopiowania pliku.
- Indeksy częściowe i wyrażeniowe nie są wyrażalne w `schema.prisma` — trzeba je dodać ręcznie w SQL migracji.

### Risks
- Rozjazd między `schema.prisma` a ręcznie dopisanymi indeksami. Mitigation: indeksy w pierwszej migracji z komentarzem oraz test integracyjny dla każdej reguły (duplikat połączenia, drugi następnik).
- Utrata danych przy awarii dysku (brak kopii w MVP — ryzyko zaakceptowane w PRD). Mitigation: wolumen nazwany, a w Makefile cel `db-backup` wykonujący `pg_dump`.

## Alternatives Considered
1. SQLite (plik w wolumenie): Rejected because równoczesne zapisy z dwóch urządzeń i późniejsze konta na VPS wymagałyby migracji silnika, a oszczędność jednego kontenera jest niewielka.
2. Baza dokumentowa (MongoDB): Rejected because model jest silnie relacyjny, a reguły unikalności łańcucha trzeba by egzekwować wyłącznie w kodzie.
3. PostgreSQL bez ORM (czysty SQL): Rejected because ręczne migracje i mapowanie typów to dodatkowa praca bez korzyści przy tej skali; surowy SQL pozostaje dostępny przez Prisma tam, gdzie potrzeba.
