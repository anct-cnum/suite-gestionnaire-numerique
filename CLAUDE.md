# CLAUDE.md

## Commandes

- `yarn db:start` — Démarrer la base de données PostgreSQL locale (Docker)
- `yarn dev` — Serveur de développement (Turbo)
- `yarn test` — Migrations + vitest run
- `yarn test:watch` — Tests en mode watch
- `yarn test:coverage` — Tests avec couverture (seuil 90%)
- `yarn typecheck` — Vérification TypeScript
- `yarn lint:ts` — ESLint (max 0 warnings)
- `yarn lint:css` — Stylelint
- `yarn format` — Formatage Prettier
- `yarn check` — Tous les contrôles qualité (dedupe, deadcode, typecheck, prisma format, format, lint, test:coverage)
- `yarn deadcode` — Détection de code mort (Knip)
- `yarn prisma:migrate` — Migrations Prisma
- `yarn prisma:generate` — Regénérer le client Prisma après modification du schéma
- `yarn storybook` — Lancer Storybook

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
- **Corps entier enveloppé dans `avecJournalisationMin(async () => { ... })`** (`./shared/journalisation`) — voir « Journalisation des mutations »
- Validation Zod avant toute logique
- Appel au gateway/repository (jamais Prisma directement)
- `revalidatePath(path)` après mutation
- Retour : `Promise<ReadonlyArray<string>>` (messages d'erreur Zod ou `['OK']`)
- Pour les commands complexes : `ResultAsync<ReadonlyArray<string>>`
- `type ActionParams = Readonly<{...}>` et `const validator = z.object({...})` en bas du fichier

### Journalisation des mutations (audit trail `source.min__evenements`)

**Toute mutation de données doit être journalisée — c'est implicite pour chaque nouvelle feature, sans qu'on ait à le demander.**

- Chaque écriture (create/update/delete) effectuée pendant une server action est tracée dans `source.min__evenements` (table hors Prisma, schéma `source`) : `run_id` (corrélation par action), `source_key` (`schema.table`), `donnee` = `{action, entity_id, user_id, value}` — create/delete : snapshot complet ; update : `{old, new}` limités aux colonnes modifiées.
- **Nouvelle server action ou route mutante** : envelopper le corps entier dans `avecJournalisationMin(async () => { ... })` (`src/app/api/actions/shared/journalisation.ts`). Les mutations Prisma sont alors interceptées automatiquement par l'extension (`prisma/journalisationMinExtension.ts`) — rien d'autre à faire.
- **`$transaction` contenant des mutations Prisma** : envelopper l'appel dans `journaliserTransaction(prisma, async () => prisma.$transaction(...))` (`src/gateways/shared/journalisationMin.ts`) — les événements sont écrits après commit, jetés si rollback.
- **Écritures en SQL brut (`$executeRaw` / `$queryRaw` INSERT…)** : non interceptables — utiliser les helpers de `src/gateways/shared/journalisationMin.ts` dans la transaction : `journaliserCreateBrut(tx, sourceKey, id)`, `journaliserUpdateBrut(tx, sourceKey, selectionAvant, mutation)`, `journaliserDeleteBrut(tx, sourceKey, selectionAvant, mutation)`, `selectionLigne(sourceKey, id)` pour les mono-lignes.
- Exclusions : les tables qui sont déjà des journaux (`audit.structure_merge_log`, `min.membre_transfert_log`) ; pas d'événement si seule `derniere_connexion` change sur `min.utilisateur`.
- Le `user_id` est l'id `min.utilisateur` résolu paresseusement depuis la session : sans session ni utilisateur connu, rien n'est journalisé (pas d'erreur).

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
- Pre-push hook (`husky`) : exécute `yarn check` complet

## Base de données

- PostgreSQL, multi-schéma : `admin`, `main`, `min`, `reference`
- Prisma ORM avec `multiSchema`, `views`, `prisma-json-types-generator`
- Nommage modèles Prisma : `XxxRecord` mappé en snake_case (`@@map("xxx")`, `@@schema("xxx")`)
- Champs JSON typés via commentaires JSDoc : `/// [TypeName]`
- Relations avec `@relation(fields: [...], references: [...])`
- `@db.Citext` pour le texte case-insensitive

## Composants et UI

### Design system — DSFR OBLIGATOIRE
- **Le DSFR (Système de Design de l'État, `@gouvfr/dsfr`) est IMPÉRATIF pour TOUT aspect visuel, sans exception.** Toute UI qui ne respecte pas le DSFR est un bug (cf. retour de recette #1251).
- Avant de créer ou styler un composant, chercher d'abord le composant ou la classe DSFR existante : https://www.systeme-de-design.gouv.fr/composants-et-modeles
- Classes DSFR uniquement : composants (`fr-btn`, `fr-select`, `fr-input`, `fr-card`, `fr-badge`, `fr-table`, `fr-modal`…) et utilitaires (`fr-grid-row`, `fr-col-*`, `fr-mb-2w`, `fr-text--sm`…)
- Couleurs, espacements, typographie : exclusivement via les variables CSS DSFR (`var(--background-contrast-grey)`, `var(--text-default-grey)`, `var(--border-plain-grey)`…) — **jamais de valeurs en dur** (hex, px arbitraires, couleurs nommées)
- CSS custom (modules `*.module.css`) : uniquement en dernier recours pour ce que le DSFR ne couvre pas (ex. animation du Drawer), et toujours construit sur les variables DSFR
- Si un composant externe est indispensable (ex. react-select pour les selects avec recherche), le surcharger avec les variables CSS DSFR pour un rendu strictement identique au DSFR — voir `src/components/shared/Select/styles.tsx` comme référence
- Dark mode : respecté automatiquement si et seulement si les variables CSS DSFR sont utilisées — une couleur en dur casse le dark mode
- Exception : `src/components/coop/**` (code importé, hors périmètre DSFR)

### Forms
- Formulaires non contrôlés avec `FormEvent` et `FormData`
- `useId()` pour les associations label/input
- Patterns de validation : `pattern={emailPattern.source}` depuis `src/shared/patterns.ts`
- Validation serveur via Zod dans les server actions

### Selects
- Standard unique : `Select` et `SelectAsync` (`src/components/shared/Select/`), wrappers react-select stylés DSFR (décision PO #1251)
- Interdit par ESLint : `<select>` natif et import direct de `react-select` / `react-select/async` (exception : `src/components/coop/**`)
- Label passé en children (utiliser `fr-sr-only` si le label doit être invisible)
- `name` pour la soumission FormData (react-select rend un input caché), `required` supporté
- Non contrôlé : marquer l'option par défaut avec `isSelected` ; contrôlé : prop `value` scalaire (`option.value`)
- En test : `await userEvent.click(screen.getByRole('combobox', { name: 'X' }))` puis `await userEvent.click(await screen.findByRole('option', { name: 'Y' }))` ; un select désactivé perd le rôle combobox (utiliser `getByLabelText`)

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
