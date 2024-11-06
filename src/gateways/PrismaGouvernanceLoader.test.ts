import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { departementRecordFactory, regionRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand je récupère une gouvernance par son code département existant, alors elle est renvoyée', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      nom: 'Seine-Saint-Denis',
    })
  })

  it('quand je récupère une gouvernance par son code département inexistant, alors elle n’est pas renvoyée', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const codeDepartementInexistant = 'zzz'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartementInexistant)

    // THEN
    expect(gouvernanceReadModel).toBeNull()
  })
})
