import { PrismaGouvernanceRepository } from './PrismaGouvernanceRepository'
import { departementRecordFactory, gouvernanceRecordFactory, noteDeContexteRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory } from '@/domain/testHelper'

describe('gouvernance repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('rechercher une gouvernance qui n’existe pas', async () => {
    // GIVEN
    const departementCode = '75'
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
      data: gouvernanceRecordFactory({ departementCode }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid('3'))

    // THEN
    expect(gouvernanceTrouvee).toBeNull()
  })

  it('rechercher une gouvernance qui existe sans note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({
      data: regionRecordFactory({ code: '11' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: '75' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: '76' }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ id: 1 }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode: '76' }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ noteDeContexte: undefined, uid: '75' }).state)
  })

  it('rechercher une gouvernance qui existe avec note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({
      data: regionRecordFactory({ code: '11' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: departementCode }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ id: 1 }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode }),
    })
    await prisma.noteDeContexteRecord.create({
      data: noteDeContexteRecordFactory({ gouvernanceDepartementCode: departementCode }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ uid: '75' }).state)
  })
})
