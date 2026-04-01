# ADR-002 : lint-staged et hooks pre-commit avec autofix

**Date** : 2026-03-25  
**Statut** : En discussion  
**Décideurs** : Marc Gavanier, Philippe Martinez, Adrien Turpin

## Contexte

Le hook Husky `pre-push` exécutait `yarn check` sur l'intégralité du codebase (lint, typecheck, format, tests, deadcode). Un push de README pouvait déclencher des centaines d'erreurs sur des fichiers non modifiés. L'absence de `lint-staged` signifiait que chaque développeur subissait le coût de vérification de tout le projet à chaque push.

## Décision

- **Installer `lint-staged`** avec autofix (`--fix`, `--write`) en hook `pre-commit` pour vérifier uniquement les fichiers stagés
- **Supprimer le hook `pre-push`** : le typecheck est déjà couvert par la CI (ADR-001) et par le build Next.js (`ignoreBuildErrors: false`), le conserver en pre-push ajoutait de la friction sans valeur supplémentaire
- La CI (ADR-001) est le vrai garde-fou pour les vérifications exhaustives

### Configuration lint-staged

```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.{md,json,xml,html,yml,yaml}": ["prettier --write"],
  "pnpm-lock.yaml": ["pnpm dedupe"]
}
```

- ESLint est limité à `src/` (cohérent avec la config ESLint du projet et le scope du tsconfig)
- Le dedupe automatique sur `pnpm-lock.yaml` garantit que le lockfile est toujours optimisé, évitant les échecs du check `pnpm dedupe --check` en CI

## Alternatives envisagées

- **Garder `yarn check` en pre-push** : rejeté car trop lent et vérifie des fichiers non modifiés
- **Garder un typecheck en pre-push** : envisagé initialement, mais redondant avec la CI et le build — retiré pour fluidifier l'expérience

## Conséquences

- Feedback immédiat au commit (pas au push)
- Autofix transparent : le développeur n'est pas bloqué par des erreurs de formatting
- Seules les erreurs non auto-fixables bloquent le commit
- Aucune friction au push — la CI gère tout
