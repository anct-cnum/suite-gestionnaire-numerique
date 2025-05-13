import { PrismaClient as ExternalClient } from '@prisma/client-extern'

const globalForExternalPrisma = globalThis as unknown as {
  externalPrisma?: ExternalClient
}

export const externalDb =
  globalForExternalPrisma.externalPrisma ?? new ExternalClient()

if (process.env.NODE_ENV !== 'production') {
  globalForExternalPrisma.externalPrisma = externalDb
}
