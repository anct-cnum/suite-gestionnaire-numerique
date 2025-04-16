import { Prisma } from '@prisma/client'

import { PrismaFeuilleDeRouteRepository } from './PrismaFeuilleDeRouteRepository'
import { creerUnContact, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreDepartement, creerUnUtilisateur, feuilleDeRouteRecordFactory } from './testHelper'
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
    expect(feuilleDeRouteRecord).toMatchObject(feuilleDeRouteRecordFactory({ porteurId: uidPorteur }))
  })

  it('modifier une feuille de route', async () => {
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
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      nom: 'Feuille de route 69',
      porteurId: uidPorteur,
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 2,
      nom: 'Une autre feuille de route test',
      noteDeContextualisation: 'un contenu',
      perimetreGeographique: 'departemental',
      porteurId: uidPorteur,
    })
    const feuilleDeRoute = feuilleDeRouteFactory({
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      perimetreGeographique: 'departemental',
      uid: {
        value: '1',
      },
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
    await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute)

    // THEN
    const feuilleDeRouteRecord = await prisma.feuilleDeRouteRecord.findFirst({
      where: {
        id: 1,
      },
    })
    expect(feuilleDeRouteRecord).toMatchObject(feuilleDeRouteRecordFactory({ porteurId: uidPorteur }))
  })

  it('trouver une feuille de route complète', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    const uidPorteur = 'porteurId'

    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
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
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      nom: 'Une autre feuille de route test',
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 2,
      nom: 'Feuille de route test',
      noteDeContextualisation: 'un contenu',
      perimetreGeographique: 'departemental',
      porteurId: 'porteurId',
    })

    // WHEN
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get('2')

    // THEN
    const expected = feuilleDeRouteFactory({
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      nom: 'Feuille de route test',
      noteDeContextualisation: '<p>un contenu<p>',
      perimetreGeographique: 'departemental',
      uid: { value: '2' },
      uidEditeur: {
        email: 'martin.tartempion@example.net',
        value: uidEditeur,
      },
      uidGouvernance: { value: departementCode },
      uidPorteur: 'porteurId',
    })
    expect(feuilleDeRoute.state).toStrictEqual(expected.state)
  })

  it('trouver une feuille de route sans date d’édition ni éditeur et ni porteur et ni de note de contextualisation', async () => {
    // GIVEN
    const departementCode = '75'
    const uidPorteur = 'porteurId'

    await creerUneRegion()
    await creerUnDepartement()
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
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: undefined,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      nom: 'Feuille de route test',
      noteDeContextualisation: null,
      perimetreGeographique: undefined,
      porteurId: undefined,
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: undefined,
      gouvernanceDepartementCode: departementCode,
      id: 2,
      nom: 'Une autre feuille de route test',
    })

    // WHEN
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get('1')

    // THEN
    const expected = feuilleDeRouteFactory({
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      nom: 'Feuille de route test',
      noteDeContextualisation: undefined,
      perimetreGeographique: 'departemental',
      uid: { value: '1' },
      uidEditeur: {
        email: '~',
        value: '~',
      },
      uidGouvernance: { value: departementCode },
      uidPorteur: '~',
    })
    expect(feuilleDeRoute.state).toStrictEqual(expected.state)
  })

  it('trouver une feuille de route sans note de contextualisation', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    const uidPorteur = 'porteurId'

    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
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
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      nom: 'Feuille de route test',
      noteDeContextualisation: undefined,
      perimetreGeographique: 'departemental',
      porteurId: 'porteurId',
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: undefined,
      gouvernanceDepartementCode: departementCode,
      id: 2,
      nom: 'Une autre feuille de route test',
    })

    // WHEN
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get('1')

    // THEN
    const expected = feuilleDeRouteFactory({
      dateDeCreation: epochTime,
      dateDeModification: epochTime,
      nom: 'Feuille de route test',
      noteDeContextualisation: undefined,
      perimetreGeographique: 'departemental',
      uid: { value: '1' },
      uidEditeur: {
        email: uidEditeur,
        value: uidEditeur,
      },
      uidGouvernance: { value: departementCode },
      uidPorteur: 'porteurId',
    })
    expect(feuilleDeRoute.state).toStrictEqual(expected.state)
  })

  it('ne trouve pas une feuille de route', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUneGouvernance({ departementCode })
    await creerUneFeuilleDeRoute({ gouvernanceDepartementCode: departementCode, id: 1 })

    // WHEN
    const feuilleDeRoute = new PrismaFeuilleDeRouteRepository().get('111')

    // THEN
    await expect(feuilleDeRoute).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(feuilleDeRoute).rejects.toMatchObject({ code: 'P2025' })
  })

  it('ne trouve pas une feuille de route quand une de ses données n’est pas valide', async () => {
    // GIVEN
    const departementCode = '75'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUneGouvernance({ departementCode })
    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: departementCode,
      id: 1,
      perimetreGeographique: 'toto' })

    // WHEN
    const feuilleDeRoute = new PrismaFeuilleDeRouteRepository().get('1')

    // THEN
    await expect(feuilleDeRoute).rejects.toThrow('perimetreGeographiqueInvalide')
  })

  it('quand je modifie une note de contextualisation d’une feuille de route', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: '75',
      id: 1,
      nom: 'Feuille de route 69',
      noteDeContextualisation: '<p>un contenu avant<p>',
    })
    const feuilleDeRoute = feuilleDeRouteFactory({
      noteDeContextualisation: '<p>un contenu après<p>',
      uid: {
        value: '1',
      },
      uidGouvernance: {
        value: '75',
      },
    })
    // WHEN
    await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute)

    // THEN
    const result = await prisma.feuilleDeRouteRecord.findUnique({ where: { id: 1 } })
    expect(result).toStrictEqual({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      gouvernanceDepartementCode: '75',
      id: 1,
      nom: 'Feuille de route 69',
      noteDeContextualisation: 'un contenu après',
      oldUUID: null,
      perimetreGeographique: 'departemental',
      pieceJointe: null,
      porteurId: null,
    })
  })

  it('quand je supprime une note de contextualisation d’une feuille de route', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeurAvant = 'userFooId0'
    const uidEditeur = 'userFooId'
    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ ssoEmail: 'toto@exemple.fr', ssoId: uidEditeurAvant })
    await creerUnUtilisateur({ ssoId: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUneFeuilleDeRoute({
      editeurUtilisateurId: uidEditeurAvant,
      gouvernanceDepartementCode: '75',
      id: 1,
      nom: 'Feuille de route 69',
      noteDeContextualisation: 'un contenu avant',
    })
    const feuilleDeRoute = feuilleDeRouteFactory({
      noteDeContextualisation: undefined,
      uid: {
        value: '1',
      },
      uidEditeur: { email: emailEditeur, value: uidEditeur },
      uidGouvernance: {
        value: '75',
      },
    })

    // WHEN
    await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute)

    // THEN
    const result = await prisma.feuilleDeRouteRecord.findUnique({ where: { id: 1 } })
    expect(result).toStrictEqual({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: '75',
      id: 1,
      nom: 'Feuille de route 69',
      noteDeContextualisation: null,
      oldUUID: null,
      perimetreGeographique: 'departemental',
      pieceJointe: null,
      porteurId: null,
    })
  })
})

const emailEditeur = 'martin.tartempion@example.fr'
