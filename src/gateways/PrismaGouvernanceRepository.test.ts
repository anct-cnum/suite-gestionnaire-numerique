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
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid('3'))

    // THEN
    expect(gouvernanceTrouvee).toBeNull()
  })

  it('rechercher une gouvernance qui existe sans note de contexte', async () => {
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
      data: gouvernanceRecordFactory({ createurId: 1, departementCode: '75', id: gouvernanceId, idFNE: 'fneFooId1' }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ createurId: 1, departementCode: '75', id: 2, idFNE: 'fneFooId2' }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(String(gouvernanceId)))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ noteDeContexte: undefined }).state)
  })

  it('rechercher une gouvernance qui existe avec note de contexte', async () => {
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
    await prisma.noteDeContexteRecord.create({
      data: noteDeContexteRecordFactory({ gouvernanceId, id: 1 }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(String(gouvernanceId)))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory().state)
  })
})
