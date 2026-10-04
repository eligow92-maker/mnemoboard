# TASK-028 Handoff

## Task
- Title: US-018 — Filtr koloru w powtórce
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: powtórka z zaznaczonym tylko kolorem czerwonym pokazuje wyłącznie czerwone karteczki.
- AC-2: okno rozpoczęcia powtórki ma wszystkie kolory zaznaczone.
- AC-3: brak karteczek w wybranych kolorach → powtórka się nie rozpoczyna, komunikat "Brak karteczek w wybranych kolorach".
- AC-4: łańcuch A→B→C z A, C czerwonymi i B żółtą, filtr czerwony → kolejność A, C.

## Canonical Tests
- `AC-1…AC-4` in `tests/integration/us-018-review-colors.test.tsx`
- RED potwierdzony dla wszystkich (8/8 nieprzechodzących), potem GREEN.
- Testy techniczne: adres okna zawęża się do wybranych kolorów; brak zaznaczonego koloru blokuje "Rozpocznij"; API: nieznany kolor i pusta lista → 400, brak ciała → wszystkie kolory, brak kart w kolorach → 422 `NO_NOTES_IN_COLORS` bez sesji.

## Files Changed
- `src/lib/api.ts` (`bodyOptional` w `withApi`), `src/modules/review/{schema,service}.ts`, `src/modules/notes/colors.ts`, `src/app/api/boards/[boardId]/review-sessions/route.ts`, `src/app/boards/[id]/review/page.tsx`
- `src/components/board/{color-filter,review-start,board-editor-screen}.tsx`, `src/components/review/review-screen.tsx`
- `tests/integration/us-018-review-colors.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (174 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - 13 PASS, 1 FAIL (znany: `us-014-mobile` układ `/peg-words`, patrz TASK-027)

## Decisions
- Kolejność kart liczona dla wszystkich karteczek ze słowami-obrazami, filtr kolorów nakładany dopiero potem — inaczej łańcuch przerwany karteczką w innym kolorze rozpadałby się.
- `withApi` dostało `bodyOptional`: żądanie bez Content-Type przechodzi jako brak ciała; dotychczasowy klient (`POST` bez ciała) działa bez zmian.
- Przycisk "Rozpocznij powtórkę" w nagłówku edytora otwiera okno ze wszystkimi kolorami zaznaczonymi; "Rozpocznij" prowadzi do `/boards/{id}/review` (wszystkie kolory) albo `/boards/{id}/review?colors=red,blue`.
- Komunikat o braku kart w kolorach pokazuje strona powtórki (po przejściu z okna), nie samo okno.
- Wybór filtra nie jest zapamiętywany (założenie B-5).

## Follow-ups or Blockers
- Poprawka układu `/peg-words` na 375 px (plakietka "własne" zwęża pole) — w TASK-030.

## Next Recommended Task
- TASK-029: Dopasowanie własnych wpisów w generatorze (Sprint 6).
