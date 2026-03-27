# ADR-001 : Mise en place d'une CI GitHub Actions

**Date** : 2026-03-25  
**Statut** : En discussion  
**Décideurs** : Marc Gavanier, Philippe Martinez, Adrien Turpin

## Contexte

Le projet ne disposait d'aucun pipeline CI/CD sur GitHub Actions. La seule barrière de qualité était un hook Husky `pre-push` exécutant `yarn check` sur l'intégralité du codebase (lint, typecheck, format, tests, deadcode). Ce design posait deux problèmes majeurs :

1. **Expérience de développement dégradée** : le hook bloquait le push pendant plusieurs minutes pour vérifier des fichiers non modifiés par le développeur. Un simple push de documentation pouvait déclencher des centaines d'erreurs pré-existantes sur des fichiers jamais touchés. Cette friction extrême rendait la contribution au projet pénible et décourageante.
2. **Fausse sécurité** : le mécanisme était contournable via `git push --no-verify`, ce qui a permis à des violations de s'accumuler silencieusement sur `main`. Le build de production (Next.js) ignorait explicitement les erreurs ESLint (`ignoreDuringBuilds: true`) et TypeScript (`ignoreBuildErrors: true`), créant une contradiction entre les règles locales strictes et l'absence de vérification au déploiement.

## Décision

Mettre en place deux workflows GitHub Actions déclenchés sur `push` vers des branches nommées selon les Conventional Commits :

- **`validate-feature-branch.yml`** (branches `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `ci/*`, `perf/*`, `revert/*`, `test/*`) : 5 jobs parallèles :
  - **code-check** : ESLint, Stylelint, Prettier
  - **type-check** : TypeScript
  - **quality-check** : dedupe, dead code (Knip), Prisma format, Shai-Hulud (supply chain)
  - **build** : `next build` avec cache `.next/cache` et désactivation de la télémétrie Next.js
  - **test** : migrations Prisma + tests avec couverture (PostgreSQL PostGIS en service container)
- **`validate-docs-style.yml`** (branches `docs/*`, `style/*`) : 1 job (code-check + Shai-Hulud)

Une action composite `.github/actions/setup` centralise la configuration (pnpm via `pnpm/action-setup@v5`, Node.js via `actions/setup-node@v6`, install, Prisma generate).

### Adaptations nécessaires pour la CI

- **`next-env.d.ts`** : retiré du `.gitignore` et commité. Ce fichier fournit les déclarations de types pour les imports d'images (`.png`, `.svg`) et n'est généré que par `next build` / `next dev`. Sans lui, le typecheck échoue en CI.
- **`depcheck`** : retiré de la CI après évaluation. L'outil produit des faux positifs sur les dépendances utilisées dans les fichiers de config (ESLint, Storybook, Stryker, Stylelint...). Knip couvre déjà la détection de dead code de manière plus fiable.

## Alternatives envisagées

- **Trigger `pull_request`** au lieu de `push` : envisagé pour les required checks, mais empêche de différencier les jobs par préfixe de branche source. Le choix `push` par préfixe permet d'adapter les checks au type de changement.
- **Workflow unique pour tous les préfixes** : rejeté car exécute des jobs inutiles (tests, build) pour des branches `docs/*`.

## Conséquences

- La qualité est vérifiée côté serveur, impossible à contourner
- Le hook local devient un confort, pas la seule barrière
- Les règles de protection de branche GitHub peuvent être configurées pour bloquer le merge si les jobs échouent
