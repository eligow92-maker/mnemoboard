# Acceptance Test Results

Generated: 2026-10-04
Test Frameworks: Vitest 3 (integracyjne/jednostkowe, w kontenerze `app`), Playwright (E2E, z hosta względem serwera dev na :3000)

## Summary

| Zestaw | Passed | Failed | Skipped/Todo | Total |
|--------|--------|--------|--------------|-------|
| Vitest (unit + integration) | 244 | 0 | 0 | 244 |
| Playwright E2E (desktop + mobile) | 14 | 0 | 0 | 14 |
| **Razem** | **258** | **0** | **0** | **258** |

Pokrycie kodu (vitest --coverage): statements 95,61 %, branches 90,58 %, functions 91,79 %, lines 95,61 % (próg > 80 %).

## Scenariusze Gherkin → testy

81 scenariuszy w 9 plikach `.feature` (każdy `[US-NNN]`) odpowiada 81 AC z user-stories; każdy ma kanoniczny test.

| Plik | Historyjki | Pokryte |
|---|---|---|
| boards.feature | US-001, US-002 | ✓ |
| notes.feature | US-003..US-005 | ✓ |
| word-images.feature | US-006, US-007 | ✓ |
| arrangement.feature | US-008..US-010 | ✓ |
| review.feature | US-011..US-013 | ✓ |
| multi-device.feature | US-014 | ✓ |
| note-enrichment.feature | US-016..US-018 (+US-015) | ✓ |
| custom-pegs.feature | US-019, US-020 | ✓ |
| export-import.feature | US-021..US-023 | ✓ |

## Test Traceability (kanoniczne testy AC)

