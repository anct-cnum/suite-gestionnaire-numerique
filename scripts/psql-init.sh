#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <sql-file>"
    exit 1
fi

docker compose up -d postgres-dev

# Termine toutes les connexions actives et supprime complètement la base
docker compose exec -T postgres-dev psql -U min postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'min'
AND pid <> pg_backend_pid();"

docker compose exec -T postgres-dev psql -U min postgres -c "DROP DATABASE IF EXISTS min;"
docker compose exec -T postgres-dev psql -U min postgres -c "CREATE DATABASE min OWNER min;"
yarn prisma:reset
# Importe le nouveau fichier SQL
cat "$1" | docker compose exec -T postgres-dev psql -U min min

# Met à jour toutes les séquences des colonnes 'id'
docker compose exec -T postgres-dev psql -U min min -c "
DO \$\$
DECLARE
    t record;
BEGIN
    FOR t IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'min' 
        AND tablename != '_prisma_migrations'
        AND EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'min' 
            AND table_name = tablename 
            AND column_name = 'id' 
            AND data_type = 'integer'
        )
    )
    LOOP
        EXECUTE format('SELECT setval(pg_get_serial_sequence(%L, ''id''), COALESCE((SELECT MAX(id) FROM min.%I), 1), true)', t.tablename, t.tablename);
    END LOOP;
END
\$\$;"