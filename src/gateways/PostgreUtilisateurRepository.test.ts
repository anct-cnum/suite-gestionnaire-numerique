import { Prisma, PrismaClient } from '@prisma/client'

import { PostgreUtilisateurRepository } from './PostgreUtilisateurRepository'
import { departementRecordFactory, epochTime, groupementRecordFactory, regionRecordFactory, structureRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { utilisateurFactory } from '@/domain/testHelper'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

const uidUtilisateurValue = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'
const uidUtilisateur = UtilisateurUid.from(uidUtilisateurValue)

describe('utilisateur repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('recherche d’un utilisateur', () => {
    const repository = new PostgreUtilisateurRepository(prisma)

    it('l’utilisateur n’existe pas : pas de donnée', async () => {
      // GIVEN
      const ssoIdInexistant = '6513cfb5-5b46-4188-a71f-5476dfee0e8e'
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ ssoId: ssoIdInexistant }),
      })

      // WHEN
      const result = await repository.find(uidUtilisateur)

      // THEN
      expect(result).toBeNull()
    })

    it('l’utilisateur est supprimé : pas de donnée', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: true }),
      })

      // WHEN
      const result = await repository.find(uidUtilisateur)

      // THEN
      expect(result).toBeNull()
    })

    describe('l’utilisateur existe : les données utilisateur sont reçues', () => {
      it.each([
        {
          desc: 'pour un gestionnaire département : avec la référence au département',
          organisation: 'Paris',
          role: 'Gestionnaire département' as const,
          roleDataRepresentation: 'gestionnaire_departement' as const,
        },
        {
          desc: 'pour un gestionnaire région : avec la référence à la région',
          organisation: 'Île-de-France',
          role: 'Gestionnaire région' as const,
          roleDataRepresentation: 'gestionnaire_region' as const,
        },
        {
          desc: 'pour un gestionnaire structure : avec la référence à la structure',
          organisation: 'Solidarnum',
          role: 'Gestionnaire structure' as const,
          roleDataRepresentation: 'gestionnaire_structure' as const,
        },
        {
          desc: 'pour un gestionnaire groupement : avec la référence au groupement',
          organisation: 'Hubikoop',
          role: 'Gestionnaire groupement' as const,
          roleDataRepresentation: 'gestionnaire_groupement' as const,
        },
        {
          desc: 'pour un administrateur dispositif',
          organisation: 'Administrateur Dispositif lambda',
          role: 'Administrateur dispositif' as const,
          roleDataRepresentation: 'administrateur_dispositif' as const,
        },
        {
          desc: 'pour un instructeur',
          organisation: 'Banque des territoires',
          role: 'Instructeur' as const,
          roleDataRepresentation: 'instructeur' as const,
        },
        {
          desc: 'pour un support animation',
          organisation: 'Mednum',
          role: 'Support animation' as const,
          roleDataRepresentation: 'support_animation' as const,
        },
        {
          desc: 'pour un pilote politique publique',
          organisation: 'France Numérique Ensemble',
          role: 'Pilote politique publique' as const,
          roleDataRepresentation: 'pilote_politique_publique' as const,
        },
      ])('$desc', async ({ role, roleDataRepresentation, organisation }) => {
        // GIVEN
        const structureId = 10
        const departementCode = '75'
        const groupementId = 10
        const regionCode = '11'
        await prisma.regionRecord.create({
          data: regionRecordFactory({ code: regionCode }),
        })
        await prisma.departementRecord.create({
          data: departementRecordFactory({ code: departementCode }),
        })
        await prisma.groupementRecord.create({
          data: groupementRecordFactory({ id: groupementId }),
        })
        await prisma.structureRecord.create({
          data: structureRecordFactory({ id: structureId }),
        })
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory({
            departementCode,
            groupementId,
            regionCode,
            role: roleDataRepresentation,
            structureId,
          }),
        })

        // WHEN
        const result = await repository.find(uidUtilisateur)

        // THEN
        expect(result?.equals(utilisateurFactory({ organisation, role, telephone: '', uid: uidUtilisateurValue })))
          .toBe(true)
      })
    })
  })

  describe('suppression d’un utilisateur', () => {
    const ssoIdUtilisateurExistant = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'
    const ssoIdUtilisateurSupprime = 'adc38b16-b303-487e-b1c0-8d33bcb6d0e6'
    const utilisateurExistant = utilisateurRecordFactory({ ssoId: ssoIdUtilisateurExistant })
    const utilisateurSupprime = utilisateurRecordFactory({ isSupprime: true, ssoId: ssoIdUtilisateurSupprime })

    describe.each([
      {
        desc: 'par identifiant de l’utilisateur',
        dropFn: async (repository: UtilisateurRepository, uid: string): Promise<boolean> =>
          repository.dropByUid(UtilisateurUid.from(uid)),
      },
      {
        desc: 'par utilisateur',
        dropFn: async (repository: UtilisateurRepository, uid: string): Promise<boolean> =>
          repository.drop(utilisateurFactory({ uid })),
      },
    ])('$desc', ({ dropFn }) => {

      it('compte existant, non préalablement supprimé : l’entrée est marquée comme supprimée', async () => {
        // GIVEN
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory(utilisateurExistant),
        })
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory(utilisateurSupprime),
        })

        // WHEN
        const result = await dropFn(new PostgreUtilisateurRepository(prisma), ssoIdUtilisateurExistant)

        // THEN
        expect(result).toBe(true)
        const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
          where: { ssoId: utilisateurExistant.ssoId },
        })
        expect(utilisateurModifie).toMatchObject({
          dateDeCreation: epochTime,
          departementCode: null,
          derniereConnexion: epochTime,
          email: 'martin.tartempion@example.net',
          groupementId: null,
          inviteLe: epochTime,
          isSuperAdmin: false,
          isSupprime: true,
          nom: 'Tartempion',
          prenom: 'Martin',
          regionCode: null,
          role: 'instructeur',
          ssoId: ssoIdUtilisateurExistant,
          structureId: null,
          telephone: '0102030405',
        })
      })

      it('compte existant, préalablement supprimé : aucune écriture', async () => {
        // GIVEN
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory(utilisateurExistant),
        })
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory(utilisateurSupprime),
        })

        // WHEN
        const result = await dropFn(new PostgreUtilisateurRepository(prisma), ssoIdUtilisateurSupprime)

        // THEN
        expect(result).toBe(false)
        const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
          where: { ssoId: utilisateurExistant.ssoId },
        })
        expect(utilisateurModifie?.isSupprime).toBe(false)
      })

      it('compte inexistant : aucune écriture', async () => {
        // GIVEN
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory(utilisateurSupprime),
        })

        // WHEN
        const result = await dropFn(new PostgreUtilisateurRepository(prisma), ssoIdUtilisateurExistant)

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
          utilisateurRecord: {
            async update(): Promise<never> {
              return Promise.reject(new Prisma.PrismaClientKnownRequestError('', { clientVersion: '', code: 'P1000' }))
            },
          },
        } as unknown as typeof prisma
        const prismaClientUnknownRequestErrorOnUpdateStub = {
          utilisateurRecord: {
            async update(): Promise<never> {
              return Promise.reject(new Error('error'))
            },
          },
        } as unknown as typeof prisma

        // WHEN
        const unhandledKnownRequestError = dropFn(
          new PostgreUtilisateurRepository(prismaClientKnownRequestErrorOnUpdateStub),
          ssoIdUtilisateurExistant
        )
        const unhandledUnknownRequestError = dropFn(
          new PostgreUtilisateurRepository(prismaClientUnknownRequestErrorOnUpdateStub),
          ssoIdUtilisateurExistant
        )

        // THEN
        await expect(unhandledKnownRequestError).rejects.toMatchObject({ code: 'P1000' })
        await expect(unhandledUnknownRequestError).rejects.toStrictEqual(new Error('error'))
      })
    })
  })

  describe('mise à jour d’un utilisateur', () => {
    const repository = new PostgreUtilisateurRepository(prisma)

    it('changement du rôle, du nom, du prénom et de l’email', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory(),
      })

      // WHEN
      await repository.update(utilisateurFactory({
        email: 'martine.dugenoux@example.org',
        nom: 'Dugenoux',
        prenom: 'Martine',
        role: 'Instructeur',
        uid: uidUtilisateurValue,
      }))

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: uidUtilisateurValue,
        },
      })
      expect(updatedRecord?.role).toBe('instructeur')
      expect(updatedRecord?.nom).toBe('Dugenoux')
      expect(updatedRecord?.prenom).toBe('Martine')
      expect(updatedRecord?.email).toBe('martine.dugenoux@example.org')
    })
  })

  describe('ajout d’un utilisateur', () => {
    const repository = new PostgreUtilisateurRepository(prisma)

    it('dont le ssoId n’existe pas : insertion réussie', async () => {
      // GIVEN
      const ssoIdDifferent = '009d2df4-60c7-4704-b8b5-d007b436f681'
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory(),
      })
      const utilisateur = utilisateurFactory({ uid: ssoIdDifferent })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      const createdRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: ssoIdDifferent,
        },
      })
      expect(resultatCreation).toBe(true)
      const utilisateurRecord = utilisateurRecordFactory({ derniereConnexion: null, ssoId: ssoIdDifferent, telephone: '' })
      expect(createdRecord).toMatchObject(utilisateurRecord)
    })

    it('qui existe déjà par son ssoId : insertion en échec', async () => {
      // GIVEN
      const ssoIdExistant = uidUtilisateurValue
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ ssoId: ssoIdExistant }),
      })
      const utilisateur = utilisateurFactory({ uid: ssoIdExistant })

      // WHEN
      const resultatCreation = await repository.add(utilisateur)

      // THEN
      expect(resultatCreation).toBe(false)
    })

    it('erreur non gérée', async () => {
      // GIVEN
      const prismaClientAuthenticationFailedErrorStub = {
        utilisateurRecord: {
          async create(): Promise<never> {
            return Promise.reject(new Prisma.PrismaClientKnownRequestError('authentication failed', { clientVersion: '', code: 'P1000' }))
          },
        },
      } as unknown as PrismaClient

      const prismaClientGenericErrorStub = {
        utilisateurRecord: {
          async create(): Promise<never> {
            return Promise.reject(new Error('generic error'))
          },
        },
      } as unknown as PrismaClient

      const repositoryGenericError = new PostgreUtilisateurRepository(prismaClientGenericErrorStub)
      const repositoryAuthenticationError = new PostgreUtilisateurRepository(prismaClientAuthenticationFailedErrorStub)

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
