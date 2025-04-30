
import { PrismaActionRepository } from './PrismaActionRepository'
import { actionRecordFactory, creerUnContact, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreDepartement, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { actionFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('action repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter une action à une feuille de route', async () => {
    // GIVEN
    const departementCode = '69'
    const uidEditeur = 'userFooId'
    const uidPorteur = 'porteurId'
    const feuilleDeRouteId = 1
    const utilisateurId = 1

    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })
    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })
    await creerUnMembre({
      contact: 'structure@example.com',
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
    })
    await creerUnMembreDepartement({
      departementCode,
      membreId: uidPorteur,
    })
    await creerUnUtilisateur({
      id: utilisateurId,
      ssoId: uidEditeur,
    })

    await creerUneFeuilleDeRoute({
      creation: new Date(epochTime),
      derniereEdition: new Date(epochTime),
      gouvernanceDepartementCode: departementCode,
      id: feuilleDeRouteId,
      porteurId: uidPorteur,
    })

    const action = actionFactory({
      besoins: ['besoin_1', 'besoin_2'],
      budgetGlobal: 50_000,
      contexte: 'Contexte de test',
      dateDeCreation: epochTime,
      dateDeDebut: new Date('2024-01-01'),
      dateDeFin: new Date('2024-12-31'),
      description: 'Description détaillée de l\'action',
      nom: 'Action test',
      uid: {
        value: 'actionId',
      },
      uidCreateur: String(utilisateurId),
      uidFeuilleDeRoute: { value: feuilleDeRouteId.toString() },
      uidPorteur,
    })

    // WHEN
    const actionCree = await new PrismaActionRepository().add(action)
    // THEN
    expect(actionCree).toBe(true)
    const actionRecord = await prisma.actionRecord.findFirst({
      where: {
        feuilleDeRouteId,
      },
    })

    expect(actionRecord).toMatchObject(actionRecordFactory({
      budgetGlobal: 50000,
      contexte: 'Contexte de test',
      dateDeDebut: new Date('2024-01-01'),
      dateDeFin: new Date('2024-12-31'),
      description: 'Description détaillée de l\'action',
      feuilleDeRouteId: Number(feuilleDeRouteId),
      nom: 'Action test',
    }))
  })
})
