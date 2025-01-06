import { Prisma, PrismaClient } from './client-fne'

declare const globalThis: typeof global & {
  prismaGlobalFNE: ReturnType<typeof prismaClientSingleton>
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const prismaFNE = globalThis.prismaGlobalFNE ?? prismaClientSingleton()

export default prismaFNE

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobalFNE = prismaFNE
}

function prismaClientSingleton(): PrismaClient<Prisma.PrismaClientOptions, never> {
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
