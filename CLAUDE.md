# CLAUDE.md

## Commandes

- `pnpm db:start` — Démarrer la base de données PostgreSQL locale (Docker)
- `pnpm dev` — Serveur de développement (Turbo)
- `pnpm test` — Migrations + vitest run
- `pnpm test:watch` — Tests en mode watch
- `pnpm test:coverage` — Tests avec couverture (seuil 90%)
- `pnpm typecheck` — Vérification TypeScript
- `pnpm lint:ts` — ESLint (max 0 warnings)
- `pnpm lint:css` — Stylelint
- `pnpm format` — Formatage Prettier
- `pnpm check` — Tous les contrôles qualité (dedupe, deadcode, typecheck, prisma format, format, lint, test:coverage)
- `pnpm deadcode` — Détection de code mort (Knip)
- `pnpm prisma:migrate` — Migrations Prisma
- `pnpm prisma:generate` — Regénérer le client Prisma après modification du schéma
- `pnpm storybook` — Lancer Storybook

## Architecture

Application Next.js 15 (App Router), séparation stricte en couches contrôlée par ESLint (`import/no-restricted-paths`).

### Couches

- **Domain** (`src/domain/`) — Objets métier (Entity, ValueObject, Uid). Constructeur privé, factory `create()`. Champs privés `#`. Immutable (`Object.freeze`). Aucune dépendance externe.
- **Use Cases** (`src/use-cases/`) — Commands (`CommandHandler<Command, Failure>`) et queries (`QueryHandler<Query, ReadModel>`). Les ports (interfaces `*Loader` pour lecture, `*Repository` pour écriture) sont définis dans les fichiers use-case. Ne dépend que du domain et shared.
- **Gateways** (`src/gateways/`) — Implémentent les interfaces des use cases. Accès Prisma via `readonly #dataResource = prisma.model_name`. Nommage : `Prisma<Entité>Loader` (lecture) / `Prisma<Entité>Repository` (écriture).
- **Presenters** (`src/presenters/`) — Fonctions pures transformant ReadModel → ViewModel. Reçoivent `now: Date` en paramètre. Ne connaissent que les use cases et shared.
- **Components** (`src/components/`) — React `'use client'`. Props typées avec `type` (pas `interface`). DSFR pour le design system.
- **App** (`src/app/`) — Controllers (pages async server-side). Server actions dans `src/app/api/actions/`.

### Controllers (pages)

Les pages instancient les dépendances directement (pas de DI container) :

```
async function Controller({ params }) {
  const { id } = await params          // Next.js 15 : params est une Promise
  const loader = new PrismaXxxLoader()
  const readModel = await new UseCase(loader).handle({ id })
  const viewModel = xxxPresenter(readModel, new Date())
  return <Component viewModel={viewModel} />
}
```

### Server actions, gateways, journalisation

- Pattern détaillé des server actions et **journalisation obligatoire de toute mutation** (`source.min__evenements`) : skill `server-action` (`.claude/skills/server-action/`).
- Conventions Prisma et gateways : skill `prisma-min`.
- Les appels Prisma se font dans les gateways (`src/gateways/Prisma*.ts`), jamais directement dans les server actions.

### Error handling

- Pas d'exceptions pour les erreurs métier — retour `Result<Failure, Success>` (union type)
- `Result<Failure, Success = 'OK'>` et `ResultAsync<Failure>` définis dans `src/use-cases/CommandHandler.ts` et `src/shared/lang.ts`
- Commands : retournent `'OK'` ou une string d'erreur métier typée
- Queries : retournent les données directement

## Conventions de code

### TypeScript
- Types tableau : `ReadonlyArray<T>` et `Array<T>` (jamais `T[]`, règle `@typescript-eslint/array-type`)
- `type` dans les composants (pas `interface`, règle `@typescript-eslint/consistent-type-definitions`)
- `Readonly<{...}>` partout pour les props, params, state
- Clés d'objets triées alphabétiquement (`sort-keys`)
- Champs privés avec `#` dans les classes
- Pas de semicolons (`@stylistic/semi: never`)
- Single quotes (`@stylistic/quotes: single`)
- Trailing commas en multiline
- Max 120 caractères par ligne
- Indentation : 2 espaces

### Imports
- Groupe 1 : builtin + external (alphabétique, case-insensitive)
- Ligne vide
- Groupe 2 : internal (`@/`), parent, sibling (alphabétique)

### Dates
- `new Date()` interdit hors `src/app/` (règle ESLint `no-restricted-syntax`)
- Injecter `date: Date` comme dépendance dans les use cases
- Helpers : `formaterEnDateFrancaise()`, `formatForInputDate()` dans `src/presenters/shared/date.ts`
- En test : constantes `epochTime`, `epochTimePlusOneDay` depuis `src/shared/testHelper.ts`

### Interdictions ESLint notables
- `window` / `document` interdit — utiliser l'API React
- `new Date()` sans argument interdit hors `src/app/`
- En test : `vi.mock()`, `toHaveTextContent`, `act()` interdits — voir skill `tests-min`

### Langue
- Français dans la logique métier, commentaires, messages d'erreur Zod

## Tests

Vitest + Testing Library, couverture 90 % minimum, pre-push hook `husky` exécutant `pnpm check`. Conventions détaillées (mocking, GIVEN/WHEN/THEN, factories, dates) : skill `tests-min`.

## Composants et UI

- **Le DSFR (`@gouvfr/dsfr`) est IMPÉRATIF pour TOUT aspect visuel, sans exception, avec sa structure HTML canonique complète. Jamais de valeurs en dur, jamais de CSS custom pour corriger un rendu.** Règles détaillées (DSFR, forms, `Select`/`SelectAsync`, Drawer/Modal, notifications, Storybook) : skill `dsfr-ui`.
- Exception : `src/components/coop/**` (code importé, hors périmètre DSFR)

## Skills projet

Règles ciblées dans `.claude/skills/`, chargées automatiquement selon les fichiers touchés : `server-action`, `dsfr-ui`, `tests-min`, `prisma-min`. Toute règle propre à un type de fichier va dans un skill, pas ici.

## Règles impératives

- **Ne JAMAIS modifier les fichiers de configuration** (eslint.config.js, tsconfig.json, prettier, stylelint, vitest.config.ts, next.config.ts, knip.json, etc.) sans demande explicite.
- **Ne pas contourner les règles de lint** en modifiant la config — adapter le code pour respecter les règles existantes.
- **Quand le format ou l'approche n'est pas clair, DEMANDER avant de faire.**
- **Ne pas extrapoler** une demande ponctuelle en règle générale.
- Faire ce qui est demandé, rien de plus, rien de moins.
- Les appels Prisma se font dans les gateways (`src/gateways/Prisma*.ts`), jamais directement dans les server actions.
- Ne JAMAIS créer de fichiers sauf si absolument nécessaire. Toujours préférer éditer un fichier existant.
- Ne JAMAIS créer de fichiers de documentation (*.md, README) sauf demande explicite.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->