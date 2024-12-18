import { PrismaComiteRepository } from './PrismaComiteRepository'
import { comiteRecordFactory, departementRecordFactory, gouvernanceRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { comiteFactory } from '@/domain/testHelper'

describe('comité repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter un comité à une gouvernance', async () => {
    // GIVEN
    const gouvernanceId = 1
    await prisma.regionRecord.create({
      data: regionRecordFactory({ code: '11' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: '75' }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ id: 1 }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ createurId: 1, departementCode: '75', id: gouvernanceId }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)
    const comite = comiteFactory({
      uidGouvernance: {
        value: '1',
      },
      uidUtilisateurCourant: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
    })

    // WHEN
    const comiteCree = await repository.add(comite)

    // THEN
    expect(comiteCree).toBe(true)
    const comiteRecord = await prisma.comiteRecord.findFirst({
      where: {
        gouvernanceId,
      },
    })
    expect(comiteRecord).toMatchObject(comiteRecordFactory({
      editeurUtilisateurId: 'userFooId',
      gouvernanceId: 1,
    }))
  })
})
