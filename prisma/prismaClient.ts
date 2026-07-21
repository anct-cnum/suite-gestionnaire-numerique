import { Prisma, PrismaClient } from '@prisma/client'

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

function prismaClientSingleton(): PrismaClient<Prisma.PrismaClientOptions, never> {
  // Le client étendu est re-typé en PrismaClient pour ne pas propager le type étendu
  // dans toute la base de code ($on mis à part, l'API est identique).
  return prismaClientDeBase().$extends(extensionJournalisationMin) as unknown as PrismaClient<
    Prisma.PrismaClientOptions,
    never
  >
}

function prismaClientDeBase(): PrismaClient<Prisma.PrismaClientOptions, never> {
  const prisma = new PrismaClient({
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
