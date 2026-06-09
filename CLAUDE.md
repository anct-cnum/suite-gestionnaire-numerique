# CLAUDE.md

## Commandes

> ⚠️ Le gestionnaire de paquets est **pnpm** (`packageManager: pnpm@10.12.1`, `pnpm-lock.yaml`),
> imposé par corepack — `yarn` est refusé. Toujours utiliser `pnpm <script>`.

- `pnpm install` — Installer les dépendances (le `postinstall` n'exécute PAS `prisma:generate`)
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
- `pnpm prisma:generate` — Regénérer le client Prisma. **Indispensable après `pnpm install`**
  (le client n'est pas généré par le postinstall) et après toute modification de `prisma/schema.prisma`.
  Sans lui, l'app ne démarre pas (`next dev` plante : import du client Prisma manquant).
- `pnpm storybook` — Lancer Storybook

### Travailler dans un git worktree

Les `git worktree` ne partagent pas `node_modules` (ignoré par git). Dans un nouveau worktree :

```bash
git worktree add -b <n°issue>-<desc> ../min-<desc> main
cd ../min-<desc>
pnpm install            # vrai install — ne PAS symlinker node_modules vers le checkout principal
                        # (Turbopack ne résout plus Next.js, et `pnpm install` proposerait
                        #  d'effacer le node_modules du repo principal)
pnpm prisma:generate    # le client Prisma n'est pas généré par le postinstall
cp ../min/.env.local .  # variables d'env locales (non suivies par git)
pnpm dev
```

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

### Server actions

Pattern strict dans `src/app/api/actions/` :
- `'use server'` en haut du fichier
- Validation Zod avant toute logique
- Appel au gateway/repository (jamais Prisma directement)
- `revalidatePath(path)` après mutation
- Retour : `Promise<ReadonlyArray<string>>` (messages d'erreur Zod ou `['OK']`)
- Pour les commands complexes : `ResultAsync<ReadonlyArray<string>>`
- `type ActionParams = Readonly<{...}>` et `const validator = z.object({...})` en bas du fichier

### Gateways

- `readonly #dataResource = prisma.model_name` pour le client Prisma
- Les méthodes de transformation internes sont privées (`#`)
- `camelcase: off` automatique pour les fichiers `**/gateways/**/Prisma*.ts`

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
- `vi.mock()` interdit — utiliser `vi.spyOn()` avec `mockResolvedValueOnce()`
- `toHaveTextContent` interdit — utiliser `expect(el.textContent).toBe('...')`
- `act()` interdit — utiliser `waitFor()` ou `findByXXX()`
- `new Date()` sans argument interdit hors `src/app/`

### Langue
- Français dans la logique métier, commentaires, messages d'erreur Zod

## Tests

- Vitest + Testing Library, environnement jsdom pour les composants
- Couverture : 90% minimum (branches, functions, lines, statements)
- Exécution shuffled pour vérifier l'isolation
- Pattern AAA : commentaires `// GIVEN`, `// WHEN`, `// THEN`
- `vi.spyOn(module, 'method').mockResolvedValueOnce(...)` pour le mocking
- `it.each([...])` avec `$intention` pour les tests paramétrés
- Factories de test data : `createDefaultXxxViewModel()` dans `src/stories/`
- Constantes de date : `epochTime`, `epochTimePlusOneDay` (jamais `new Date()`)
- Pre-push hook (`husky`) : exécute `pnpm check` complet

## Base de données

- PostgreSQL, multi-schéma : `admin`, `main`, `min`, `reference`
- Prisma ORM avec `multiSchema`, `views`, `prisma-json-types-generator`
- Nommage modèles Prisma : `XxxRecord` mappé en snake_case (`@@map("xxx")`, `@@schema("xxx")`)
- Champs JSON typés via commentaires JSDoc : `/// [TypeName]`
- Relations avec `@relation(fields: [...], references: [...])`
- `@db.Citext` pour le texte case-insensitive

## Composants et UI

### Forms
- Formulaires non contrôlés avec `FormEvent` et `FormData`
- `useId()` pour les associations label/input
- Patterns de validation : `pattern={emailPattern.source}` depuis `src/shared/patterns.ts`
- Validation serveur via Zod dans les server actions

### Drawer / Modal
- `Modal` (`src/components/shared/Modal/`) et `Drawer` (`src/components/shared/Drawer/`) basés sur `<dialog>` et classes DSFR (`fr-modal`)
- Attributs aria obligatoires : `aria-labelledby={labelId}` sur le `<dialog>`, `aria-controls={id}` sur le bouton fermer, `aria-modal="true"` sur Modal
- Props `id` et `labelId` pour lier le dialog à son titre
- État ouvert/fermé géré par `useState` dans le parent
- Animation CSS slide-in/out pour le Drawer

### Notifications
- react-toastify stylé avec les variables CSS DSFR

### Storybook
- Meta avec `title: 'Components/Feature/NomComposant'`
- Import depuis `@storybook/nextjs-vite`
- Args depuis les factories de test data
- Variantes nommées en PascalCase : `Default`, `SansInformations`, `PlusieursContacts`

## Règles impératives

- **Ne JAMAIS modifier les fichiers de configuration** (eslint.config.js, tsconfig.json, prettier, stylelint, vitest.config.ts, next.config.ts, knip.json, etc.) sans demande explicite.
- **Ne pas contourner les règles de lint** en modifiant la config — adapter le code pour respecter les règles existantes.
- **Quand le format ou l'approche n'est pas clair, DEMANDER avant de faire.**
- **Ne pas extrapoler** une demande ponctuelle en règle générale.
- Faire ce qui est demandé, rien de plus, rien de moins.
- Les appels Prisma se font dans les gateways (`src/gateways/Prisma*.ts`), jamais directement dans les server actions.
- Ne JAMAIS créer de fichiers sauf si absolument nécessaire. Toujours préférer éditer un fichier existant.
- Ne JAMAIS créer de fichiers de documentation (*.md, README) sauf demande explicite.
