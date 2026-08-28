// Prisma 7 : le CLI ne charge plus les .env automatiquement, dotenv reproduit le comportement v6.
// Les scripts pnpm préfixés par dotenv:test (.env.test) priment car dotenv n'écrase pas une variable déjà définie.
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
})
