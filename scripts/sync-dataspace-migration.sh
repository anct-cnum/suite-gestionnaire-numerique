#!/usr/bin/env bash
# Régénère la migration Prisma "dataspace_integration" à partir de la base
# dataspace locale, sans passer par le backup pseudonymisé distant.
#
# Reproduit l'esprit des tâches `export` / `clean` / `functions` du DAG
# database_pseudonym_export (dataspace/db_pseudonym_export.py), section
# structure uniquement (pas de données).
#
# Usage :
#   ./scripts/sync-dataspace-migration.sh
#
# Variables (override possible) :
#   DATASPACE_CONTAINER  nom du container postgres dataspace (default: postgres-dataspace)
#   DATASPACE_DB         base à dumper                       (default: dataspace_dev)
#   DATASPACE_USER       utilisateur psql                    (default: dataspace)
#   MIGRATION_FILE       fichier de sortie                   (default: prisma/migrations/20250619151605_2_dataspace_integration/migration.sql)

set -euo pipefail

CONTAINER="${DATASPACE_CONTAINER:-postgres-dataspace}"
DB="${DATASPACE_DB:-dataspace_dev}"
USER="${DATASPACE_USER:-dataspace}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="${MIGRATION_FILE:-$MIN_ROOT/prisma/migrations/20250619151605_2_dataspace_integration/migration.sql}"

# Schémas à exclure : on reprend la liste du DAG database_pseudonym_export.
# `audit` n'est PAS exclu : la migration "1" provisionne le schéma, et le dump
# en prod l'inclut (cf tables audit.personne_merge_log / structure_merge_log).
# `opendata` est exclu : présent en local seulement, pas en prod.
# `llm` (dataspace V102) et `source` (V114) sont exclus : non utilisés par
# Prisma, et les vues llm sur min.membre référencent des colonnes créées par
# des migrations min POSTÉRIEURES à ce dump → leur CREATE VIEW casserait le
# replay sur la shadow database.
# `coop` (moteur SQL commun coop-mediation-numerique, migré par le Prisma de
# la coop) est exclu : ses ALTER DEFAULT PRIVILEGES FOR ROLE dataspace
# casseraient le replay (rôle absent), et MIN n'y accède pas via Prisma.
EXCLUDE_SCHEMAS=(coop min api auth cache dataviz import llm public pseudonymisation opendata source)
EXCLUDE_ARGS=()
for s in "${EXCLUDE_SCHEMAS[@]}"; do
  EXCLUDE_ARGS+=(-N "$s")
done

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Le container '$CONTAINER' n'est pas démarré." >&2
  echo "Lance d'abord la stack dataspace (docker compose -f docker-compose.dev.yml up -d postgres-dataspace)." >&2
  exit 1
fi

if [[ ! -d "$(dirname "$MIGRATION_FILE")" ]]; then
  echo "Dossier de migration introuvable : $(dirname "$MIGRATION_FILE")" >&2
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PRE="$TMP_DIR/pre.sql"
POST="$TMP_DIR/post.sql"

echo "→ pg_dump pre-data ($DB sur $CONTAINER)…"
docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DB" --section=pre-data "${EXCLUDE_ARGS[@]}" > "$PRE"

echo "→ pg_dump post-data…"
docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DB" --section=post-data "${EXCLUDE_ARGS[@]}" > "$POST"

# Transformations équivalentes à la tâche `clean` du DAG :
# - retirer les directives pgcrypto (extension non utilisée côté Prisma)
# - retirer les lignes de commentaires "--" isolées (bruit du pg_dump)
# - retirer les "SET transaction_timeout" et "\restrict" (incompatibles selon version client/server)
# - retirer le `SELECT pg_catalog.set_config('search_path', '', false);`
#   émis en tête du dump : il vide le search_path de la session, ce qui fait
#   ensuite échouer Prisma quand il tente d'écrire finished_at dans
#   min._prisma_migrations (erreur P1014 trompeuse "table does not exist")
# - retirer les CREATE SCHEMA admin/main/reference/audit (déjà créés par la
#   migration "1_dataspace_integration_create_roles_and_schema") ainsi que
#   les ALTER SCHEMA OWNER associés (idem)
# - normaliser OWNER TO dataspace -> OWNER TO sonum (alignement avec la prod ;
#   l'ownership "dataspace" en local vient des migrations Flyway qui ne
#   réalignent pas vers sonum)
#
# Note : on n'insère PAS de CREATE SCHEMA min; ici (contrairement au DAG).
# Prisma crée automatiquement tous les schémas listés dans schema.prisma
# (`schemas = ["admin","main","min","reference"]`) avant de jouer les
# migrations — l'ajouter manuellement ferait planter le reset avec 42P06.
echo "→ nettoyage…"
sed -i \
  -e '/pgcrypto/d' \
  -e '/^--$/d' \
  -e '/transaction_timeout/d' \
  -e "/^SELECT pg_catalog.set_config('search_path'/d" \
  -e '/^\\restrict/d' \
  -e '/^\\unrestrict/d' \
  -e '/^CREATE SCHEMA \(admin\|main\|reference\|audit\);$/d' \
  -e '/^ALTER SCHEMA \(admin\|main\|reference\|audit\) OWNER TO /d' \
  -e 's/OWNER TO dataspace;$/OWNER TO sonum;/' \
  "$PRE"

sed -i \
  -e '/^--$/d' \
  -e '/transaction_timeout/d' \
  -e "/^SELECT pg_catalog.set_config('search_path'/d" \
  -e '/^\\restrict/d' \
  -e '/^\\unrestrict/d' \
  -e 's/OWNER TO dataspace;$/OWNER TO sonum;/' \
  "$POST"

# Tâche `functions` du DAG : ces fonctions vivent dans le schéma public et
# sont référencées par des triggers dans la post-data ; il faut donc qu'elles
# soient définies avant.
cat >> "$PRE" <<'SQL'
CREATE OR REPLACE FUNCTION public.updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.edited_by_column() RETURNS TRIGGER AS $$ BEGIN IF NEW.edited_by IS NULL THEN NEW.edited_by = current_user; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
SQL

echo "→ écriture de $MIGRATION_FILE"
cat "$PRE" "$POST" > "$MIGRATION_FILE"

LINES=$(wc -l < "$MIGRATION_FILE")
echo "OK — $LINES lignes écrites."
echo
echo "Vérifie ensuite que tout passe :"
echo "  pnpm dotenv:test -- pnpm prisma:reset"
