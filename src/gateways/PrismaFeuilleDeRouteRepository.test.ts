
import { PrismaFeuilleDeRouteRepository } from './PrismaFeuilleDeRouteRepository'
import { creerUnContact, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreDepartement, creerUnUtilisateur, feuilleDeRouteRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { feuilleDeRouteFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('feuille de route repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter un feuille de route à une gouvernance', async () => {
    // GIVEN
    const departementCode = '69'
    const uidEditeur = 'userFooId'
    const uidPorteur = 'porteurId'
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })
    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })
    await creerUnUtilisateur({
      ssoId: uidEditeur,
    })
    await creerUnMembre({
      contact:'structure@example.com',
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
    })
    await creerUnMembreDepartement({
      departementCode,
      membreId: uidPorteur,
    })
    const feuilleDeRoute = feuilleDeRouteFactory({
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      nom: 'Feuille de route 69',
      perimetreGeographique: 'departemental',
      uidEditeur: {
        email: 'martin.tartempion@example.fr',
        value: uidEditeur,
      },
      uidGouvernance: {
        value: departementCode,
      },
      uidPorteur,
    })

    // WHEN
    const feuilleDeRouteCree = await new PrismaFeuilleDeRouteRepository().add(feuilleDeRoute)

    // THEN
    expect(feuilleDeRouteCree).toBe(true)
    const feuilleDeRouteRecord = await prisma.feuilleDeRouteRecord.findFirst({
      where: {
        gouvernanceDepartementCode: departementCode,
      },
    })
    expect(feuilleDeRouteRecord).toMatchObject(feuilleDeRouteRecordFactory({
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      perimetreGeographique: 'departemental',
      porteurId: uidPorteur,
    }))
  })
})

