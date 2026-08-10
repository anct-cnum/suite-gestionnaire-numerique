import { Prisma } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaFeuilleDeRouteRepository } from './PrismaFeuilleDeRouteRepository'
import {
  creerUnContact,
  creerUnDepartement,
  creerUnDocumentDeFeuilleDeRoute,
  creerUneFeuilleDeRoute,
  creerUneGouvernance,
  creerUneRegion,
  creerUnMembre,
  creerUnUtilisateur,
  feuilleDeRouteRecordFactory,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { feuilleDeRouteFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('feuille de route repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter un feuille de route à une gouvernance', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '69'
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement({ code: departementCode }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )
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
        const feuilleDeRouteCree = await new PrismaFeuilleDeRouteRepository().add(feuilleDeRoute, tx)

        // THEN
        expect(feuilleDeRouteCree).toBe(true)
        const feuilleDeRouteRecord = await tx.feuilleDeRouteRecord.findFirst({
          where: {
            gouvernanceDepartementCode: departementCode,
          },
        })
        expect(feuilleDeRouteRecord).toMatchObject(feuilleDeRouteRecordFactory({ porteurId: uidPorteur }))
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })

  it('modifier une feuille de route', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '69'
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement({ code: departementCode }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUneFeuilleDeRoute(
          {
            creation: epochTime,
            derniereEdition: epochTime,
            editeurUtilisateurId: uidEditeur,
            gouvernanceDepartementCode: departementCode,
            id: 1,
            nom: 'Feuille de route 69',
            noteDeContextualisation: '<p>un contenu<p>',
            porteurId: uidPorteur,
          },
          tx
        )
        await creerUneFeuilleDeRoute(
          {
            creation: epochTime,
            derniereEdition: epochTime,
            editeurUtilisateurId: uidEditeur,
            gouvernanceDepartementCode: departementCode,
            id: 2,
            nom: 'Une autre feuille de route test',
            noteDeContextualisation: 'un contenu',
            perimetreGeographique: 'departemental',
            porteurId: uidPorteur,
          },
          tx
        )
        const feuilleDeRoute = feuilleDeRouteFactory({
          dateDeCreation: epochTime,
          dateDeModification: epochTime,
          noteDeContextualisation: '<p>un contenu<p>',
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
        await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute, tx)

        // THEN
        const feuilleDeRouteRecord = await tx.feuilleDeRouteRecord.findFirst({
          where: {
            id: 1,
          },
        })
        expect(feuilleDeRouteRecord).toMatchObject(
          feuilleDeRouteRecordFactory({
            noteDeContextualisation: '<p>un contenu<p>',
            porteurId: uidPorteur,
          })
        )
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })

  it('modifier une feuille de route avec un document, alors l’ancienne version est close et la nouvelle devient courante', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '69'
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        const chemin = 'user/1/nanoid_feuille-de-route.pdf'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement({ code: departementCode }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUneFeuilleDeRoute(
          {
            creation: epochTime,
            derniereEdition: epochTime,
            editeurUtilisateurId: uidEditeur,
            gouvernanceDepartementCode: departementCode,
            id: 1,
            nom: 'Feuille de route 69',
            porteurId: uidPorteur,
          },
          tx
        )
        const ancienEditeur = await tx.utilisateurRecord.findUniqueOrThrow({ where: { id: uidEditeur } })
        await tx.feuilleDeRouteDocumentRecord.create({
          data: {
            chemin: 'user/1/ancien.pdf',
            creation: epochTime,
            editeurUtilisateurId: ancienEditeur.id,
            feuilleDeRouteId: 1,
            nom: 'ancien.pdf',
          },
        })
        const feuilleDeRoute = feuilleDeRouteFactory({
          document: { chemin, nom: 'feuille-de-route.pdf' },
          uid: {
            value: '1',
          },
          uidEditeur: {
            email: emailEditeur,
            value: uidEditeur,
          },
          uidGouvernance: {
            value: departementCode,
          },
          uidPorteur,
        })

        // WHEN
        await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute, tx)

        // THEN
        const editeur = await tx.utilisateurRecord.findUniqueOrThrow({ where: { id: uidEditeur } })
        const documents = await tx.feuilleDeRouteDocumentRecord.findMany({
          orderBy: { chemin: 'asc' },
          where: { feuilleDeRouteId: 1 },
        })
        expect(documents).toStrictEqual([
          {
            chemin: 'user/1/ancien.pdf',
            creation: epochTime,
            editeurUtilisateurId: editeur.id,
            feuilleDeRouteId: 1,
            id: documents[0].id,
            nom: 'ancien.pdf',
            suppression: epochTime,
          },
          {
            chemin,
            creation: epochTime,
            editeurUtilisateurId: editeur.id,
            feuilleDeRouteId: 1,
            id: documents[1].id,
            nom: 'feuille-de-route.pdf',
            suppression: null,
          },
        ])
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })

  it('modifier une feuille de route sans document, alors la version courante est close mais conservée', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '69'
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement({ code: departementCode }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUneFeuilleDeRoute(
          {
            creation: epochTime,
            derniereEdition: epochTime,
            editeurUtilisateurId: uidEditeur,
            gouvernanceDepartementCode: departementCode,
            id: 1,
            nom: 'Feuille de route 69',
            porteurId: uidPorteur,
          },
          tx
        )
        const editeur = await tx.utilisateurRecord.findUniqueOrThrow({ where: { id: uidEditeur } })
        await tx.feuilleDeRouteDocumentRecord.create({
          data: {
            chemin: 'user/1/ancien.pdf',
            creation: epochTime,
            editeurUtilisateurId: editeur.id,
            feuilleDeRouteId: 1,
            nom: 'ancien.pdf',
          },
        })
        const feuilleDeRoute = feuilleDeRouteFactory({
          uid: {
            value: '1',
          },
          uidEditeur: {
            email: emailEditeur,
            value: uidEditeur,
          },
          uidGouvernance: {
            value: departementCode,
          },
          uidPorteur,
        })

        // WHEN
        await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute, tx)

        // THEN
        const documents = await tx.feuilleDeRouteDocumentRecord.findMany({ where: { feuilleDeRouteId: 1 } })
        expect(documents).toStrictEqual([
          {
            chemin: 'user/1/ancien.pdf',
            creation: epochTime,
            editeurUtilisateurId: editeur.id,
            feuilleDeRouteId: 1,
            id: documents[0].id,
            nom: 'ancien.pdf',
            suppression: epochTime,
          },
        ])
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })

  it('trouver une feuille de route complète', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 1
    const uidPorteur = 'porteurId'

    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ id: uidEditeur })
    await creerUneGouvernance({ departementCode })

    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })
    await creerUnMembre({
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
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
      noteDeContextualisation: '<p>un contenu<p>',
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

  it('trouver une feuille de route dont le document est dans la table dédiée, alors le document renvoyé est celui de la table', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 1

    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ id: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: uidEditeur,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      nom: 'Feuille de route test',
    })
    await creerUnDocumentDeFeuilleDeRoute({
      chemin: 'user/fooId/feuille-de-route-fake.pdf',
      editeurUtilisateurId: 1,
      feuilleDeRouteId: 1,
      nom: 'Feuille de route 2026.pdf',
    })

    // WHEN
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get('1')

    // THEN
    expect(feuilleDeRoute.state.document).toStrictEqual({
      chemin: 'user/fooId/feuille-de-route-fake.pdf',
      nom: 'Feuille de route 2026.pdf',
    })
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
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
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
        value: 0,
      },
      uidGouvernance: { value: departementCode },
      uidPorteur: '~',
    })
    expect(feuilleDeRoute.state).toStrictEqual(expected.state)
  })

  it('trouver une feuille de route sans note de contextualisation', async () => {
    // GIVEN
    const departementCode = '75'
    const uidEditeur = 1
    const uidPorteur = 'porteurId'

    await creerUneRegion()
    await creerUnDepartement()
    await creerUnUtilisateur({ id: uidEditeur })
    await creerUneGouvernance({ departementCode })
    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })
    await creerUnMembre({
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
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
        email: 'martin.tartempion@example.net',
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
      perimetreGeographique: 'toto',
    })

    // WHEN
    const feuilleDeRoute = new PrismaFeuilleDeRouteRepository().get('1')

    // THEN
    await expect(feuilleDeRoute).rejects.toThrow('perimetreGeographiqueInvalide')
  })

  it('quand je modifie une note de contextualisation d’une feuille de route', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '75'
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement(undefined, tx)
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUneFeuilleDeRoute(
          {
            gouvernanceDepartementCode: '75',
            id: 2,
            nom: 'Feuille de route 69',
            noteDeContextualisation: '<p>un contenu avant<p>',
          },
          tx
        )
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )

        await creerUneFeuilleDeRoute(
          {
            editeurUtilisateurId: uidEditeur,
            gouvernanceDepartementCode: '75',
            id: 1,
            nom: 'Feuille de route 69',
            noteDeContextualisation: 'un contenu avant',
            porteurId: uidPorteur,
          },
          tx
        )
        const feuilleDeRoute = feuilleDeRouteFactory({
          noteDeContextualisation: '<p>un contenu après<p>',
          uid: {
            value: '1',
          },
          uidEditeur: {
            email: emailEditeur,
            value: uidEditeur,
          },
          uidGouvernance: {
            value: '75',
          },
          uidPorteur,
        })
        // WHEN
        await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute, tx)

        // THEN
        const result = await tx.feuilleDeRouteRecord.findUnique({ where: { id: 1 } })
        expect(result).toStrictEqual({
          creation: epochTime,
          derniereEdition: epochTime,
          editeurUtilisateurId: uidEditeur,
          gouvernanceDepartementCode: '75',
          id: 1,
          nom: 'Feuille de route 69',
          noteDeContextualisation: '<p>un contenu après<p>',
          oldUUID: null,
          perimetreGeographique: 'departemental',
          porteurId: uidPorteur,
        })
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })

  it('quand je supprime une note de contextualisation d’une feuille de route', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN
        const departementCode = '75'
        const uidEditeurAvant = 2
        const uidEditeur = 1
        const uidPorteur = 'porteurId'
        await creerUneRegion(undefined, tx)
        await creerUnDepartement(undefined, tx)
        await creerUnUtilisateur({ id: uidEditeurAvant, ssoEmail: 'toto@exemple.fr', ssoId: 'userFooId0' }, tx)
        await creerUnUtilisateur({ id: uidEditeur }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnContact(
          {
            email: 'structure@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          tx
        )
        await creerUnMembre(
          {
            gouvernanceDepartementCode: departementCode,
            id: uidPorteur,
          },
          tx
        )
        await creerUneFeuilleDeRoute(
          {
            editeurUtilisateurId: uidEditeurAvant,
            gouvernanceDepartementCode: '75',
            id: 1,
            nom: 'Feuille de route 69',
            noteDeContextualisation: 'un contenu avant',
            porteurId: uidPorteur,
          },
          tx
        )
        const feuilleDeRoute = feuilleDeRouteFactory({
          noteDeContextualisation: undefined,
          uid: {
            value: '1',
          },
          uidEditeur: { email: emailEditeur, value: uidEditeur },
          uidGouvernance: {
            value: '75',
          },
          uidPorteur,
        })

        // WHEN
        await new PrismaFeuilleDeRouteRepository().update(feuilleDeRoute, tx)

        // THEN
        const result = await tx.feuilleDeRouteRecord.findUnique({ where: { id: 1 } })
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
          porteurId: uidPorteur,
        })
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })
})

const emailEditeur = 'martin.tartempion@example.fr'
