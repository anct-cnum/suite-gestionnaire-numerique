import { Prisma } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaComiteRepository } from './PrismaComiteRepository'
import {
  comiteRecordFactory,
  creerUnComite,
  creerUnDepartement,
  creerUneGouvernance,
  creerUneRegion,
  creerUnUtilisateur,
} from './testHelper'
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
    const comiteCree = await new PrismaComiteRepository().add(comite)

    // THEN
    expect(comiteCree).toBe(true)
    const comiteRecord = await prisma.comiteRecord.findFirst({
      where: {
        gouvernanceDepartementCode: departementCode,
      },
    })
    expect(comiteRecord).toMatchObject(
      comiteRecordFactory({
        editeurUtilisateurId: uidEditeur,
        gouvernanceDepartementCode: departementCode,
      })
    )
  })

  it.each([
    {
      commentaire: 'premier commentaire',
      date: epochTime,
      editeurUtilisateurId: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
      id: 101,
      intention: 'complet',
    },
    {
      commentaire: undefined,
      date: undefined,
      editeurUtilisateurId: {
        email: 'martin.tartempion@example.net',
        value: 'userFooId',
      },
      id: 102,
      intention: 'sans commentaire ni date',
    },
  ])('trouver un comité $intention', async ({ commentaire, date, editeurUtilisateurId, id }) => {
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
      id,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: editeurUtilisateurId.value,
      gouvernanceDepartementCode: departementCode,
      id: id + 50,
    })

    // WHEN
    const comiteRecord = await new PrismaComiteRepository().get(String(id))

    // THEN
    expect(comiteRecord.state).toStrictEqual(
      comiteFactory({
        commentaire,
        date,
        dateDeCreation: epochTime,
        dateDeModification: epochTime,
        frequence: 'annuelle',
        type: 'strategique',
        uid: {
          value: String(id),
        },
        uidEditeur: editeurUtilisateurId,
        uidGouvernance: {
          value: departementCode,
        },
      }).state
    )
  })

  it('ne trouve pas un comité quand il n’existe pas', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnComite({
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
    })

    // WHEN
    const comiteRecord = new PrismaComiteRepository().get('666')

    // THEN
    await expect(comiteRecord).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(comiteRecord).rejects.toMatchObject({ code: 'P2025' })
  })

  it('modifier un comité', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    const comiteId = 201
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
      id: comiteId,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: comiteId + 1,
    })

    // WHEN
    await new PrismaComiteRepository().update(
      comiteFactory({
        commentaire: 'deuxième commentaire',
        date: epochTimePlusOneDay,
        dateDeCreation: epochTime,
        dateDeModification: epochTimePlusOneDay,
        frequence: 'mensuelle',
        type: 'autre',
        uid: {
          value: String(comiteId),
        },
        uidEditeur: {
          email: 'martin.tartempion@example.net',
          value: uidEditeur,
        },
        uidGouvernance: {
          value: '1',
        },
      })
    )

    // THEN
    const comiteRecord = await prisma.comiteRecord.findUnique({
      where: {
        id: comiteId,
      },
    })
    expect(comiteRecord).toStrictEqual(
      comiteRecordFactory({
        commentaire: 'deuxième commentaire',
        creation: epochTime,
        date: epochTimePlusOneDay,
        derniereEdition: epochTimePlusOneDay,
        editeurUtilisateurId: 'userFooId',
        frequence: 'mensuelle',
        gouvernanceDepartementCode: departementCode,
        id: comiteId,
        type: 'autre',
      })
    )
  })

  it('modifier un comité sans date', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    const comiteId = 301
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
      id: comiteId,
      type: 'strategique',
    })

    // WHEN
    await new PrismaComiteRepository().update(
      comiteFactory({
        date: undefined,
        uid: {
          value: String(comiteId),
        },
      })
    )

    // THEN
    const comiteRecord = await prisma.comiteRecord.findUnique({
      where: {
        id: comiteId,
      },
    })
    expect(comiteRecord?.date).toBeNull()
  })

  it('supprimer un comité', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    const comiteId = 401
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
      id: comiteId,
      type: 'strategique',
    })
    await creerUnComite({
      commentaire: 'un autre commentaire',
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: comiteId + 1,
    })

    // WHEN
    await new PrismaComiteRepository().drop(
      comiteFactory({
        commentaire: '',
        date: epochTime,
        dateDeCreation: epochTime,
        dateDeModification: epochTime,
        frequence: 'mensuelle',
        type: 'autre',
        uid: {
          value: String(comiteId),
        },
        uidEditeur: {
          email: 'martin.tartempion@example.net',
          value: uidEditeur,
        },
        uidGouvernance: {
          value: departementCode,
        },
      })
    )

    // THEN
    const comiteRecord1 = await prisma.comiteRecord.findUnique({
      where: {
        id: comiteId,
      },
    })
    expect(comiteRecord1).toBeNull()
    const comiteRecord2 = await prisma.comiteRecord.findUnique({
      where: {
        id: comiteId + 1,
      },
    })
    expect(comiteRecord2).not.toBeNull()
  })
})
