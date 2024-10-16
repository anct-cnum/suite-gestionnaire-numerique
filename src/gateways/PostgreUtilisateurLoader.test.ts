import { Prisma, Role } from '@prisma/client'

import { PostgreUtilisateurLoader } from './PostgreUtilisateurLoader'
import prisma from '../../prisma/prismaClient'
import { Categorie, Groupe, TypologieRole } from '@/domain/Role'
import { UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

describe('postgre utilisateur query', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('chercher un utilisateur', () => {
    it.each([
      {
        departementCode: null,
        groupementId: null,
        regionCode: null,
        role: 'administrateur_dispositif' as Role,
        roleReadModel: {
          categorie: 'anct' as Categorie,
          groupe: 'admin' as Groupe,
          nom: 'Administrateur dispositif' as TypologieRole,
          territoireOuStructure: 'Administrateur Dispositif lambda',
        },
        structureId: null,
      },
      {
        departementCode: '69',
        groupementId: null,
        regionCode: null,
        role: 'gestionnaire_departement' as Role,
        roleReadModel: {
          categorie: 'maille' as Categorie,
          groupe: 'gestionnaire' as Groupe,
          nom: 'Gestionnaire département' as TypologieRole,
          territoireOuStructure: 'Rhône',
        },
        structureId: null,
      },
      {
        departementCode: null,
        groupementId: 10,
        regionCode: null,
        role: 'gestionnaire_groupement' as Role,
        roleReadModel: {
          categorie: 'groupement' as Categorie,
          groupe: 'gestionnaire' as Groupe,
          nom: 'Gestionnaire groupement' as TypologieRole,
          territoireOuStructure: 'Hubikoop',
        },
        structureId: null,
      },
      {
        departementCode: null,
        groupementId: null,
        regionCode: '84',
        role: 'gestionnaire_region' as Role,
        roleReadModel: {
          categorie: 'maille' as Categorie,
          groupe: 'gestionnaire' as Groupe,
          nom: 'Gestionnaire région' as TypologieRole,
          territoireOuStructure: 'Auvergne-Rhône-Alpes',
        },
        structureId: null,
      },
      {
        departementCode: null,
        groupementId: null,
        regionCode: null,
        role: 'gestionnaire_structure' as Role,
        roleReadModel: {
          categorie: 'structure' as Categorie,
          groupe: 'gestionnaire' as Groupe,
          nom: 'Gestionnaire structure' as TypologieRole,
          territoireOuStructure: 'Solidarnum',
        },
        structureId: 10,
      },
      {
        departementCode: null,
        groupementId: null,
        regionCode: null,
        role: 'instructeur' as Role,
        roleReadModel: {
          categorie: 'bdt' as Categorie,
          groupe: 'admin' as Groupe,
          nom: 'Instructeur' as TypologieRole,
          territoireOuStructure: 'Banque des territoires',
        },
        structureId: null,
      },
      {
        departementCode: null,
        groupementId: null,
        regionCode: null,
        role: 'pilote_politique_publique' as Role,
        roleReadModel: {
          categorie: 'anct' as Categorie,
          groupe: 'admin' as Groupe,
          nom: 'Pilote politique publique' as TypologieRole,
          territoireOuStructure: 'France Numérique Ensemble',
        },
        structureId: null,
      },
      {
        departementCode: null,
        groupementId: null,
        regionCode: null,
        role: 'support_animation' as Role,
        roleReadModel: {
          categorie: 'mednum' as Categorie,
          groupe: 'admin' as Groupe,
          nom: 'Support animation' as TypologieRole,
          territoireOuStructure: 'Mednum',
        },
        structureId: null,
      },
    ])('quand je cherche un utilisateur $roleReadModel.nom qui existe par son ssoId alors je le trouve', async ({ departementCode, groupementId, regionCode, role, roleReadModel, structureId }) => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
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
          departementCode,
          groupementId,
          regionCode,
          role,
          ssoId: ssoIdExistant,
          structureId,
        }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel = await postgreUtilisateurLoader.findByUid(ssoIdExistant)

      // THEN
      expect(utilisateurReadModel).toStrictEqual<UnUtilisateurReadModel>({
        departementCode,
        derniereConnexion: new Date(0),
        email: 'martin.tartempion@example.net',
        groupementId,
        inviteLe: new Date(0),
        isActive: true,
        isSuperAdmin: false,
        nom: 'Tartempion',
        prenom: 'Martin',
        regionCode,
        role: roleReadModel,
        structureId,
        telephone: '0102030405',
        uid: ssoIdExistant,
      })
    })

    it('quand je cherche un utilisateur qui n’existe pas par son ssoId alors je ne le trouve pas', async () => {
      // GIVEN
      const ssoIdInexistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const date = new Date()
      await prisma.utilisateurRecord.create({
        data: {
          dateDeCreation: date,
          email: 'martin.tartempion@example.net',
          inviteLe: date,
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'administrateur_dispositif',
          ssoId: '1234567890',
        },
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel = async () => postgreUtilisateurLoader.findByUid(ssoIdInexistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
    })

    it('quand je cherche un utilisateur qui existe par son ssoId et dont le compte a été supprimé alors je ne le trouve pas', async () => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: true, ssoId: ssoIdExistant }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel = async () => postgreUtilisateurLoader.findByUid(ssoIdExistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
    })
  })

  describe('chercher mes utilisateurs', () => {
    it('étant admin quand je cherche mes utilisateurs alors je les trouve tous indépendamment de leur rôle rangé par ordre alphabétique', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const date = new Date(0)
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        uid: ssoId,
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', role: 'administrateur_dispositif', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'dupont', role: 'gestionnaire_departement', ssoId: '123456' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
        await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(utilisateurAuthentifie, 0, 10, false)

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'dupont',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire département',
              territoireOuStructure: '',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'anct',
              groupe: 'admin',
              nom: 'Administrateur dispositif',
              territoireOuStructure: 'Administrateur Dispositif lambda',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('étant gestionnaire département quand je cherche mes utilisateurs alors je trouve tous ceux qui ont le même département', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const regionCode = '84'
      const departementCode = '69'
      const date = new Date(0)
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        departementCode,
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire département',
          territoireOuStructure: 'Rhône',
        },
        uid: ssoId,
      })
      await prisma.regionRecord.create({
        data: {
          code: regionCode,
          nom: 'Auvergne-Rhône-Alpes',
        },
      })
      await prisma.departementRecord.create({
        data: {
          code: departementCode,
          nom: 'Rhône',
          regionCode,
        },
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode, nom: 'Tartempion', role: 'gestionnaire_departement', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode, nom: 'Dupont', role: 'gestionnaire_departement', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoId: 'fakeSsoId' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
        await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(utilisateurAuthentifie, 0, 10, false)

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: '69',
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Dupont',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire département',
              territoireOuStructure: 'Rhône',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: '69',
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire département',
              territoireOuStructure: 'Rhône',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('étant gestionnaire région quand je cherche mes utilisateurs alors je trouve tous ceux qui ont la même région', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const regionCode = '84'
      const date = new Date(0)
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        regionCode,
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire région',
          territoireOuStructure: 'Auvergne-Rhône-Alpes',
        },
        uid: ssoId,
      })
      await prisma.regionRecord.create({
        data: {
          code: regionCode,
          nom: 'Auvergne-Rhône-Alpes',
        },
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', regionCode, role: 'gestionnaire_region', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', regionCode, role: 'gestionnaire_region', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoId: 'fakeSsoId' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
        await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(utilisateurAuthentifie, 0, 10, false)

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Dupont',
            prenom: 'Martin',
            regionCode: '84',
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire région',
              territoireOuStructure: 'Auvergne-Rhône-Alpes',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: '84',
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire région',
              territoireOuStructure: 'Auvergne-Rhône-Alpes',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('étant gestionnaire groupement quand je cherche mes utilisateurs alors je trouve tous ceux qui ont le même groupement', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const groupementId = 10
      const date = new Date(0)
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        groupementId,
        role: {
          categorie: 'groupement',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire groupement',
          territoireOuStructure: 'Hubikoop',
        },
        uid: ssoId,
      })
      await prisma.groupementRecord.create({
        data: {
          id: groupementId,
          nom: 'Hubikoop',
        },
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ groupementId, nom: 'Tartempion', role: 'gestionnaire_groupement', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ groupementId, nom: 'Dupont', role: 'gestionnaire_groupement', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoId: 'fakeSsoId' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
        await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(utilisateurAuthentifie, 0, 10, false)

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: 10,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Dupont',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'groupement',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire groupement',
              territoireOuStructure: 'Hubikoop',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: 10,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'groupement',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire groupement',
              territoireOuStructure: 'Hubikoop',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('étant gestionnaire structure quand je cherche mes utilisateurs alors je trouve tous ceux qui ont la même structure', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const structureId = 1
      const date = new Date(0)
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        role: {
          categorie: 'structure',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire structure',
          territoireOuStructure: 'Solidarnum',
        },
        structureId,
        uid: ssoId,
      })
      await prisma.structureRecord.create({
        data: {
          id: structureId,
          idMongo: '123456',
          nom: 'Solidarnum',
        },
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', role: 'gestionnaire_structure', ssoId, structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', role: 'gestionnaire_structure', ssoId: '123456', structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoId: 'fakeSsoId' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
        await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(utilisateurAuthentifie, 0, 10, false)

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Dupont',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'structure',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire structure',
              territoireOuStructure: 'Solidarnum',
            },
            structureId: 1,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: null,
            derniereConnexion: date,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: date,
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'structure',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire structure',
              territoireOuStructure: 'Solidarnum',
            },
            structureId: 1,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('quand je cherche mes utilisateurs de la page 2 alors je les trouve tous', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        uid: ssoId,
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', ssoId: '123456' }),
      })
      const pageCourante = 1
      const utilisateursParPage = 1
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel =
          await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(
            utilisateurAuthentifie,
            pageCourante,
            utilisateursParPage,
            false
          )

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants:
        [
          {
            departementCode: null,
            derniereConnexion: new Date(0),
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: new Date(0),
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'anct',
              groupe: 'admin',
              nom: 'Administrateur dispositif',
              territoireOuStructure: 'Administrateur Dispositif lambda',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('quand je cherche mes utilisateurs alors je les trouve sauf ceux supprimés', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        uid: ssoId,
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: false, ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: true, ssoId: '123456' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel = await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        0,
        10,
        false
      )

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 1,
        utilisateursCourants:
        [
          {
            departementCode: null,
            derniereConnexion: new Date(0),
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: new Date(0),
            isActive: true,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'anct',
              groupe: 'admin',
              nom: 'Administrateur dispositif',
              territoireOuStructure: 'Administrateur Dispositif lambda',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })

    it('quand je cherche mes utilisateurs alors je distingue ceux inactifs', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        uid: ssoId,
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: new Date('2024-01-01'), nom: 'a', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: null, nom: 'b', ssoId: '123456' }),
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel = await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        0,
        10,
        false
      )

      // THEN
      expect(mesUtilisateursReadModel.utilisateursCourants[1].derniereConnexion).toStrictEqual(new Date(0))
      expect(mesUtilisateursReadModel.utilisateursCourants[1].isActive).toBe(false)
    })

    it('quand je cherche mes utilisateurs actifs alors je les trouve tous', async () => {
      // GIVEN
      const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const derniereConnexion = new Date('2024-01-01')
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion, nom: 'a', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: null, nom: 'b', ssoId: '123456' }),
      })
      const pageCourante = 0
      const utilisateursParPage = 10
      const isActive = true
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        uid: ssoId,
      })
      const postgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)

      // WHEN
      const mesUtilisateursReadModel = await postgreUtilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive
      )

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 1,
        utilisateursCourants: [
          {
            departementCode: null,
            derniereConnexion,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: new Date(0),
            isActive: true,
            isSuperAdmin: false,
            nom: 'a',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'anct',
              groupe: 'admin',
              nom: 'Administrateur dispositif',
              territoireOuStructure: 'Administrateur Dispositif lambda',
            },
            structureId: null,
            telephone: '0102030405',
            uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
          },
        ],
      })
    })
  })
})

function utilisateurRecordFactory(
  override: Partial<Prisma.UtilisateurRecordUncheckedCreateInput>
): Prisma.UtilisateurRecordUncheckedCreateInput {
  const date = new Date(0)

  return {
    dateDeCreation: date,
    departementCode: null,
    derniereConnexion: date,
    email: 'martin.tartempion@example.net',
    groupementId: null,
    inviteLe: date,
    isSuperAdmin: false,
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    regionCode: null,
    role: 'administrateur_dispositif',
    ssoId: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
    structureId: null,
    telephone: '0102030405',
    ...override,
  }
}

function utilisateurReadModelFactory(
  override: Partial<UnUtilisateurReadModel>
): UnUtilisateurReadModel {
  const date = new Date(0)

  return {
    departementCode: null,
    derniereConnexion: date,
    email: 'martin.tartempion@example.net',
    groupementId: null,
    inviteLe: date,
    isActive: true,
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    regionCode: null,
    role: {
      categorie: 'anct',
      groupe: 'admin',
      nom: 'Administrateur dispositif',
      territoireOuStructure: '',
    },
    structureId: null,
    telephone: '0102030405',
    uid: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
    ...override,
  }
}
