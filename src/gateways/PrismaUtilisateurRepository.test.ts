import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaUtilisateurRepository } from './PrismaUtilisateurRepository'
import {
  creerUnDepartement,
  creerUneRegion,
  creerUneStructure,
  creerUnGroupement,
  creerUnUtilisateur,
  utilisateurRecordFactory,
} from './testHelper'
import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import { departementFactory, utilisateurFactory } from '@/domain/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

const uidUtilisateurValue = 1
const uidUtilisateur = new UtilisateurUid({
  email: 'martin.tartempion@example.net',
  value: uidUtilisateurValue,
})

describe('utilisateur repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('recherche d’un utilisateur', () => {
    const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)

    it('l’utilisateur n’existe pas : erreur', async () => {
      // GIVEN
      const idInexistant = 2
      await creerUnUtilisateur({ id: idInexistant })

      // WHEN
      const result = repository.get(uidUtilisateurValue)

      // THEN
      await expect(result).rejects.toThrow('Utilisateur non trouvé')
    })

    it('l’utilisateur est supprimé : erreur', async () => {
      // GIVEN
      await creerUnUtilisateur({ id: uidUtilisateurValue, isSupprime: true })

      // WHEN
      const result = repository.get(uidUtilisateurValue)

      // THEN
      await expect(result).rejects.toThrow('Utilisateur non trouvé')
    })

    describe('l’utilisateur existe : les données utilisateur sont reçues', () => {
      const structureId = 10
      const departementCode = '75'
      const groupementId = 10
      const regionCode = '11'

      it.each([
        {
          createRecordWith: {
            departementCode,
            role: 'gestionnaire_departement' as const,
          },
          desc: 'pour un gestionnaire département : avec la référence au département',
          expected: {
            departement: {
              code: departementCode,
              codeRegion: regionCode,
              nom: 'Paris',
            },
            role: 'Gestionnaire département' as const,
          },
        },
        {
          createRecordWith: {
            regionCode,
            role: 'gestionnaire_region' as const,
          },
          desc: 'pour un gestionnaire région : avec la référence à la région',
          expected: {
            region: {
              code: regionCode,
              nom: 'Île-de-France',
            },
            role: 'Gestionnaire région' as const,
          },
        },
        {
          createRecordWith: {
            role: 'gestionnaire_structure' as const,
            structureId,
          },
          desc: 'pour un gestionnaire structure : avec la référence à la structure',
          expected: {
            role: 'Gestionnaire structure' as const,
            structureUid: structureId,
          },
        },
        {
          createRecordWith: {
            groupementId,
            role: 'gestionnaire_groupement' as const,
          },
          desc: 'pour un gestionnaire groupement : avec la référence au groupement',
          expected: {
            groupementUid: groupementId,
            role: 'Gestionnaire groupement' as const,
          },
        },
        {
          createRecordWith: {
            role: 'administrateur_dispositif' as const,
          },
          desc: 'pour un administrateur dispositif',
          expected: {
            organisation: 'Administrateur Dispositif lambda',
            role: 'Administrateur dispositif' as const,
          },
        },
      ])('$desc', async ({ createRecordWith, expected }) => {
        // GIVEN
        await creerUneRegion({ code: regionCode })
        await creerUnDepartement({ code: departementCode })
        await creerUnGroupement({ id: groupementId })
        await creerUneStructure({ id: structureId })
        await creerUnUtilisateur({ ...createRecordWith, id: uidUtilisateurValue })

        // WHEN
        const result = await repository.get(uidUtilisateurValue)

        // THEN
        expect(result.state).toStrictEqual(
          utilisateurFactory({
            uid: uidUtilisateur.state,
            ...expected,
          }).state
        )
      })

      it.each([
        {
          derniereConnexion: null,
          desc: 'un utilisateur ne s’étant jamais connecté est marqué inactif',
          expectedIsActive: false,
        },
        {
          derniereConnexion: epochTimePlusOneDay,
          desc: 'un utilisateur s’étant déjà connecté est marqué actif',
          expectedIsActive: true,
        },
      ])('$desc', async ({ derniereConnexion, expectedIsActive }) => {
        // GIVEN
        await creerUneRegion({ code: regionCode })
        await creerUnDepartement({ code: departementCode })
        await creerUnGroupement({ id: groupementId })
        await creerUneStructure({ id: structureId })
        await creerUnUtilisateur({ derniereConnexion, id: uidUtilisateurValue })

        // WHEN
        const result = await repository.get(uidUtilisateurValue)

        // THEN
        expect(result.state.isActive).toBe(expectedIsActive)
      })
    })
  })

  describe('suppression d’un utilisateur', () => {
    const idUtilisateurExistant = 1
    const idUtilisateurSupprime = 2
    const utilisateurExistant = {
      id: idUtilisateurExistant,
      ssoEmail: 'martin.tartempion@example.net',
      ssoId: 'userFooId',
    }
    const utilisateurSupprime = {
      id: idUtilisateurSupprime,
      isSupprime: true,
      ssoEmail: 'martin.tartempion@example.org',
      ssoId: 'adc38b16-b303-487e-b1c0-8d33bcb6d0e6',
    }

    it('compte existant, non préalablement supprimé : l’entrée est marquée comme supprimée', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurExistant)
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(
        utilisateurFactory({
          uid: { email: 'martin.tartempion@example.com', value: idUtilisateurExistant },
        })
      )

      // THEN
      expect(result).toBe(true)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { id: idUtilisateurExistant },
      })
      expect(utilisateurModifie).toStrictEqual({
        dateDeCreation: epochTime,
        departementCode: null,
        derniereConnexion: epochTime,
        emailDeContact: 'martin.tartempion@example.net',
        groupementId: null,
        id: idUtilisateurExistant,
        inviteLe: epochTime,
        isBetaTesteur: false,
        isSuperAdmin: false,
        isSupprime: true,
        nom: 'Tartempion',
        oldStructureId: null,
        prenom: 'Martin',
        regionCode: null,
        role: 'gestionnaire_structure',
        ssoEmail: 'martin.tartempion@example.net',
        ssoId: 'userFooId',
        structureId: null,
        telephone: '0102030405',
      })
    })

    it('compte existant, préalablement supprimé : aucune écriture', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurExistant)
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(
        utilisateurFactory({
          uid: { email: 'martin.tartempion@example.com', value: idUtilisateurSupprime },
        })
      )

      // THEN
      expect(result).toBe(false)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { id: idUtilisateurExistant },
      })
      expect(utilisateurModifie?.isSupprime).toBe(false)
    })

    it('compte inexistant : aucune écriture', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(
        utilisateurFactory({
          uid: { email: 'martin.tartempion@example.com', value: idUtilisateurExistant },
        })
      )

      // THEN
      expect(result).toBe(false)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { id: idUtilisateurSupprime },
      })
      expect(utilisateurModifie?.isSupprime).toBe(true)
    })

    it('erreur inattendue : non gérée', async () => {
      // GIVEN
      const prismaClientKnownRequestErrorOnUpdateStub = {
        async update(): Promise<never> {
          return Promise.reject(new Prisma.PrismaClientKnownRequestError('', { clientVersion: '', code: 'P1000' }))
        },
      } as unknown as Prisma.UtilisateurRecordDelegate
      const prismaClientUnknownRequestErrorOnUpdateStub = {
        async update(): Promise<never> {
          return Promise.reject(new Error('error'))
        },
      } as unknown as Prisma.UtilisateurRecordDelegate

      // WHEN
      const unhandledKnownRequestError = new PrismaUtilisateurRepository(
        prismaClientKnownRequestErrorOnUpdateStub
      ).drop(
        utilisateurFactory({
          uid: { email: 'martin.tartempion@example.com', value: idUtilisateurExistant },
        })
      )

      const unhandledUnknownRequestError = new PrismaUtilisateurRepository(
        prismaClientUnknownRequestErrorOnUpdateStub
      ).drop(
        utilisateurFactory({
          uid: { email: 'martin.tartempion@example.com', value: idUtilisateurExistant },
        })
      )

      // THEN
      await expect(unhandledKnownRequestError).rejects.toMatchObject({ code: 'P1000' })
      await expect(unhandledUnknownRequestError).rejects.toStrictEqual(new Error('error'))
    })
  })

  describe('mise à jour d’un utilisateur', () => {
    it('changement du rôle, du nom, du prénom, de la date d’invitation, de la date de dernière connexion et de l’email', async () => {
      // GIVEN
      const date = epochTime
      await creerUnUtilisateur({ id: uidUtilisateurValue })

      // WHEN
      await new PrismaUtilisateurRepository(prisma.utilisateurRecord).update(
        utilisateurFactory({
          derniereConnexion: date,
          emailDeContact: 'martine.dugenoux@example.org',
          inviteLe: date,
          nom: 'Dugenoux',
          prenom: 'Martine',
          role: 'Gestionnaire structure',
          uid: { email: 'martine.dugenoux@example.org', value: uidUtilisateurValue },
        })
      )

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          id: uidUtilisateurValue,
        },
      })
      expect(updatedRecord?.role).toBe('gestionnaire_structure')
      expect(updatedRecord?.nom).toBe('Dugenoux')
      expect(updatedRecord?.prenom).toBe('Martine')
      expect(updatedRecord?.emailDeContact).toBe('martine.dugenoux@example.org')
      expect(updatedRecord?.inviteLe).toStrictEqual(date)
      expect(updatedRecord?.derniereConnexion).toStrictEqual(date)
    })
  })

  describe('mise à jour de la structure d’un utilisateur', () => {
    it('change le structureId de l’utilisateur', async () => {
      // GIVEN
      const nouvelleStructureId = 20
      await creerUneStructure({ id: nouvelleStructureId })
      await creerUnUtilisateur({ id: uidUtilisateurValue })

      // WHEN
      await new PrismaUtilisateurRepository(prisma.utilisateurRecord).updateStructure(
        uidUtilisateurValue,
        nouvelleStructureId
      )

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: { id: uidUtilisateurValue },
      })
      expect(updatedRecord?.structureId).toBe(nouvelleStructureId)
    })
  })

  describe('mise à jour du ssoId d’un utilisateur', () => {
    it('changement du ssoId à partir de l’email de connexion', async () => {
      // GIVEN
      await creerUnUtilisateur({
        id: uidUtilisateurValue,
        ssoEmail: 'martine.dugenoux@example.org',
        ssoId: 'martine.dugenoux@example.org',
      })

      // WHEN
      await new PrismaUtilisateurRepository(prisma.utilisateurRecord).updateSsoId(
        'Martine.Dugenoux@example.org',
        'nouveauSsoId'
      )

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          id: uidUtilisateurValue,
        },
      })
      expect(updatedRecord?.ssoId).toBe('nouveauSsoId')
    })
  })

  describe('ajout d’un utilisateur', () => {
    const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    const structureId = 10
    const departementCode = '75'
    const groupementId = 10
    const regionCode = '11'

    it('dont l’email n’existe pas : insertion réussie avec l’email comme ssoId provisoire', async () => {
      // GIVEN
      await creerUneRegion({ code: regionCode })
      await creerUnDepartement({ code: departementCode })
      await creerUnGroupement({ id: groupementId })
      await creerUneStructure({ id: structureId })
      const utilisateur = utilisateurFactory({
        departement: departementFactory({ code: departementCode }).state,
        role: 'Gestionnaire département',
        uid: { email: 'martin.tartempion@example.net', value: uidUtilisateurValue },
      })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      const createdRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoEmail: 'martin.tartempion@example.net',
        },
      })
      expect(resultatCreation).toBe(true)
      expect(createdRecord).toMatchObject(
        utilisateurRecordFactory({
          departementCode,
          derniereConnexion: null,
          role: 'gestionnaire_departement',
          ssoId: 'martin.tartempion@example.net',
          telephone: '',
        })
      )
    })

    it('qui existe déjà par son ssoEmail : il est réactivé', async () => {
      // GIVEN
      await creerUnUtilisateur({ isSupprime: true, ssoEmail: 'martin.tartempion@example.net' })
      const utilisateur = utilisateurFactory({
        uid: { email: 'martin.tartempion@example.net', value: uidUtilisateurValue },
      })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      expect(resultatCreation).toBe(true)
    })
  })
})
