import { PrismaFeuilleDeRouteRepository } from './PrismaFeuilleDeRouteRepository'
import { creerUnContact, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreDepartement, creerUnUtilisateur, feuilleDeRouteRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { feuilleDeRouteFactory, utilisateurFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'

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
    await creerUnMembre({
      contact: 'structure@example.com',
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
    expect(feuilleDeRouteRecord).toMatchObject(feuilleDeRouteRecordFactory())
  })

  it('quand je modifie une note de contexte d’une feuille de route', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    creerUneFeuilleDeRoute({
      id: 1,
      gouvernanceDepartementCode: '75',
      nom: 'Feuille de route 69',
      noteDeContextualisation: 'un contenu avant',
    })
    const feuilleDeRoute = feuilleDeRouteFactory({
      uidGouvernance: {
        value: '75',
      },
      noteDeContextualisation: {
        contenu: 'un contenu après',
        dateDeModification: epochTime,
        uidEditeur: new UtilisateurUid(
          utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
        ),
      },
      uid: {
        value: '1',
      }
    })
    // WHEN
    await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute)
    // const result = await new PrismaFeuilleDeRouteRepository().get(new FeuilleDeRouteUid(feuilleDeRoute.state.uid.value))
    const result = await prisma.feuilleDeRouteRecord.findUnique({
      where: {
        id: 1,
      },
    })

    // THEN
    expect(result).toStrictEqual({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      gouvernanceDepartementCode: "75",
      id: 1,
      nom: "Feuille de route 69",
      noteDeContextualisation: "un contenu après",
      oldUUID: null,
      perimetreGeographique: null,
      pieceJointe: null,
      porteurId: null,
    })
  })
})

const emailEditeur = 'martin.tartempion@example.fr'
