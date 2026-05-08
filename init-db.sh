#!/bin/bash
set -e

# 1. Check if the database exists. If it doesn't, create it.
if [ -z "$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='gestao_ativos_backend'")" ]; then
  echo "Creating database gestao_ativos_backend..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE gestao_ativos_backend;
EOSQL
else
  echo "Database gestao_ativos_backend already exists. Skipping creation."
fi

# 2. Connect to the default DB, SWITCH to the new DB, and create the schema
echo "Creating schema in gestao_ativos_backend..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  \c gestao_ativos_backend;
  CREATE SCHEMA IF NOT EXISTS ativos_schema;
EOSQL