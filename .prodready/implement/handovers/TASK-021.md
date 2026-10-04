# TASK-021 Handoff

## Task
- Title: US-014 — Praca na telefonie
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: na 375 px wszystkie elementy powtórki mieszczą się bez przewijania w poziomie.
- AC-2: karteczka przeciągnięta palcem zmienia położenie.
- AC-3: karteczka dodana na jednym urządzeniu jest widoczna na drugim.

## Canonical Tests
- `AC-1: na ekranie o szerokości 375 px wszystkie elementy powtórki mieszczą się bez przewijania w poziomie` in `tests/e2e/us-014-mobile.spec.ts`
- `AC-2: karteczka przeciągnięta palcem na urządzeniu dotykowym zmienia położenie` in `tests/e2e/us-014-mobile.spec.ts`
- `AC-3: karteczka dodana na jednym urządzeniu jest widoczna po otwarciu planszy na drugim urządzeniu` in `tests/e2e/us-014-mobile.spec.ts`
- RED — stan faktyczny:
  - AC-1: pierwsza wersja testu przechodziła i nie wykrywała przepełnienia (w emulacji mobilnej `window.innerWidth` rośnie z treścią). Po uszczelnieniu (stałe 375 px, wszystkie elementy `main`) test był RED na ówczesnym kodzie (długie słowo w słowach-obrazach i długa nazwa pokoju wychodziły poza ekran), potem GREEN po poprawce układu.
  - AC-2 i AC-3: przechodziły od pierwszego uruchomienia, bo zachowanie dostarczyły TASK-004/007 (przeciąganie) i TASK-006 (serwer jako źródło prawdy). Klasycznego RED nie dało się uzyskać; czułość testów potwierdzono mutacją: `nodesDraggable={false}` → AC-2 pada (brak PATCH), `notes: []` w `getBoardDetail` → AC-3 pada. Mutacje wycofane.
- Testy techniczne: lista plansz, lista GSP i edytor mieszczą się na 375 px; elementy dotykowe edytora ≥ 44 px (RED → GREEN).

## Files Changed
- `playwright.config.ts` (`*mobile.spec.ts` tylko w profilu mobilnym), `tests/e2e/us-014-mobile.spec.ts`
- `src/components/review/review-screen.tsx`, `src/components/board/board-toolbar.tsx`, `src/components/app-shell.tsx`, `src/app/globals.css`, `next.config.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `npx playwright test` (z hosta; desktop + mobile) - PASS (6 testów)
- `docker compose exec -T app npx vitest run` - PASS (142 testy)
- `docker compose exec -T app npx tsc --noEmit`, `npm run lint`, `npx prettier --check src tests` - PASS
- Zrzuty ekranu 375×667: edytor, arkusz karteczki, powtórka, lista plansz — sprawdzone wzrokowo.

## Decisions
- Przeciąganie dotykiem testowane zdarzeniami `Input.dispatchTouchEvent` (CDP) w Chromium z `hasTouch`/`isMobile`. To emulacja — ręczny test na fizycznym telefonie z TASK-004 nadal nie został wykonany.
- Pasek narzędzi na telefonie: siatka 2×2 na dole ekranu; od `md` jeden wiersz nad planszą.
- Przyciski powiększania planszy powiększone do 44 px; logo jako cel 44 px; `devIndicators: false` (znacznik dev zasłaniał pasek narzędzi).
- W powtórce długie słowa i nazwa pokoju łamią się zamiast wychodzić poza ekran.

## Follow-ups or Blockers
- Środowisko: Docker Desktop (virtiofs) nie odświeża w kontenerze plików podmienianych przez zmianę nazwy (`sed -i`, `git checkout`, `git stash`). Pliki edytować w miejscu; po operacjach git na plikach źródłowych sprawdzić sumy w kontenerze lub zrestartować `app`.
- Uchwyty zmiany rozmiaru strefy mają 20 px (poniżej 44 px) — na telefonie trudniejsze do trafienia.

## Next Recommended Task
- TASK-022: Utwardzenie bezpieczeństwa.
