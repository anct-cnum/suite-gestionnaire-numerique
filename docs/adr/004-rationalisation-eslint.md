# ADR-004 : Rationalisation de la configuration ESLint

**Date** : 2026-03-25
**Statut** : Accepté
**Décideurs** : Marc Gavanier

## Contexte

La configuration ESLint utilisait les presets les plus agressifs possibles :

```js
eslint.configs.all // TOUTES les règles ESLint
tseslint.configs.all // TOUTES les règles TypeScript-ESLint
react.configs.flat.all // TOUTES les règles React
```

Combiné avec `eslint-plugin-only-warn` (qui convertit les erreurs en warnings) et `--max-warnings=0` (qui échoue au moindre warning), cette configuration activait toutes les règles existantes et les rendait bloquantes. Les mainteneurs d'ESLint [déconseillent explicitement `eslint:all` en production](https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations).

En pratique, le cache ESLint (`node_modules/.cache/eslint`) masquait **3005 warnings** sur des fichiers non modifiés. La suppression du cache (lors de la migration pnpm) a révélé l'ampleur réelle du problème.

## Décision

### Presets rationalisés

```js
eslint.configs.recommended // règles recommandées par les mainteneurs
tseslint.configs.strictTypeChecked // strict + vérification de types (plus strict que recommended, moins que all)
react.configs.flat.recommended // règles recommandées React
```

### Changements associés

- **Retrait de `eslint-plugin-only-warn`** : inutile avec `recommended` (les règles ont des niveaux de sévérité cohérents)
- **Installation de `eslint-import-resolver-typescript`** : était une phantom dependency (disponible par hoisting Yarn, absente avec pnpm)
- **Configuration du resolver avec `symlinks: false`** : nécessaire pour que `import/no-restricted-paths` fonctionne avec la structure symlink de pnpm (sans ça, les patterns `except` comme `@prisma/client` ne matchent pas le chemin réel `.pnpm/...`)
- **Désactivation de `import/namespace`** : produit des faux positifs sur `@sentry/nextjs` (re-exports non résolus)
- **Configuration de `restrict-template-expressions`** : autorise `number`, `boolean` et `nullish` dans les template literals (149 faux positifs éliminés)

### Séparation des responsabilités ESLint / Prettier

Le projet utilisait `@stylistic/eslint-plugin` pour le formatting des fichiers TS/TSX en parallèle de Prettier, avec des règles contradictoires (`printWidth` : 120 dans ESLint vs 100 dans Prettier). Les deux outils se battaient lors du pre-commit (`eslint --fix` puis `prettier --write`).

- **Retrait de `@stylistic/eslint-plugin`** et de toutes ses règles de formatting
- **Installation de `eslint-config-prettier`** en dernière position de la config pour désactiver toute règle ESLint résiduelle qui chevaucherait Prettier
- **Alignement de `printWidth` à 120** dans `.prettierrc` (valeur historique du projet)
- **Inclusion des fichiers JS/TS dans les scripts `format`** (étaient exclus car `@stylistic` s'en occupait)
- ESLint se concentre désormais exclusivement sur la **qualité du code** (imports, architecture, types, accessibilité)
- Prettier gère exclusivement le **formatting** (indentation, quotes, semicolons, line length)

### Corrections de code

- **`GestionMembres.tsx`** : remplacement de l'API Iterator Helpers (`.values().filter().toArray()`) par les méthodes Array standard (`.filter()`), typage explicite de `statutInitial` comme `StatutSelectionnable`
- **108 fichiers** : autofix ESLint (directives `eslint-disable` devenues inutiles, type arguments redondants)
- **`FormulaireAction.tsx`** : remplacement de `<label>` orphelins (sans contrôle associé) par `<p>` pour corriger des erreurs d'accessibilité (`jsx-a11y/label-has-associated-control`)
- **`CarteFranceAvecInsets.tsx`** : suppression d'un ternaire avec branches identiques (code mort détecté par `sonarjs/no-all-duplicated-branches`)

## Alternatives envisagées

- **Migrer directement vers Biome** : envisagé pour un second temps (ADR à venir). Biome remplacerait ESLint + Prettier mais ne couvre pas les règles d'architecture (`import/no-restricted-paths`). Pour compléter Biome sur cette partie, on envisage d'utiliser dependency-cruiser + folderslint, comme c'est le cas sur la cartographie
- **Garder `eslint:all` en corrigeant les 3005 warnings** : irréaliste et contre-productif — la majorité des règles de `all` ne sont pas pertinentes pour ce projet

## Conséquences

- **3005 warnings → 0** tout en conservant des règles strictes et pertinentes
- Le cache ESLint n'est plus nécessaire pour masquer des problèmes — la configuration reflète l'état réel du code
- La CI peut exécuter `eslint --max-warnings=0` sans cache, avec un résultat fiable
- Les règles d'architecture (Clean Architecture via `import/no-restricted-paths`) sont préservées et fonctionnelles avec pnpm
- Plus de conflit entre ESLint et Prettier : chaque outil a un périmètre exclusif
- Prépare le terrain pour une migration future vers Biome (qui unifie linting et formatting)
