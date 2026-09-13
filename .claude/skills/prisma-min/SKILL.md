---
name: prisma-min
description: Conventions base de données et Prisma de min — multi-schéma, nommage des records, JSON typés, gateways Prisma. Use when modifying prisma/schema*.prisma, writing a migration, or creating or modifying a gateway in src/gateways/.
user-invocable: false
---

# Base de données et gateways

## Base de données

- PostgreSQL, multi-schéma : `admin`, `main`, `min`, `reference`
- Prisma ORM avec `multiSchema`, `views`, `prisma-json-types-generator`
- Nommage modèles Prisma : `XxxRecord` mappé en snake_case (`@@map("xxx")`, `@@schema("xxx")`)
- Champs JSON typés via commentaires JSDoc : `/// [TypeName]`
- Relations avec `@relation(fields: [...], references: [...])`
- `@db.Citext` pour le texte case-insensitive
- `pnpm prisma:generate` après toute modification du schéma

## Gateways

- Implémentent les interfaces (`*Loader` lecture, `*Repository` écriture) définies dans les use cases
- Nommage : `Prisma<Entité>Loader` / `Prisma<Entité>Repository`
- `readonly #dataResource = prisma.model_name` pour le client Prisma
- Les méthodes de transformation internes sont privées (`#`)
- `camelcase: off` automatique pour les fichiers `**/gateways/**/Prisma*.ts`
- Toute mutation dans une transaction ou en SQL brut doit être journalisée : voir le skill `server-action`
