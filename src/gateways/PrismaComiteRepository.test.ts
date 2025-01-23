import { PrismaComiteRepository } from './PrismaComiteRepository'
import { comiteRecordFactory, departementRecordFactory, gouvernanceRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { comiteFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)
    const comite = comiteFactory({
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
      uidGouvernance: {
        value: '1',
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
    const gouvernanceId = 1
    await prisma.regionRecord.create({
      data: regionRecordFactory({ code: '11' }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({ code: '75' }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ id: 1, ssoId: editeurUtilisateurId.value }),
    })
    await prisma.gouvernanceRecord.create({
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({
        commentaire,
        creation: epochTime,
        date,
        derniereEdition: epochTime,
        editeurUtilisateurId: editeurUtilisateurId.value,
        frequence: 'annuelle',
        gouvernanceId,
        id: 1,
        type: 'strategique',
      }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({ commentaire: 'tata', editeurUtilisateurId: editeurUtilisateurId.value, gouvernanceId, id: 2 }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = await repository.find('1')

    // THEN
    expect(comiteRecord?.state).toStrictEqual(comiteFactory({
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
        value: '1',
      },
    }).state)
  })

  it('ne trouve pas un comité quand il n’existe pas', async () => {
    // GIVEN
    const gouvernanceId = 1
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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({ editeurUtilisateurId: 'userFooId', gouvernanceId, id: 2 }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = await repository.find('666')

    // THEN
    expect(comiteRecord).toBeNull()
  })

  it('ne trouve pas un comité quand une de ses données n’est pas valide', async () => {
    // GIVEN
    const gouvernanceId = 1
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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({ date: epochTime, derniereEdition: new Date('3000-01-01'), editeurUtilisateurId: 'userFooId', gouvernanceId, id: 2 }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    const comiteRecord = repository.find('2')

    // THEN
    // eslint-disable-next-line vitest/require-to-throw-message
    await expect(async () => comiteRecord).rejects.toThrow()
  })

  it('modifier un comité', async () => {
    // GIVEN
    const gouvernanceId = 1
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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({
        commentaire: 'premier commentaire',
        creation: epochTime,
        date: epochTime,
        derniereEdition: epochTime,
        editeurUtilisateurId: 'userFooId',
        frequence: 'annuelle',
        gouvernanceId,
        id: 1,
        type: 'strategique',
      }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({ commentaire: 'tata', editeurUtilisateurId: 'userFooId', gouvernanceId, id: 2 }),
    })
    const repository = new PrismaComiteRepository(prisma.comiteRecord)

    // WHEN
    await repository.update(comiteFactory({
      commentaire: 'deuxième commentaire',
      date: new Date('2025-01-01'),
      dateDeCreation: epochTime,
      dateDeModification: new Date('2025-01-01'),
      frequence: 'mensuelle',
      type: 'autre',
      uid: {
        value: '1',
      },
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
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
      date: new Date('2025-01-01'),
      derniereEdition: new Date('2025-01-01'),
      editeurUtilisateurId: 'userFooId',
      frequence: 'mensuelle',
      gouvernanceId: 1,
      type: 'autre',
    }))
  })

  it('modifier un comité sans date', async () => {
    // GIVEN
    const gouvernanceId = 1
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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({
        commentaire: 'premier commentaire',
        creation: epochTime,
        date: epochTime,
        derniereEdition: epochTime,
        editeurUtilisateurId: 'userFooId',
        frequence: 'annuelle',
        gouvernanceId,
        id: 1,
        type: 'strategique',
      }),
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
    const gouvernanceId = 1
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
      data: gouvernanceRecordFactory({ departementCode: '75', id: gouvernanceId }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({
        commentaire: 'premier commentaire',
        creation: epochTime,
        date: epochTime,
        derniereEdition: epochTime,
        editeurUtilisateurId: 'userFooId',
        frequence: 'annuelle',
        gouvernanceId,
        id: 1,
        type: 'strategique',
      }),
    })
    await prisma.comiteRecord.create({
      data: comiteRecordFactory({ commentaire: 'tata', editeurUtilisateurId: 'userFooId', gouvernanceId, id: 2 }),
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
        value: 'userFooId',
      },
      uidGouvernance: {
        value: '1',
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
