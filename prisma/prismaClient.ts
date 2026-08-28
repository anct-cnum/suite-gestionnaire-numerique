import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './generated/client'
import { extensionJournalisationMin } from './journalisationMinExtension'

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

function prismaClientSingleton(): PrismaClient {
  // Le client étendu est re-typé en PrismaClient pour ne pas propager le type étendu
  // dans toute la base de code ($on mis à part, l'API est identique).
  return prismaClientDeBase().$extends(extensionJournalisationMin) as unknown as PrismaClient
}

function tailleDuPool(url: string | undefined): number | undefined {
  // Le moteur Prisma 6 honorait le paramètre connection_limit de l'URL (les tests s'appuient sur
  // connection_limit=1 pour leur isolation par START TRANSACTION/ROLLBACK) ; l'adapter pg ne le lit
  // pas, on le transpose sur la taille du pool.
  const connectionLimit = url === undefined ? null : new URL(url).searchParams.get('connection_limit')
  return connectionLimit === null ? undefined : Number(connectionLimit)
}

function prismaClientDeBase(): PrismaClient {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: tailleDuPool(process.env.DATABASE_URL) }),
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })

  // A décommenter pour déboguer Prisma
  // prisma.$on('query', (eventType) => {
  //   console.log('Query: ' + eventType.query)
  //   console.log('Params: ' + eventType.params)
  //   console.log('Duration: ' + eventType.duration + 'ms')
  // })

  return prisma
}
