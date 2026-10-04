# Performance Report

Generated: 2026-10-04

Środowisko pomiaru: serwer **dev** (`next dev`, Docker, PostgreSQL w osobnym kontenerze) na laptopie deweloperskim; pomiary z hosta, 100 sekwencyjnych żądań na endpoint. Tryb dev jest wolniejszy niż produkcyjny, więc wartości są zachowawcze.

## Core Web Vitals (Lighthouse 13.5.0)

Pomiar na **buildzie produkcyjnym** (obraz `runner`, `NODE_ENV=production`, port 3100, ta baza co dev), profil Lighthouse domyślny: mobile (emulacja telefonu, throttling 4× CPU i wolne 4G), Chromium z Playwrighta. **Mediana z 5 uruchomień** na stronę, wykonanych po poprawkach favicon i kontrastu.

| Strona | Performance | LCP (zakres) | CLS | TBT (zamiennik FID) |
|---|---|---|---|---|
| / (lista plansz) | 98 | 2.1 s (2.1–2.2) | 0.005 (0–0.061) | 51 ms |
| /boards/{id} (edytor) | 97 | **2.5 s** (2.4–2.6) | 0 | 75 ms |
| /peg-words | 100 | 1.7 s (1.7–1.9) | 0 | 31 ms |

| Metryka | Wynik | Target | Status |
|---|---|---|---|
| LCP | 1.7–2.1 s (lista, GSP); **2.5 s mediana w edytorze** | < 2.5 s | ✓ lista i GSP; ⚠ edytor na progu (4 z 5 przebiegów ≥ 2.5 s) |
| CLS | 0–0.005 (pojedynczy przebieg 0.061 na /) | < 0.1 | ✓ Pass |
| TBT (FID niemierzalny w labie) | 31–75 ms | FID < 100 ms | ✓ Pass |
| Performance Score | 97–100 | > 90 | ✓ Pass |

Accessibility 100 / 100 / 100, Best Practices 100 / 100 / 100 (po poprawkach: dodano `favicon.ico`, kolor `secondary` zmieniono z #C2703D na #A85A2B, kontrast 5,05:1).

Uwaga o metodzie: profil mobilny z throttlingiem 4× CPU jest ostrzejszy niż realne urządzenie; poprzedni pojedynczy pomiar edytora (2,4 s) i ten (2,5 s) mieszczą się w szumie. Zasadniczo LCP edytora jest **na granicy** celu, nie z zapasem.

Test E2E `performance.spec.ts`: otwarcie planszy z 200 karteczkami < 2 s, renderowane tylko widoczne karteczki: ✓. Układ 375 px bez przewijania poziomego: ✓.

## API Response Times

| Endpoint | p50 | p95 | p99 | Status |
|----------|-----|-----|-----|--------|
| GET /api/health | 13.1 ms | 22.9 ms | 27.4 ms | ✓ |
| GET /api/boards | 14.3 ms | 21.1 ms | 23.7 ms | ✓ |
| GET /api/peg-words | 13.8 ms | 21.2 ms | 26.2 ms | ✓ |
| GET /api/stats | 12.6 ms | 21.4 ms | 26.6 ms | ✓ |

Test integracyjny `performance.test.ts` (AC-1 TASK-037): GET /api/boards/{id} dla planszy z 200 karteczkami, 20 strefami i 200 połączeniami < 500 ms: ✓.

## Database

| Check | Status |
|-------|--------|
| Indeksy na kluczach obcych i filtrach (note.boardId, note.zoneId, zone.boardId, connection.boardId, review_session) | ✓ |
| N+1 | ✓ Nie wykryto (planszę ładuje pojedyncze zapytanie z relacjami; test wydajności na 200/200/20) |
| Czasy zapytań < 100 ms | ✓ (całe odpowiedzi API p99 < 30 ms) |

## Bundle Analysis (build produkcyjny, `docker build --target runner`)

| Trasa | First Load JS | Target | Status |
|---|---|---|---|
| / | 125 kB | < 200 kB | ✓ |
| /peg-words | 120 kB | < 200 kB | ✓ |
| /boards/[id] (edytor, React Flow) | 186 kB | < 200 kB | ✓ (najwyższa, margines 14 kB) |
| /boards/[id]/review | 109 kB | < 200 kB | ✓ |
| Współdzielone | 103 kB | - | - |

## Optimization Recommendations

- Edytor planszy ma LCP ≈ 2,5 s (na progu): rozważyć dynamiczny import ciężkich części React Flow (`unused-javascript` ocena 0,5) i mniejszy First Load JS (186 kB).
- Edytor planszy ma 14 kB zapasu do budżetu; nowe zależności w edytorze wymagają ponownego pomiaru.

## Accepted Deviation

| Metryka | Wynik | Target | Decyzja |
|---|---|---|---|
| LCP edytora planszy (/boards/{id}) | mediana 2,5 s (2,4–2,6 s, 5 przebiegów) | < 2,5 s | **Zaakceptowane przez właściciela (2026-10-04)** |

Uzasadnienie: aplikacja jednoosobowa, używana w sieci lokalnej (ADR-003), więc realne opóźnienie sieci jest mniejsze niż w profilu Lighthouse (wolne 4G, 4× throttling CPU). Pozostałe metryki edytora mają zapas (CLS 0, TBT 75 ms, Performance 97), a E2E potwierdza otwarcie planszy z 200 karteczkami < 2 s.

Warunki i dalsze kroki: nie dodawać ciężkich zależności do edytora bez ponownego pomiaru (First Load JS 186 kB, limit 200 kB); ewentualna optymalizacja (dynamiczny import części React Flow, `unused-javascript` 0,5) jako zadanie opcjonalne po wdrożeniu.

## Result

**Status: PASSED** (wszystkie cele spełnione; LCP edytora 2,5 s zaakceptowane jako odstępstwo, zob. Accepted Deviation)
