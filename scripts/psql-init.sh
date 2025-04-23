#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <sql-file>"
    exit 1
fi

docker compose up -d postgres-dev
docker exec -i min_db_dev psql -U min -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" min
cat "$1" | docker exec -i min_db_dev psql -U min min 