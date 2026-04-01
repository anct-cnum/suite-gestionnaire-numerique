# Guide de contribution

Ce guide vous accompagne pour configurer votre environnement de développement et contribuer au projet Mon inclusion numérique.

## Table des matieres

- [Prerequis](#prerequis)
- [Demarrage rapide](#demarrage-rapide)
- [Import des donnees](#import-des-donnees)
- [Commandes disponibles](#commandes-disponibles)
- [Tests](#tests)
- [Architecture](#architecture)
- [Outils](#outils)
- [Pro Connect](#pro-connect)
- [Acces production](#acces-production)
- [Utilitaires](#utilitaires)

## Prerequis

### Devbox (recommande)

[Devbox](https://www.jetify.com/devbox) permet d'isoler l'environnement de développement.

Acceder a l'environnement devbox :

```bash
devbox shell
```

Pour quitter :

```bash
exit
```

### Docker

Docker et Docker Compose sont necessaires pour la base de donnees PostgreSQL.

## Démarrage rapide

### 1. Installation de l'environnement

```bash
devbox shell
pnpm install
pnpm prisma:generate
```

### 2. Configuration des variables d'environnement

Remplacer les variables affectees a `A_REMPLIR` dans `.env.local`.

### 3. Démarrage des services

```bash
docker compose up -d
pnpm dev
```

Ouvrir le navigateur sur [http://localhost:3000](http://localhost:3000).

Pour le site vitrine :

```bash
pnpm dev:vitrine
```

### 4. Import des donnees

Vous ne pourrez pas vous connecter sans données en base. Pour cela, vous devez importer un jeu de données complet et pseudonymisé depuis le dataspace.

#### Étape 1 : Déclencher l'export

1. Aller sur [Airflow](https://airflow.inclusion-numerique.anct.gouv.fr/dags/database_pseudonym_export)
2. Cliquer sur "Déclencher" en haut à droite
3. Dans la modale, ne rien modifier et cliquer de nouveau sur "Déclencher"

#### Étape 2 : Télécharger l'export

1. Récuperer l'export sur [le drive SoNum](https://drive.societenumerique.gouv.fr/s/9x9TkBD7BQtijEG)
2. Décompresser `dataspace_pseudonym.tar.gz`
3. Copier les scripts SQL dans le repertoire `dbs/` du projet

#### Étape 3 : Preparer les scripts

Aller dans `dbs/dataspace-01-structure-pre-data-hors_min.sql` et supprimer la ligne :

```sql
CREATE SCHEMA min;
```

#### Étape 4 : Appliquer les scripts

Dans un terminal avec `devbox shell` :

```bash
docker compose down
pnpm db:start
pnpm prisma:reset

docker compose exec postgres-dev psql -U min -d min -c "DROP SCHEMA main CASCADE;"
docker compose exec postgres-dev psql -U min -d min -c "DROP SCHEMA audit CASCADE;"
docker compose exec postgres-dev psql -U min -d min -c "DROP SCHEMA admin CASCADE;"
docker compose exec postgres-dev psql -U min -d min -c "DROP SCHEMA reference CASCADE;"

docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-01-structure-pre-data-hors_min.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-02-data-admin-ref.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-03-data-main.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-04-data-min.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-05-structure-post-data-hors_min.sql
```

#### Étape 5 : Configurer l'utilisateur de test

```bash
docker compose exec postgres-dev psql -U min -d min -c "UPDATE min.utilisateur
SET sso_id = 'test@fia1.fr',
    sso_email = 'test@fia1.fr'
WHERE departement_code = 'zzz'
  AND region_code = 'zz'
  AND role = 'administrateur_dispositif';"
```

#### Étape 6 : Démarrer l'application

```bash
pnpm dev
```

Se connecter avec `test@fia1.fr`.

> En cas de problème de coherence entre le schema Prisma et les scripts générés, verifier les differences et ajuster si necessaire.

## Commandes disponibles

### Developpement

| Commande           | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Demarre le serveur de dev avec Turbo         |
| `pnpm dev:vitrine` | Demarre le site vitrine                      |
| `pnpm db:start`    | Demarre le conteneur PostgreSQL              |
| `pnpm devmigrate`  | Execute les migrations et demarre le serveur |

### Tests

| Commande             | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm test`          | Execute les tests une fois (migre la BDD de test) |
| `pnpm test:watch`    | Execute les tests en mode watch                   |
| `pnpm test:coverage` | Execute les tests avec rapport de couverture      |

### Qualite du code

| Commande         | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `pnpm check`     | Execute toutes les verifications (dedupe, deadcode, typecheck, format, lint, tests) |
| `pnpm typecheck` | Verification TypeScript                                                             |
| `pnpm lint:ts`   | ESLint pour TypeScript                                                              |
| `pnpm lint:css`  | Stylelint pour CSS                                                                  |
| `pnpm format`    | Formatage Prettier (CSS, JSON, markdown)                                            |

### Base de donnees

| Commande                  | Description                       |
| ------------------------- | --------------------------------- |
| `pnpm prisma:migrate`     | Cree et applique les migrations   |
| `pnpm prisma:reset`       | Reinitialise completement la base |
| `pnpm prisma:generate`    | Genere le client Prisma           |
| `pnpm prisma:drop:schema` | Supprime les schemas              |
| `pnpm psql:local`         | Acces CLI a la BDD locale         |
| `pnpm psql:test`          | Acces CLI a la BDD de test        |

### Autres

| Commande         | Description                      |
| ---------------- | -------------------------------- |
| `pnpm storybook` | Lance Storybook sur le port 6006 |
| `pnpm deadcode`  | Detecte le code mort avec Knip   |

## Tests

### Execution

```bash
# Une fois
pnpm test

# En continu
pnpm test:watch

# Avec couverture
pnpm test:coverage
```

### Conventions

- Les tests sont colocates avec les fichiers source (`*.test.ts` ou `*.test.tsx`)
- Objectif de couverture : 90%
- Les tests sont shuffles pour assurer l'isolation
- Utiliser `epochTime` au lieu de `new Date()` dans les tests
- Utiliser `waitFor()` ou `findByXXX()` au lieu de `act()`
- Eviter `vi.mock()` - preferer l'injection de dependances

### Acces aux bases de donnees

```bash
# BDD locale
pnpm psql:local

# BDD de test
pnpm psql:test
```

## Architecture

L'application suit les principes de **Clean Architecture** avec CQRS (Command Query Responsibility Segregation).

### Structure des repertoires

```
src/
 |- app/                -> Controllers (Next.js App Router)
 |- components/
 |   |- [Composant]/    -> Composant de type page et ses enfants
 |   |- shared/         -> Composants partages (ExternalLink...)
 |   +- transverse/     -> Composants transverses (EnTete, PiedDePage...)
 |- domain/             -> Objets metier
 |- gateways/           -> Repositories, loaders et gateways
 |- presenters/         -> Presenters
 |- shared/             -> Fonctions communes
 +- use-cases/          -> Use cases : queries et commands
```

### Regles de dependances

Les dependances sont strictement controlees par ESLint (`import/no-restricted-paths`) :

| Couche       | Peut importer depuis                             |
| ------------ | ------------------------------------------------ |
| `domain`     | `domain/`, `shared/`                             |
| `use-cases`  | `domain/`, `shared/`                             |
| `gateways`   | `domain/`, `use-cases/`, `shared/`               |
| `presenters` | `use-cases/`, `shared/` (pas domain ni gateways) |

### Pattern CQRS

**Commands** (operations d'ecriture) :

```typescript
interface CommandHandler<Command, Failure = string, Success = ResultOk> {
  handle(command: Command): Promise<Result<Failure, Success>>
}
```

**Queries** (operations de lecture) :

```typescript
interface QueryHandler<Query extends Struct, ReadModel> {
  handle(query: Query): Promise<ReadModel>
}
```

### Base de donnees

PostgreSQL multi-schema avec Prisma :

- Schemas : `admin`, `main`, `min`, `reference`
- Convention de nommage : suffixe `Record` pour les modeles Prisma (ex: `UtilisateurRecord`)

Se referer a [cette discussion](https://github.com/anct-cnum/suite-gestionnaire-numerique/discussions/202) pour une description exhaustive de l'architecture.

## Outils

### TypeScript

- Typing strict pour minimiser les bugs
- Feedback rapide d'erreur
- Configuration strict

> Le repertoire `src/components/coop/` est exclu des verifications TypeScript, ESLint et Stylelint.

### ESLint

- Formatage JavaScript
- Reduction des bugs
- Configuration strict avec plugins supplementaires

### Stylelint

- Verification CSS
- Configuration strict avec plugins supplementaires

### Prettier

- Formatage CSS, JSON et markdown

### Knip

- Detection du code mort

### Husky

- CI en local au pre-push pour un feedback plus rapide

### Vitest

- Framework de test JavaScript
- Configuration [F.I.R.S.T.](https://openclassrooms.com/fr/courses/6100311-testez-votre-code-java-pour-realiser-des-applications-de-qualite/6440801-appliquez-le-principe-first-pour-ecrire-de-bons-tests)
- Couverture configuree pour alerter en dessous de 90%

### Testing Library

- Framework de test frontend

### Stryker

- Tests de mutation pour renforcer la robustesse des tests

## Pro Connect

### Production

| Variable                    | Valeur                                     |
| --------------------------- | ------------------------------------------ |
| `PRO_CONNECT_URL`           | `https://auth.agentconnect.gouv.fr/api/v2` |
| `PRO_CONNECT_CLIENT_ID`     | Voir vaultwarden                           |
| `PRO_CONNECT_CLIENT_SECRET` | Voir vaultwarden                           |

URLs de redirection :

- Post connexion : `https://mon-inclusion-numerique.osc-fr1.scalingo.io/api/auth/callback/pro-connect`
- Post deconnexion : `https://mon-inclusion-numerique.osc-fr1.scalingo.io/connexion`

Dossier demarches-simplifiees : https://www.demarches-simplifiees.fr/dossiers/22822056

### Developpement

| Variable                    | Valeur                                           |
| --------------------------- | ------------------------------------------------ |
| `PRO_CONNECT_URL`           | `https://fca.integ01.dev-agentconnect.fr/api/v2` |
| `PRO_CONNECT_CLIENT_ID`     | Voir vaultwarden                                 |
| `PRO_CONNECT_CLIENT_SECRET` | Voir vaultwarden                                 |

Compte de test : `test@fia1.fr`

## Acces production

### Acces a la base de donnees de production

Il faut lancer un tunnel SSH. Pour cela, donner une cle SSH publique au DataSpace.

Alternative : se connecter au bastion Scalingo, ouvrir un tunnel SSH puis lancer psql.

```bash
pnpm bash:production
ssh -i .ssh/id_rsa -N -f -L $DS_BDD_IP $DS_BASTION_IP -p $DS_BASTION_PORT
psql "${DATABASE_URL/?schema=min/?options=--search_path%3dmin}"
```

## Utilitaires

### Reset de la base de test

```bash
pnpm dotenv:test -- pnpm prisma:reset
```

### Scripts SQL

En cas de timeout, supprimer des scripts SQL la ligne :

```sql
SET transaction_timeout = 0;
```

## Storybook

Storybook est utilise pour developper et tester les composants UI de maniere isolee.

```bash
pnpm storybook
```

Ouvrir [http://localhost:6006](http://localhost:6006).

### Creer une story

1. Creer un fichier `*.stories.ts` dans `src/stories/`
2. Importer le composant a documenter
3. Definir les scenarios avec des props variees

Exemple :

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MonComposant from '@/components/MonComposant'

const meta: Meta<typeof MonComposant> = {
  title: 'Components/MonComposant',
  component: MonComposant,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    prop1: 'valeur',
    prop2: 123,
  },
}
```

## Mise a jour des dependances

### DSFR

Ne pas oublier de copier/coller le fichier JS et les pictos dans `/public`.

### Matomo

Changer la version du fichier `/public/matomo-vX.js` s'il est modifie.

Statistiques : https://stats.beta.gouv.fr/index.php?module=CoreHome&action=index&idSite=200&period=day&date=today
