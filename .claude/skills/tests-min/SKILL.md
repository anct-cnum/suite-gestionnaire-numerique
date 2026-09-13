---
name: tests-min
description: Conventions de tests de min — Vitest, Testing Library, mocking par vi.spyOn, pattern GIVEN/WHEN/THEN, couverture 90 %, interdits ESLint en test. Use when creating, modifying, or debugging a *.test.ts or *.test.tsx file, or when working on test coverage.
user-invocable: false
---

# Tests

- Vitest + Testing Library, environnement jsdom pour les composants
- Couverture : 90% minimum (branches, functions, lines, statements)
- Exécution shuffled pour vérifier l'isolation
- Pattern AAA : commentaires `// GIVEN`, `// WHEN`, `// THEN`
- `vi.spyOn(module, 'method').mockResolvedValueOnce(...)` pour le mocking
- `it.each([...])` avec `$intention` pour les tests paramétrés
- Factories de test data : `createDefaultXxxViewModel()` dans `src/stories/`
- Constantes de date : `epochTime`, `epochTimePlusOneDay` depuis `src/shared/testHelper.ts` (jamais `new Date()`)
- Pre-push hook (`husky`) : exécute `pnpm check` complet

## Interdictions ESLint en test

- `vi.mock()` interdit — utiliser `vi.spyOn()` avec `mockResolvedValueOnce()`
- `toHaveTextContent` interdit — utiliser `expect(el.textContent).toBe('...')`
- `act()` interdit — utiliser `waitFor()` ou `findByXXX()`

## Selects en test

- `await userEvent.click(screen.getByRole('combobox', { name: 'X' }))` puis `await userEvent.click(await screen.findByRole('option', { name: 'Y' }))` ; un select désactivé perd le rôle combobox (utiliser `getByLabelText`)
