import { Prisma } from '@prisma/client'

import { PrismaComiteRepository } from './PrismaComiteRepository'
import { creerUnComite, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnUtilisateur, comiteRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { comiteFactory } from '@/domain/testHelper'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('comité repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter un comité à une gouvernance', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)
    const comite = comiteFactory({
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: uidEditeur,
      },
      uidGouvernance: {
        value: departementCode,
      },
    })

    // WHEN
    const comiteCree = await repository.add(comite)

    // THEN
    expect(comiteCree).toBe(true)
    const comiteRecord = await prisma.comiteRecord.findFirst({
      where: {
        gouvernanceDepartementCode: departementCode,
      },
    })
    expect(comiteRecord).toMatchObject(comiteRecordFactory({
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
    }))
  })

  it.each([
    {
      commentaire: 'premier commentaire',
      date: epochTime,
      editeurUtilisateurId: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
      intention: 'complet',
    },
    {
      commentaire: undefined,
      date: undefined,
      editeurUtilisateurId: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
      intention: 'sans commentaire ni date',
    },
  ])('trouver un comité $intention', async ({ commentaire, date, editeurUtilisateurId }) => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: editeurUtilisateurId.value })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      commentaire,
      creation: epochTime,
      date,
      derniereEdition: epochTime,
      editeurUtilisateurId: editeurUtilisateurId.value,
      frequence: 'annuelle',
      gouvernanceDepartementCode: departementCode,
      id: 1,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: editeurUtilisateurId.value,
      gouvernanceDepartementCode: departementCode,
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = await repository.get('1')

    // THEN
    expect(comiteRecord.state).toStrictEqual(comiteFactory({
      commentaire,
      date,
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      frequence: 'annuelle',
      type: 'strategique',
      uid: {
        value: '1',
      },
      uidEditeur: editeurUtilisateurId,
      uidGouvernance: {
        value: departementCode,
      },
    }).state)
  })

  it('ne trouve pas un comité quand il n’existe pas', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({ editeurUtilisateurId: uidEditeur, gouvernanceDepartementCode: departementCode })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = repository.get('666')

    // THEN
    await expect(comiteRecord).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(comiteRecord).rejects.toMatchObject({ code: 'P2025' })
  })

  it('ne trouve pas un comité quand une de ses données n’est pas valide', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      date: epochTime,
      derniereEdition: epochTimePlusOneDay,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 2,
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = repository.get('2')

    // THEN
    await expect(async () => comiteRecord).rejects.toThrow('dateDuComiteDoitEtreDansLeFutur')
  })

  it('modifier un comité', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      commentaire: 'premier commentaire',
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      frequence: 'annuelle',
      gouvernanceDepartementCode: departementCode,
      id: 1,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    await repository.update(comiteFactory({
      commentaire: 'deuxième commentaire',
      date: epochTimePlusOneDay,
      dateDeCreation: epochTime,
      dateDeModification: epochTimePlusOneDay,
      frequence: 'mensuelle',
      type: 'autre',
      uid: {
        value: '1',
      },
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: uidEditeur,
      },
      uidGouvernance: {
        value: '1',
      },
    }))

    // THEN
    const comiteRecord = await prisma.comiteRecord.findUnique({
      where: {
        id: 1,
      },
    })
    expect(comiteRecord).toMatchObject(comiteRecordFactory({
      commentaire: 'deuxième commentaire',
      creation: epochTime,
      date: epochTimePlusOneDay,
      derniereEdition: epochTimePlusOneDay,
      editeurUtilisateurId: 'userFooId',
      frequence: 'mensuelle',
      gouvernanceDepartementCode: departementCode,
      type: 'autre',
    }))
  })

  it('modifier un comité sans date', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      commentaire: 'premier commentaire',
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      frequence: 'annuelle',
      gouvernanceDepartementCode: departementCode,
      id: 1,
      type: 'strategique',
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    await repository.update(comiteFactory({
      date: undefined,
      uid: {
        value: '1',
      },
    }))

    // THEN
    const comiteRecord = await prisma.comiteRecord.findUnique({
      where: {
        id: 1,
      },
    })
    expect(comiteRecord?.date).toBeNull()
  })

  it('supprimer un comité', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      commentaire: 'premier commentaire',
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      frequence: 'annuelle',
      gouvernanceDepartementCode: departementCode,
      id: 1,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 2,
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    await repository.drop(comiteFactory({
      commentaire: '',
      date: epochTime,
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      frequence: 'mensuelle',
      type: 'autre',
      uid: {
        value: '1',
      },
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: uidEditeur,
      },
      uidGouvernance: {
        value: departementCode,
      },
    }))

    // THEN
    const comiteRecord1 = await prisma.comiteRecord.findUnique({
      where: {
        id: 1,
      },
    })
    expect(comiteRecord1).toBeNull()
    const comiteRecord2 = await prisma.comiteRecord.findUnique({
      where: {
        id: 2,
      },
    })
    expect(comiteRecord2).not.toBeNull()
  })
})
