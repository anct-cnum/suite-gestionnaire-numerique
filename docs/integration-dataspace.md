# Intégration MIN ↔ Dataspace

## Contexte

MIN partage sa base PostgreSQL avec [dataspace](https://gitlab.com/incubateur-territoires/startups/data-inclusion-numerique/dataspace), l'agrégateur de données ETL de l'inclusion numérique. Les deux projets cohabitent dans la même base mais avec des responsabilités distinctes :

| Schéma                           | Propriétaire | Outil de migration         |
| -------------------------------- | ------------ | -------------------------- |
| `admin`, `main`, `reference`, `audit` | dataspace    | Flyway (`database/migrations/`) |
| `min`                            | MIN          | Prisma (`prisma/migrations/`)   |
| `api`, `auth`, `dataviz`, `import`, `public`, `pseudonymisation` | dataspace | Flyway (non utilisé côté MIN)   |

En production, **MIN ne joue plus ses migrations Prisma** : `prisma migrate deploy` est désactivé. Les schémas non-`min` sont entièrement gérés par Flyway côté dataspace. MIN n'a la main que sur le schéma `min`.

Côté développement et test en revanche, MIN doit pouvoir initialiser une base complète depuis zéro pour faire tourner `prisma migrate reset` (utilisé par la suite de tests). C'est le rôle des deux migrations Prisma spéciales :

- `20250619151605_1_dataspace_integration_create_roles_and_schema/` — provisionne les rôles PostgreSQL (`sonum`, `app_python`, `min_dev`, `min_scalingo`) et crée les schémas `admin`, `main`, `reference`, `audit`. Stable, écrite à la main.
- `20250619151605_2_dataspace_integration/` — reproduit la structure (tables, vues, fonctions, séquences, contraintes, index, triggers) des schémas non-`min` tels qu'ils existent en dataspace. **Régénérée à chaque évolution du schéma dataspace.**

## Workflow de synchronisation

Quand le schéma dataspace évolue (nouvelle migration Flyway sur une branche dataspace) :

```bash
# 1. Appliquer les nouvelles migrations Flyway en local
cd ~/Dev/dataspace && ./scripts-dev/run-flyway.sh migrate

# 2. Régénérer la migration "2" depuis la base dataspace locale
cd ~/Dev/min && pnpm db:sync-dataspace

# 3. Vérifier que prisma migrate reset passe sur la base de test
pnpm dotenv:test -- pnpm prisma:reset
```

Le script `scripts/sync-dataspace-migration.sh` :
- attaque la base locale `postgres-dataspace:5532/dataspace_dev` via `docker exec` (pas besoin de pseudonymisation puisque c'est du dev)
- reproduit l'esprit des tâches `export`, `clean`, `functions` du DAG `database_pseudonym_export` côté dataspace
- écrit directement dans `prisma/migrations/20250619151605_2_dataspace_integration/migration.sql`

Variables d'override (rarement utiles) : `DATASPACE_CONTAINER`, `DATASPACE_DB`, `DATASPACE_USER`, `MIGRATION_FILE`.

## Avant l'automatisation

L'ancien workflow nécessitait :
1. déclencher le DAG `database_pseudonym_export` côté Airflow,
2. récupérer l'archive pseudonymisée sur Nextcloud,
3. concaténer manuellement les fichiers `*-structure-pre-data-*.sql` et `*-structure-post-data-*.sql`,
4. coller le résultat dans la migration "2",
5. sauvegarder `schema.prisma`, lancer `pnpm db:pull`, puis restaurer manuellement la portion `min` du schéma.

Tout cela parce qu'on n'avait pas de raccourci local. C'est désormais une seule commande.

## Pièges identifiés lors de la mise en place du script

Ces points sont gérés par le script ; ils sont documentés ici pour qu'on puisse les retrouver si quelqu'un doit retoucher la logique.

### `SELECT pg_catalog.set_config('search_path', '', false);`

`pg_dump` émet cette ligne en tête de chaque dump. Elle vide le `search_path` de la session. Quand Prisma applique ensuite la migration, il tente d'écrire `finished_at` dans `min._prisma_migrations` mais ne la trouve plus sans search_path qualifié. Erreur trompeuse :

```
Error: P1014
The underlying table for model `_prisma_migrations` does not exist.
```

→ Le script supprime cette ligne.

### `CREATE SCHEMA` dupliqués

`pg_dump` inclut `CREATE SCHEMA admin;` (sans `IF NOT EXISTS`) pour tous les schémas non exclus. Or la migration "1" provisionne déjà les schémas. Le second `CREATE SCHEMA` plante avec :

```
ERROR: schema "admin" already exists (42P06)
```

→ Le script supprime les `CREATE SCHEMA` et `ALTER SCHEMA ... OWNER TO` pour `admin`, `main`, `reference`, `audit`.

### `CREATE SCHEMA min` à ne PAS insérer

Le DAG dataspace insère un `CREATE SCHEMA min;` avant l'extension `citext WITH SCHEMA min`. Côté Prisma, c'est inutile (et nocif) : Prisma crée automatiquement tous les schémas listés dans `schemas = ["admin","main","min","reference"]` de `schema.prisma` avant de jouer les migrations. L'ajouter manuellement déclenche la même erreur 42P06 que ci-dessus.

→ Contrairement au DAG, le script local n'insère **pas** `CREATE SCHEMA min;`.

### `OWNER TO dataspace` vs `OWNER TO sonum`

En prod, tous les objets dataspace sont owned par `sonum`. En local, certaines tables récentes (refonte phase 5 : `lieu_inclusion`, `structure_administrative`, etc.) sont owned par `dataspace`, le rôle de connexion Flyway local. Le rôle `dataspace` n'existe pas en test, le `ALTER TABLE ... OWNER TO dataspace` plante.

→ Le script normalise `OWNER TO dataspace` → `OWNER TO sonum` à la régénération.

→ **Cause racine côté dataspace, à corriger là-bas** : les migrations Flyway `V073` → `V092` créent des objets sans `ALTER ... OWNER TO sonum` (ou sans `SET ROLE sonum` en tête de migration). Le sed du script est un compromis, pas une vraie correction.

### Schémas exclus du dump

Liste reprise du DAG `database_pseudonym_export`, complétée :
- `min`, `api`, `auth`, `cache`, `dataviz`, `import`, `public`, `pseudonymisation` (exclusion du DAG)
- `opendata` (présent en local seulement, pas en prod)

`audit` n'est **pas** exclu : il est référencé en prod via les tables `audit.personne_merge_log` et `audit.structure_merge_log`.

## Actions futures

Le script résout le problème opérationnel mais ne corrige pas la cause architecturale. Pistes par ordre de coût croissant :

1. **Côté dataspace** : ajouter `SET ROLE sonum;` en tête des migrations Flyway, ou bien `ALTER ... OWNER TO sonum` après chaque `CREATE TABLE`. Une fois fait, on peut retirer le sed `OWNER TO dataspace → sonum` du script.

2. **`prisma.schema` multi-fichiers** : depuis Prisma 5.15, on peut éclater `schema.prisma` en plusieurs fichiers via `prismaSchemaFolder`. On pourrait isoler la partie dataspace dans `prisma/dataspace.prisma` marquée read-only, et garder `prisma/min.prisma` pour ce que MIN possède réellement. Plus clair, mais le générateur Prisma reste mono-base.

3. **`schema.prisma` publié par dataspace** : faire de dataspace un producteur de schéma Prisma (`prisma db pull` côté dataspace, commit, publication en artefact npm/git), et MIN le consomme. Élimine la dérive, mais introduit un cycle CI inter-projets.

4. **Lecture via PostgREST** : remplacer l'accès Prisma direct aux schémas non-`min` par des appels à l'API PostgREST (`api.*`) déjà exposée par dataspace. MIN n'aurait alors plus à modéliser admin/main/reference côté Prisma du tout. Refactor lourd mais c'est l'architecture la plus propre.

À court terme, (1) est la victoire la plus rapide et la plus utile (corrige une vraie bizarrerie locale). (2) à (4) restent ouvertes selon l'évolution de l'organisation autour des deux projets.

## Fichiers concernés

- `scripts/sync-dataspace-migration.sh` — le script de régénération
- `prisma/migrations/20250619151605_1_dataspace_integration_create_roles_and_schema/migration.sql` — rôles + schémas (écrite à la main, stable)
- `prisma/migrations/20250619151605_2_dataspace_integration/migration.sql` — structure dataspace (régénérée par le script)
- `~/Dev/dataspace/db_pseudonym_export.py` — DAG dont le script s'inspire pour la pseudonymisation distante
