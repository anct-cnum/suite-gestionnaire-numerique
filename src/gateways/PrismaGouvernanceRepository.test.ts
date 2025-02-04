import { Prisma } from '@prisma/client'

import { PrismaGouvernanceRepository } from './PrismaGouvernanceRepository'
import { creerUnDepartement, creerUneGouvernance, creerUneNoteDeContexte, creerUneRegion, creerUnUtilisateur, gouvernanceRecordFactory } from './testHelper'
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
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnUtilisateur()
    await creerUneGouvernance({ departementCode })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = repository.find(new GouvernanceUid('3'))

    // THEN
    await expect(gouvernanceTrouvee).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(gouvernanceTrouvee).rejects.toMatchObject({ code: 'P2025' })
  })

  it('rechercher une gouvernance qui existe sans note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnDepartement({ code: '76' })
    await creerUnUtilisateur()
    await creerUneGouvernance({ departementCode })
    await creerUneGouvernance({ departementCode: '76' })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee.state).toStrictEqual(
      gouvernanceFactory({ noteDeContexte: undefined, uid: departementCode }).state
    )
  })

  it('rechercher une gouvernance qui existe avec note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnUtilisateur()
    await creerUneGouvernance({ departementCode })
    await creerUneNoteDeContexte({ gouvernanceDepartementCode: departementCode })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee.state).toStrictEqual(gouvernanceFactory({ uid: departementCode }).state)
  })

  it('rechercher une gouvernance qui existe sans note privée', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnDepartement({ code: '76' })
    await creerUnUtilisateur()
    await creerUneGouvernance({ departementCode, notePrivee: undefined })
    await creerUneGouvernance({ departementCode: '76' })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    const gouvernanceTrouvee = await repository.find(new GouvernanceUid(departementCode))

    // THEN
    expect(gouvernanceTrouvee.state).toStrictEqual(
      gouvernanceFactory({ noteDeContexte: undefined, notePrivee: undefined, uid: departementCode }).state
    )
  })

  it('ajouter une note de contexte à une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnUtilisateur({ ssoId: 'userFooId' })
    await creerUneGouvernance({ departementCode, notePrivee: undefined })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)
    const gouvernanceMiseAJourAvecNoteDeContexte = gouvernanceFactory({
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        dateDeModification: epochTime,
        uidEditeur: new UtilisateurUid({
          email: 'martin.tartempion@example.net',
          value: 'userFooId',
        }),
      },
      notePrivee: undefined,
      uid: departementCode,
    })

    // WHEN
    await repository.update(gouvernanceMiseAJourAvecNoteDeContexte)

    // THEN
    const gouvernanceRecord = await prisma.gouvernanceRecord.findUnique({
      include: {
        noteDeContexte: true,
      },
      where: {
        departementCode,
      },
    })

    expect(gouvernanceRecord).toStrictEqual({
      departementCode,
      editeurNotePriveeId: null,
      noteDeContexte: {
        contenu: '<p>lorem ipsum dolor sit amet</p>',
        derniereEdition: epochTime,
        editeurId: 'userFooId',
        gouvernanceDepartementCode: departementCode,
      },
      notePrivee: null,
    })
  })

  it('modifier une gouvernance sans note de contexte', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnUtilisateur()
    await creerUneGouvernance({ departementCode })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)
    const gouvernance = gouvernanceFactory({ noteDeContexte: undefined, uid: departementCode })

    // WHEN
    await repository.update(gouvernance)

    // THEN
    const gouvernanceMiseAJour = await prisma.gouvernanceRecord.findUnique({
      where: {
        departementCode,
      },
    })
    expect(gouvernanceMiseAJour).toStrictEqual(gouvernanceRecordFactory({ departementCode }))
  })

  it('ajouter une note privée à une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnDepartement({ code: '93' })
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode, editeurNotePriveeId: undefined, notePrivee: undefined })
    await creerUneGouvernance({ departementCode: '93', editeurNotePriveeId: undefined, notePrivee: undefined })
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
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnDepartement({ code: '93' })
    await creerUnUtilisateur({ id: 1, ssoEmail: 'userFooId@example.com', ssoId: uidEditeur })
    await creerUnUtilisateur({ id: 2, ssoEmail: 'userFooId2@example.com', ssoId: 'userFooId2' })
    await creerUneGouvernance({
      departementCode,
      editeurNotePriveeId: uidEditeur,
      notePrivee: {
        contenu: 'un contenu quelconque',
        derniereEdition: epochTime.toISOString(),
      },
    })
    await creerUneGouvernance({
      departementCode: '93',
      editeurNotePriveeId: undefined,
      notePrivee: undefined,
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    await repository.update(gouvernanceFactory({
      notePrivee: {
        contenu: 'un autre contenu quelconque',
        dateDeModification: epochTime,
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
        derniereEdition: epochTime.toISOString(),
      },
    }))
    expect(modifiedRecords[1]).toStrictEqual(gouvernanceRecordFactory({
      departementCode: '93',
      editeurNotePriveeId: null,
      // @ts-expect-error
      notePrivee: null,
    }))
  })

  it('supprimer une note privée d’une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUnUtilisateur({ ssoEmail: 'userFooId@example.com', ssoId: uidEditeur })
    await creerUneGouvernance({
      departementCode,
      editeurNotePriveeId: uidEditeur,
      notePrivee: {
        contenu: 'un contenu quelconque',
        derniereEdition: epochTime.toISOString(),
      },
    })
    const repository = new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord)

    // WHEN
    await repository.update(gouvernanceFactory({
      notePrivee: undefined,
      uid: departementCode,
    }))

    // THEN
    const modifiedRecord = await prisma.gouvernanceRecord.findUnique({ where: { departementCode } })
    expect(modifiedRecord).toStrictEqual(gouvernanceRecordFactory({
      departementCode,
      editeurNotePriveeId: null,
      // @ts-expect-error
      notePrivee: null,
    }))
  })
})
