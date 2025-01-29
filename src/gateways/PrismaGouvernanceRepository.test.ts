import { PrismaGouvernanceRepository } from './PrismaGouvernanceRepository'
import { departementRecordFactory, gouvernanceRecordFactory, noteDeContexteRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('gouvernance repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('rechercher une gouvernance qui n’existe pas', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode }) })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid('3'))

    // THEN
    expect(gouvernanceTrouvee).toBeNull()
  })

  it('rechercher une gouvernance qui existe sans note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '76' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode: '76' }) })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ noteDeContexte: undefined, uid: '75' }).state)
  })

  it('rechercher une gouvernance qui existe avec note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: departementCode }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode }) })
    await prisma.noteDeContexteRecord.create({
      data: noteDeContexteRecordFactory({ gouvernanceDepartementCode: departementCode }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ uid: '75' }).state)
  })

  it('rechercher une gouvernance qui existe sans note privée', async () => {
    // GIVEN
    const departementCode = '75'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '76' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({
      departementCode,
      notePrivee: undefined,
    }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode: '76' }) })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee?.state).toStrictEqual(gouvernanceFactory({ noteDeContexte: undefined, notePrivee: undefined, uid: '75' }).state)
  })

  it('ajouter une note de contexte à une gouvernance', async () => {
    // GIVEN
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1, ssoId: 'userFooId' }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode: '75', notePrivee: undefined }) })

    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)
    const gouvernanceMiseAJourAvecNoteDeContexte = gouvernanceFactory({
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        dateDeModification: new Date('2000-01-01'),
        uidEditeur: new UtilisateurUid({
          email: 'martin.tartempion@example.net',
          value: 'userFooId',
        }),
      },
      notePrivee: undefined,
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

    expect(gouvernanceRecord).toStrictEqual({
      departementCode: '75',
      editeurNotePriveeId: 'userFooId',
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        derniereEdition: new Date('2000-01-01'),
        editeurId: 'userFooId',
        gouvernanceDepartementCode: '75',
      },
      notePrivee: null,
    })
  })

  it('modifier une gouvernance sans note de contexte', async () => {
    // GIVEN
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '75' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1 }) })
    await prisma.gouvernanceRecord.create({ data: gouvernanceRecordFactory({ departementCode: '75' }) })

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

  it('ajouter une note privée à une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: departementCode }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '93' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1, ssoId: uidEditeur }) })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({
        departementCode,
        editeurNotePriveeId: undefined,
        notePrivee: undefined,
      }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({
        departementCode: '93',
        editeurNotePriveeId: undefined,
        notePrivee: undefined,
      }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    await repository.update(gouvernanceFactory({
      notePrivee: {
        contenu: 'un contenu quelconque',
        dateDeModification: epochTime,
        uidEditeur: new UtilisateurUid(utilisateurFactory({
          uid: {
            email: 'userFooId@example.com',
            value: uidEditeur,
          },
        }).state.uid),
      },
      uid: departementCode,
    }))

    // THEN
    const createdRecords = await prisma.gouvernanceRecord.findMany({ orderBy: { departementCode: 'asc' } })
    expect(createdRecords[0]).toStrictEqual(gouvernanceRecordFactory({
      departementCode,
      editeurNotePriveeId: uidEditeur,
      notePrivee: {
        contenu: 'un contenu quelconque',
        derniereEdition: epochTime.toISOString(),
      },
    }))
    expect(createdRecords[1]).toStrictEqual(gouvernanceRecordFactory({
      departementCode: '93',
      editeurNotePriveeId: null,
      // @ts-expect-error
      notePrivee: null,
    }))
  })

  it('modifier une note privée d’une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await prisma.regionRecord.create({ data: regionRecordFactory({ code: '11' }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: departementCode }) })
    await prisma.departementRecord.create({ data: departementRecordFactory({ code: '93' }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 1, ssoEmail: 'userFooId@example.com', ssoId: uidEditeur }) })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory({ id: 2, ssoEmail: 'userFooId2@example.com', ssoId: 'userFooId2' }) })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({
        departementCode,
        editeurNotePriveeId: uidEditeur,
        notePrivee: {
          contenu: 'un contenu quelconque',
          derniereEdition: epochTime.toISOString(),
        },
      }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({
        departementCode: '93',
        editeurNotePriveeId: undefined,
        notePrivee: undefined,
      }),
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    await repository.update(gouvernanceFactory({
      notePrivee: {
        contenu: 'un autre contenu quelconque',
        dateDeModification: new Date('2000-01-01'),
        uidEditeur: new UtilisateurUid(utilisateurFactory({
          uid: {
            email: 'userFooId2@example.com',
            value: 'userFooId2',
          },
        }).state.uid),
      },
      uid: departementCode,
    }))

    // THEN
    const modifiedRecords = await prisma.gouvernanceRecord.findMany({ orderBy: { departementCode: 'asc' } })
    expect(modifiedRecords[0]).toStrictEqual(gouvernanceRecordFactory({
      departementCode,
      editeurNotePriveeId: 'userFooId2',
      notePrivee: {
        contenu: 'un autre contenu quelconque',
        derniereEdition: new Date('2000-01-01').toISOString(),
      },
    }))
    expect(modifiedRecords[1]).toStrictEqual(gouvernanceRecordFactory({
      departementCode: '93',
      editeurNotePriveeId: null,
      // @ts-expect-error
      notePrivee: null,
    }))
  })
})
