import { PrismaGouvernanceRepository } from './PrismaGouvernanceRepository'
import { departementRecordFactory, gouvernanceRecordFactory, noteDeContexteRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory } from '@/domain/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'

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
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

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
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

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
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ uid: '75' }).state)
  })

  it('ajouter une note de contexte à une gouvernance', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({ code: '11' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: '75' }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ id: 1, ssoId: 'userFooId' }),
    })

    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode: '75' }),
    })

    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)
    const gouvernanceMiseAJourAvecNoteDeContexte = gouvernanceFactory({
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        dateDeModification: new Date('3000-01-01'),
        uidEditeur: new UtilisateurUid({
          email: 'martin.tartempion@example.net',
          value: 'userFooId',
        }),
      },
      uid: '75',
    })

    // WHEN
    await repository.update(gouvernanceMiseAJourAvecNoteDeContexte)

    // THEN
    const gouvernanceRecord = await prisma.gouvernanceRecord.findUnique({
      include: {
        noteDeContexte: true,
      },
      where: {
        departementCode: '75',
      },
    })

    expect(gouvernanceRecord).toMatchObject({
      departementCode: '75',
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        editeurId: 'userFooId',
      },
    })
  })

  it('modifier une gouvernance sans note de contexte', async () => {
    // GIVEN
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode: '75' }),
    })

    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)
    const gouvernance = gouvernanceFactory({ noteDeContexte: undefined, uid: '75' })

    // WHEN
    await repository.update(gouvernance)

    // THEN
    const gouvernanceMiseAJour = await prisma.gouvernanceRecord.findUnique({
      where: {
        departementCode: '75',
      },
    })
    expect(gouvernanceMiseAJour).toStrictEqual(gouvernanceRecordFactory({ departementCode: '75' }))
  })
})
