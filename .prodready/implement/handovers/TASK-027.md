# TASK-027 Handoff

## Task
- Title: US-017 — Kolory karteczek
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: nowa karteczka ma kolor żółty.
- AC-2: wybór koloru pokazuje dokładnie 5 kolorów (żółty, czerwony, pomarańczowy, zielony, niebieski).
- AC-3: zmiana żółtej karteczki na czerwoną jest widoczna po odświeżeniu strony.

## Canonical Tests
- `AC-1…AC-3` in `tests/integration/us-017-colors.test.tsx`
- RED potwierdzony dla wszystkich (5/5 nieprzechodzących), potem GREEN.
- Testy techniczne: nieznany kolor → 400; PATCH samego koloru nie zmienia innych pól.

## Files Changed
- `src/modules/notes/{colors,schema,service}.ts` (nowy `colors.ts`), `src/modules/review/service.ts`, `src/lib/api-types.ts`, `src/app/globals.css`
- `src/components/board/{color-picker,note-colors,note-editor,note-node,board-canvas,board-editor-screen}.tsx`, `src/components/review/review-screen.tsx`
- `tests/integration/us-017-colors.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (166 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - 13 PASS, 1 FAIL (patrz niżej)

## Decisions
- Edytor istniejącej karteczki zapisuje kolor od razu po kliknięciu próbki (PATCH `color`), nowa karteczka przekazuje kolor z formularza; oba warianty zgodne z `components.md`.
- Zaznaczona karteczka zachowuje swój kolor i dostaje obrys `primary` 2 px (zamiast dotychczasowego żółtego tła `note-selected`, które nie pasowało do pięciu kolorów).
- Karta powtórki ma tło i obramowanie w kolorze karteczki; `ReviewCard` zwraca `color`.
- Kolor jest oznaczeniem wizualnym; próbki mają `aria-label` z polską nazwą.

## Follow-ups or Blockers
- E2E `us-014-mobile › lista plansz, lista GSP i edytor planszy mieszczą się na 375 px` nie przechodzi przy zmienionych słowach GSP w bazie dev: plakietka „własne" zwęża pola do 42 px na stronie `/peg-words`. Niezwiązane z kolorami (ta strona nie była zmieniana); do poprawienia w TASK-030, który dotyka tej strony.

## Next Recommended Task
- TASK-028: US-018 — Filtr koloru w powtórce.