| Story | AC | Plik testu (kanoniczny test `AC-N: …`) | Wynik |
|---|---|---|---|
| US-001 | AC-1 | tests/integration/us-001-create-board.test.tsx | ✓ Pass |
| US-001 | AC-2 | tests/integration/us-001-create-board.test.tsx | ✓ Pass |
| US-001 | AC-3 | tests/integration/us-001-create-board.test.tsx | ✓ Pass |
| US-002 | AC-1 | tests/integration/us-002-manage-boards.test.tsx | ✓ Pass |
| US-002 | AC-2 | tests/integration/us-002-manage-boards.test.tsx | ✓ Pass |
| US-002 | AC-3 | tests/integration/us-002-manage-boards.test.tsx | ✓ Pass |
| US-003 | AC-1 | tests/integration/us-003-add-note.test.tsx | ✓ Pass |
| US-003 | AC-2 | tests/integration/us-003-add-note.test.tsx | ✓ Pass |
| US-003 | AC-3 | tests/integration/us-003-add-note.test.tsx | ✓ Pass |
| US-004 | AC-1 | tests/e2e/us-004-edit-note.spec.ts | ✓ Pass |
| US-004 | AC-2 | tests/integration/us-004-edit-note.test.tsx | ✓ Pass |
| US-004 | AC-3 | tests/integration/us-004-edit-note.test.tsx | ✓ Pass |
| US-005 | AC-1 | tests/integration/us-005-manual-words.test.tsx | ✓ Pass |
| US-005 | AC-2 | tests/integration/us-005-manual-words.test.tsx | ✓ Pass |
| US-006 | AC-1 | tests/integration/us-006-generate.test.tsx | ✓ Pass |
| US-006 | AC-2 | tests/integration/us-006-generate.test.tsx | ✓ Pass |
| US-006 | AC-3 | tests/integration/us-006-generate.test.tsx | ✓ Pass |
| US-006 | AC-4 | tests/integration/us-006-generate.test.tsx | ✓ Pass |
| US-007 | AC-1 | tests/integration/us-007-peg-words.test.tsx | ✓ Pass |
| US-007 | AC-2 | tests/integration/us-007-peg-words.test.tsx | ✓ Pass |
| US-007 | AC-3 | tests/integration/us-007-peg-words.test.tsx | ✓ Pass |
| US-007 | AC-4 | tests/integration/us-007-peg-words.test.tsx | ✓ Pass |
| US-008 | AC-1 | tests/integration/us-008-connections.test.tsx | ✓ Pass |
| US-008 | AC-2 | tests/integration/us-008-connections.test.tsx | ✓ Pass |
| US-008 | AC-3 | tests/integration/us-008-connections.test.tsx | ✓ Pass |
| US-009 | AC-1 | tests/integration/us-009-chain.test.tsx | ✓ Pass |
| US-009 | AC-2 | tests/integration/us-009-chain.test.tsx | ✓ Pass |
| US-009 | AC-3 | tests/integration/us-009-chain.test.tsx | ✓ Pass |
| US-010 | AC-1 | tests/integration/us-010-zones.test.tsx | ✓ Pass |
| US-010 | AC-2 | tests/integration/us-010-zones.test.tsx | ✓ Pass |
| US-010 | AC-3 | tests/integration/us-010-zones.test.tsx | ✓ Pass |
| US-010 | AC-4 | tests/integration/us-010-zones.test.tsx | ✓ Pass |
| US-011 | AC-1 | tests/integration/us-011-review.test.tsx | ✓ Pass |
| US-011 | AC-2 | tests/integration/us-011-review.test.tsx | ✓ Pass |
| US-011 | AC-3 | tests/integration/us-011-review.test.tsx | ✓ Pass |
| US-011 | AC-4 | tests/integration/us-011-review.test.tsx | ✓ Pass |
| US-012 | AC-1 | tests/integration/us-012-review-scope.test.tsx | ✓ Pass |
| US-012 | AC-2 | tests/integration/us-012-review-scope.test.tsx | ✓ Pass |
| US-012 | AC-3 | tests/integration/us-012-review-scope.test.tsx | ✓ Pass |
| US-012 | AC-4 | tests/integration/us-012-review-scope.test.tsx | ✓ Pass |
| US-013 | AC-1 | tests/integration/us-013-stats.test.tsx | ✓ Pass |
| US-013 | AC-2 | tests/integration/us-013-stats.test.tsx | ✓ Pass |
| US-013 | AC-3 | tests/integration/us-013-stats.test.tsx | ✓ Pass |
| US-014 | AC-1 | tests/e2e/us-014-mobile.spec.ts | ✓ Pass |
| US-014 | AC-2 | tests/e2e/us-014-mobile.spec.ts | ✓ Pass |
| US-014 | AC-3 | tests/e2e/us-014-mobile.spec.ts | ✓ Pass |
| US-015 | AC-1 | tests/integration/us-015-story.test.tsx | ✓ Pass |
| US-015 | AC-2 | tests/integration/us-015-story.test.tsx | ✓ Pass |
| US-015 | AC-3 | tests/integration/us-015-story.test.tsx | ✓ Pass |
| US-015 | AC-4 | tests/integration/us-015-story.test.tsx | ✓ Pass |
| US-016 | AC-1 | tests/integration/us-016-emoji.test.tsx | ✓ Pass |
| US-016 | AC-2 | tests/e2e/us-016-emoji.spec.ts | ✓ Pass |
| US-016 | AC-3 | tests/integration/us-016-emoji.test.tsx | ✓ Pass |
| US-016 | AC-4 | tests/integration/us-016-emoji.test.tsx | ✓ Pass |
| US-017 | AC-1 | tests/integration/us-017-colors.test.tsx | ✓ Pass |
| US-017 | AC-2 | tests/integration/us-017-colors.test.tsx | ✓ Pass |
| US-017 | AC-3 | tests/integration/us-017-colors.test.tsx | ✓ Pass |
| US-018 | AC-1 | tests/integration/us-018-review-colors.test.tsx | ✓ Pass |
| US-018 | AC-2 | tests/integration/us-018-review-colors.test.tsx | ✓ Pass |
| US-018 | AC-3 | tests/integration/us-018-review-colors.test.tsx | ✓ Pass |
| US-018 | AC-4 | tests/integration/us-018-review-colors.test.tsx | ✓ Pass |
| US-019 | AC-1 | tests/integration/us-019-custom-pegs.test.tsx | ✓ Pass |
| US-019 | AC-2 | tests/integration/us-019-custom-pegs.test.tsx | ✓ Pass |
| US-019 | AC-3 | tests/integration/us-019-custom-pegs.test.tsx | ✓ Pass |
| US-019 | AC-4 | tests/integration/us-019-custom-pegs.test.tsx | ✓ Pass |
| US-019 | AC-5 | tests/integration/us-019-custom-pegs.test.tsx | ✓ Pass |
| US-020 | AC-1 | tests/integration/us-020-generate-custom.test.tsx | ✓ Pass |
| US-020 | AC-2 | tests/integration/us-020-generate-custom.test.tsx | ✓ Pass |
| US-020 | AC-3 | tests/integration/us-020-generate-custom.test.tsx | ✓ Pass |
| US-020 | AC-4 | tests/integration/us-020-generate-custom.test.tsx | ✓ Pass |
| US-021 | AC-1 | tests/integration/us-021-export.test.tsx | ✓ Pass |
| US-021 | AC-2 | tests/integration/us-021-export.test.tsx | ✓ Pass |
| US-022 | AC-1 | tests/integration/us-022-import.test.tsx | ✓ Pass |
| US-022 | AC-2 | tests/integration/us-022-import.test.tsx | ✓ Pass |
| US-022 | AC-3 | tests/integration/us-022-import.test.tsx | ✓ Pass |
| US-022 | AC-4 | tests/integration/us-022-import.test.tsx | ✓ Pass |
| US-023 | AC-1 | tests/integration/us-023-backup.test.tsx | ✓ Pass |
| US-023 | AC-2 | tests/integration/us-023-backup.test.tsx | ✓ Pass |
| US-023 | AC-3 | tests/integration/us-023-backup.test.tsx | ✓ Pass |
| US-023 | AC-4 | tests/integration/us-023-backup.test.tsx | ✓ Pass |
| US-023 | AC-5 | tests/integration/us-023-backup.test.tsx | ✓ Pass |

## Failures

Brak. W trakcie weryfikacji wykryto test niestabilny: `tests/integration/us-005-manual-words.test.tsx` › „wyczyszczenie pola usuwa słowa-obrazy karteczki" (test techniczny, nie kanoniczny AC) padał pod `--coverage` przez brak `waitFor` na asercji UI. Naprawiono (asercja opakowana w `waitFor`); po poprawce 244/244 także z pokryciem.

## Result

**All acceptance tests passed: ✓**
