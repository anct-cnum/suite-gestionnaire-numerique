import { Prisma, PrismaClient } from '@prisma/client'

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
  const prisma = new PrismaClient(
    {
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
    }
  )

  // A décommenter pour déboguer Prisma
  // prisma.$on('query', (eventType) => {
  //   console.log('Query: ' + eventType.query)
  //   console.log('Params: ' + eventType.params)
  //   console.log('Duration: ' + eventType.duration + 'ms')
  // })

  return prisma
}
