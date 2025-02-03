import { Prisma } from '@prisma/client'

import { PrismaUtilisateurRepository } from './PrismaUtilisateurRepository'
import {
  creerUnDepartement,
  creerUneRegion,
  creerUneStructure,
  creerUnGroupement,
  creerUnUtilisateur,
  utilisateurRecordFactory,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { departementFactory, utilisateurFactory } from '@/domain/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

const uidUtilisateurValue = 'userFooId'
const uidUtilisateur = new UtilisateurUid({ email: 'martin.tartempion@example.net', value: uidUtilisateurValue })

describe('utilisateur repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('recherche d’un utilisateur', () => {
    const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)

    it('l’utilisateur n’existe pas : pas de donnée', async () => {
      // GIVEN
      const ssoIdInexistant = '6513cfb5-5b46-4188-a71f-5476dfee0e8e'
      await creerUnUtilisateur({ ssoId: ssoIdInexistant })

      // WHEN
      const result = await repository.find(uidUtilisateurValue)

      // THEN
      expect(result).toBeNull()
    })

    it('l’utilisateur est supprimé : pas de donnée', async () => {
      // GIVEN
      await creerUnUtilisateur({ isSupprime: true })

      // WHEN
      const result = await repository.find(uidUtilisateurValue)

      // THEN
      expect(result).toBeNull()
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
        {
          createRecordWith: {
            role: 'instructeur' as const,
          },
          desc: 'pour un instructeur',
          expected: {
            organisation: 'Banque des territoires',
            role: 'Instructeur' as const,
          },
        },
        {
          createRecordWith: {
            role: 'support_animation' as const,
          },
          desc: 'pour un support animation',
          expected: {
            organisation: 'Mednum',
            role: 'Support animation' as const,
          },
        },
        {
          createRecordWith: {
            role: 'pilote_politique_publique' as const,
          },
          desc: 'pour un pilote politique publique',
          expected: {
            organisation: 'France Numérique Ensemble',
            role: 'Pilote politique publique' as const,
          },
        },
      ])('$desc', async ({ createRecordWith, expected }) => {
        // GIVEN
        await creerUneRegion({ code: regionCode })
        await creerUnDepartement({ code: departementCode })
        await creerUnGroupement({ id: groupementId })
        await creerUneStructure({ id: structureId })
        await creerUnUtilisateur({ ...createRecordWith })

        // WHEN
        const result = await repository.find(uidUtilisateurValue)

        // THEN
        expect(result?.state).toStrictEqual(
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
        await creerUnUtilisateur({ derniereConnexion })

        // WHEN
        const result = await repository.find(uidUtilisateurValue)

        // THEN
        expect(result?.state.isActive).toBe(expectedIsActive)
      })
    })
  })

  describe('suppression d’un utilisateur', () => {
    const ssoIdUtilisateurExistant = 'userFooId'
    const ssoIdUtilisateurSupprime = 'adc38b16-b303-487e-b1c0-8d33bcb6d0e6'
    const ssoEmailUtilisateurExistant = 'martin.tartempion@example.net'
    const ssoEmailUtilisateurSupprime = 'martin.tartempion@example.org'
    const utilisateurExistant = {
      ssoEmail: ssoEmailUtilisateurExistant,
      ssoId: ssoIdUtilisateurExistant,
    }
    const utilisateurSupprime = {
      isSupprime: true,
      ssoEmail: ssoEmailUtilisateurSupprime,
      ssoId: ssoIdUtilisateurSupprime,
    }

    it('compte existant, non préalablement supprimé : l’entrée est marquée comme supprimée', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurExistant)
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: ssoIdUtilisateurExistant } }))

      // THEN
      expect(result).toBe(true)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { ssoId: utilisateurExistant.ssoId },
      })
      expect(utilisateurModifie).toMatchObject({
        dateDeCreation: epochTime,
        departementCode: null,
        derniereConnexion: epochTime,
        emailDeContact: 'martin.tartempion@example.net',
        groupementId: null,
        inviteLe: epochTime,
        isSuperAdmin: false,
        isSupprime: true,
        nom: 'Tartempion',
        prenom: 'Martin',
        regionCode: null,
        role: 'instructeur',
        ssoEmail: 'martin.tartempion@example.net',
        ssoId: ssoIdUtilisateurExistant,
        structureId: null,
        telephone: '0102030405',
      })
    })

    it('compte existant, préalablement supprimé : aucune écriture', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurExistant)
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: ssoIdUtilisateurSupprime } }))

      // THEN
      expect(result).toBe(false)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { ssoId: utilisateurExistant.ssoId },
      })
      expect(utilisateurModifie?.isSupprime).toBe(false)
    })

    it('compte inexistant : aucune écriture', async () => {
      // GIVEN
      await creerUnUtilisateur(utilisateurSupprime)

      // WHEN
      const result = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).drop(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: ssoIdUtilisateurExistant } }))

      // THEN
      expect(result).toBe(false)
      const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
        where: { ssoId: utilisateurSupprime.ssoId },
      })
      expect(utilisateurModifie?.isSupprime).toBe(true)
    })

    it('erreur inattendue : non gérée', async () => {
      // GIVEN
      const prismaClientKnownRequestErrorOnUpdateStub = {
        async update(): Promise<never> {
          return Promise.reject(
            new Prisma.PrismaClientKnownRequestError('', { clientVersion: '', code: 'P1000' })
          )
        },
      } as unknown as Prisma.UtilisateurRecordDelegate
      const prismaClientUnknownRequestErrorOnUpdateStub = {
        async update(): Promise<never> {
          return Promise.reject(new Error('error'))
        },
      } as unknown as Prisma.UtilisateurRecordDelegate

      // WHEN
      const unhandledKnownRequestError = new PrismaUtilisateurRepository(prismaClientKnownRequestErrorOnUpdateStub).drop(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: ssoIdUtilisateurExistant } }))

      const unhandledUnknownRequestError = new PrismaUtilisateurRepository(prismaClientUnknownRequestErrorOnUpdateStub).drop(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: ssoIdUtilisateurExistant } }))

      // THEN
      await expect(unhandledKnownRequestError).rejects.toMatchObject({ code: 'P1000' })
      await expect(unhandledUnknownRequestError).rejects.toStrictEqual(new Error('error'))
    })
  })

  describe('mise à jour d’un utilisateur', () => {
    const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)

    it('changement du rôle, du nom, du prénom, de la date d’invitation, de la date de dernière connexion et de l’email', async () => {
      // GIVEN
      const date = epochTime
      await creerUnUtilisateur()

      // WHEN
      await repository.update(
        utilisateurFactory({
          derniereConnexion: date,
          emailDeContact: 'martine.dugenoux@example.org',
          inviteLe: date,
          nom: 'Dugenoux',
          prenom: 'Martine',
          role: 'Instructeur',
          uid: { email: 'martine.dugenoux@example.org', value: uidUtilisateurValue },
        })
      )

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: uidUtilisateurValue,
        },
      })
      expect(updatedRecord?.role).toBe('instructeur')
      expect(updatedRecord?.nom).toBe('Dugenoux')
      expect(updatedRecord?.prenom).toBe('Martine')
      expect(updatedRecord?.emailDeContact).toBe('martine.dugenoux@example.org')
      expect(updatedRecord?.inviteLe).toStrictEqual(date)
      expect(updatedRecord?.derniereConnexion).toStrictEqual(date)
    })
  })

  describe('mise à jour de l’identifiant unique d’un utilisateur', () => {
    it('changement de l’identifiant unique', async () => {
      // GIVEN
      await creerUnUtilisateur({
        ssoEmail: 'martine.dugenoux@example.org',
        ssoId: 'martine.dugenoux@example.org',
      })
      const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)

      // WHEN
      await repository.updateUid(utilisateurFactory({
        uid: { email: 'martine.dugenoux@example.org', value: uidUtilisateurValue },
      }))

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: uidUtilisateurValue,
        },
      })
      expect(updatedRecord?.ssoId).toBe(uidUtilisateurValue)
    })
  })

  describe('ajout d’un utilisateur', () => {
    const repository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    const structureId = 10
    const departementCode = '75'
    const groupementId = 10
    const regionCode = '11'

    it('dont le ssoId n’existe pas : insertion réussie', async () => {
      // GIVEN
      const ssoIdDifferent = '009d2df4-60c7-4704-b8b5-d007b436f681'
      await creerUneRegion({ code: regionCode })
      await creerUnDepartement({ code: departementCode })
      await creerUnGroupement({ id: groupementId })
      await creerUneStructure({ id: structureId })
      const utilisateur = utilisateurFactory({
        departement: departementFactory({ code: departementCode }).state,
        role: 'Gestionnaire département',
        uid: { email: 'martin.tartempion@example.net', value: ssoIdDifferent },
      })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      const createdRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: ssoIdDifferent,
        },
      })
      expect(resultatCreation).toBe(true)
      expect(createdRecord).toMatchObject(utilisateurRecordFactory({
        departementCode,
        derniereConnexion: null,
        role: 'gestionnaire_departement',
        ssoId: ssoIdDifferent,
        telephone: '',
      }))
    })

    it('qui existe déjà par son ssoId : insertion en échec', async () => {
      // GIVEN
      const ssoIdExistant = uidUtilisateurValue
      await creerUnUtilisateur({ ssoId: ssoIdExistant })
      const utilisateur = utilisateurFactory({ uid: { email: 'martin.tartempion@example.net', value: ssoIdExistant } })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      expect(resultatCreation).toBe(false)
    })

    it('erreur non gérée', async () => {
      // GIVEN
      const prismaClientAuthenticationFailedErrorStub = {
        async create(): Promise<never> {
          return Promise.reject(
            new Prisma.PrismaClientKnownRequestError('authentication failed', {
              clientVersion: '',
              code: 'P1000',
            })
          )
        },
      } as unknown as Prisma.UtilisateurRecordDelegate

      const prismaClientGenericErrorStub = {
        async create(): Promise<never> {
          return Promise.reject(new Error('generic error'))
        },
      } as unknown as Prisma.UtilisateurRecordDelegate

      const repositoryGenericError = new PrismaUtilisateurRepository(prismaClientGenericErrorStub)
      const repositoryAuthenticationError = new PrismaUtilisateurRepository(
        prismaClientAuthenticationFailedErrorStub
      )

      const utilisateur = utilisateurFactory()

      // WHEN
      const resultatGenericError = repositoryGenericError.add(utilisateur)
      const resultatAuthenticationError = repositoryAuthenticationError.add(utilisateur)

      // THEN
      await expect(resultatGenericError).rejects.toThrow('generic error')
      await expect(resultatAuthenticationError).rejects.toThrow('authentication failed')
    })
  })
})
