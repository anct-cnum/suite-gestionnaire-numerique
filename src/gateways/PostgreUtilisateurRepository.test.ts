import { Prisma } from '@prisma/client'

import { NullSuppressionUtilisateurGateway, PostgreUtilisateurRepository } from './PostgreUtilisateurRepository'
import prisma from '../../prisma/prismaClient'
import { Utilisateur } from '@/domain/Utilisateur'
import { SuppressionUtilisateurGateway } from '@/use-cases/commands/SupprimerMonCompte'

const uidUtilisateur = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'

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
          organisation: 'Rhône',
          role: 'Gestionnaire département' as const,
          roleDataRepresentation: 'gestionnaire_departement' as const,
        },
        {
          desc: 'pour un gestionnaire région : avec la référence à la région',
          organisation: 'Auvergne-Rhône-Alpes',
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
        await prisma.structureRecord.create({
          data: {
            id: 10,
            idMongo: '123456',
            nom: 'Solidarnum',
          },
        })
        await prisma.groupementRecord.create({
          data: {
            id: 10,
            nom: 'Hubikoop',
          },
        })
        await prisma.regionRecord.create({
          data: {
            code: '84',
            nom: 'Auvergne-Rhône-Alpes',
          },
        })
        await prisma.departementRecord.create({
          data: {
            code: '69',
            nom: 'Rhône',
            regionCode: '84',
          },
        })
        await prisma.utilisateurRecord.create({
          data: utilisateurRecordFactory({
            departementCode: '69',
            groupementId: 10,
            regionCode: '84',
            role: roleDataRepresentation,
            structureId: 10,
          }),
        })

        // WHEN
        const result = await repository.find(uidUtilisateur)

        // THEN
        expect(result?.equals(utilisateurFactory({ organisation, role, uid: uidUtilisateur }))).toBe(true)
      })
    })
  })

  describe('suppression d’un utilisateur', () => {
    const ssoIdUtilisateurExistant = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'

    it('la suppression est lancée avec un mécanisme sous-jacent qui réussit, le résultat est en succès', async () => {
      // GIVEN
      const suppressionReussieGatewayStub = new (class implements SuppressionUtilisateurGateway {
        async delete(): Promise<boolean> {
          return Promise.resolve(true)
        }
      })()
      const repository = new PostgreUtilisateurRepository(prisma, suppressionReussieGatewayStub)

      // WHEN
      const result = await repository.drop(utilisateurFactory({ uid: ssoIdUtilisateurExistant }))

      // THEN
      expect(result).toBe(true)
    })

    it('la suppression est lancée avec un mécanisme sous-jacent qui échoue, le résultat est en échec', async () => {
      // GIVEN
      const suppressionEchoueeGatewayStub = new (class implements SuppressionUtilisateurGateway {
        async delete(): Promise<boolean> {
          return Promise.resolve(false)
        }
      })()
      const repository = new PostgreUtilisateurRepository(prisma, suppressionEchoueeGatewayStub)

      // WHEN
      const result = await repository.drop(utilisateurFactory({ uid: ssoIdUtilisateurExistant }))

      // THEN
      expect(result).toBe(false)
    })

    it('la suppression sans mécanisme sous-jacent, le résultat est en échec', async () => {
      // GIVEN
      const repository = new PostgreUtilisateurRepository(prisma)

      // WHEN
      const result = await repository.drop(utilisateurFactory({ uid: ssoIdUtilisateurExistant }))

      // THEN
      expect(result).toBe(false)
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
      }))

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: uidUtilisateur,
        },
      })
      expect(updatedRecord?.role).toBe('instructeur')
      expect(updatedRecord?.nom).toBe('Dugenoux')
      expect(updatedRecord?.prenom).toBe('Martine')
      expect(updatedRecord?.email).toBe('martine.dugenoux@example.org')
    })
  })

  describe('ajout d’un utilisateur', () => {
    const repository = new PostgreUtilisateurRepository(
      prisma,
      new NullSuppressionUtilisateurGateway(),
      () => new Date(0)
    )

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
      const utilisateurRecord = utilisateurRecordFactory({ ssoId: ssoIdDifferent, telephone: '' })
      expect(createdRecord).toMatchObject(utilisateurRecord)
    })

    it('qui existe déjà par son ssoId : insertion en échec', async () => {
      // GIVEN
      const ssoIdExistant = uidUtilisateur
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
      vi.spyOn(repository, 'add')
        .mockRejectedValueOnce('generic error')
        .mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('authentication failed', { clientVersion: '', code: 'P1000' }))

      const utilisateur = utilisateurFactory()

      // WHEN
      const resultatGenericError = repository.add(utilisateur)
      const resultatAuthenticationError = repository.add(utilisateur)

      // THEN
      await expect(resultatGenericError).rejects.toThrow('generic error')
      await expect(resultatAuthenticationError).rejects.toThrow('authentication failed')
    })
  })
})

function utilisateurRecordFactory(
  override: Partial<Prisma.UtilisateurRecordUncheckedCreateInput> = {}
): Prisma.UtilisateurRecordUncheckedCreateInput {
  return {
    dateDeCreation: new Date(0),
    email: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSuperAdmin: true,
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'support_animation',
    ssoId: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    telephone: '0102030405',
    ...override,
  }
}

function utilisateurFactory(
  override: Partial<Parameters<typeof Utilisateur.create>[0]> = {}
): Utilisateur {
  return Utilisateur.create({
    email: 'martin.tartempion@example.net',
    isSuperAdmin: true,
    nom: 'Tartempion',
    organisation: 'Mednum',
    prenom: 'Martin',
    role: 'Support animation',
    uid: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    ...override,
  })
}
