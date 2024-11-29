import { PrismaUtilisateurLoader } from './PrismaUtilisateurLoader'
import { departementRecordFactory, epochTime, groupementRecordFactory, regionRecordFactory, structureRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('prisma utilisateur query', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('chercher un utilisateur', () => {
    it.each([
      {
        isGestionnaireDepartement: false,
        role: 'administrateur_dispositif',
        roleReadModel: {
          categorie: 'anct',
          groupe: 'admin',
          nom: 'Administrateur dispositif',
          organisation: 'Administrateur dispositif',
          rolesGerables: Roles,
        },
      },
      {
        isGestionnaireDepartement: true,
        role: 'gestionnaire_departement',
        roleReadModel: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire département',
          organisation: 'Paris',
          rolesGerables: ['Gestionnaire département'],
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_groupement',
        roleReadModel: {
          categorie: 'groupement',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire groupement',
          organisation: 'Hubikoop',
          rolesGerables: ['Gestionnaire groupement'],
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_region',
        roleReadModel: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire région',
          organisation: 'Île-de-France',
          rolesGerables: ['Gestionnaire région'],
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_structure',
        roleReadModel: {
          categorie: 'structure',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['Gestionnaire structure'],
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'instructeur',
        roleReadModel: {
          categorie: 'bdt',
          groupe: 'admin',
          nom: 'Instructeur',
          organisation: 'Banque des territoires',
          rolesGerables: Roles,
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'pilote_politique_publique',
        roleReadModel: {
          categorie: 'anct',
          groupe: 'admin',
          nom: 'Pilote politique publique',
          organisation: 'France Numérique Ensemble',
          rolesGerables: Roles,
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'support_animation',
        roleReadModel: {
          categorie: 'mednum',
          groupe: 'admin',
          nom: 'Support animation',
          organisation: 'Mednum',
          rolesGerables: Roles,
        },
      },
    ] as const)('quand je cherche un utilisateur $roleReadModel.nom qui existe par son ssoId alors je le trouve', async ({ isGestionnaireDepartement, role, roleReadModel }) => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await prisma.regionRecord.create({
        data: regionRecordFactory(),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory(),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory(),
      })
      await prisma.groupementRecord.create({
        data: groupementRecordFactory(),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({
          departementCode: '75',
          groupementId: 10,
          regionCode: '11',
          role,
          ssoId: ssoIdExistant,
          structureId: 10,
        }),
      })
      const utilisateurLoader = new PrismaUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel = await utilisateurLoader.findByUid(ssoIdExistant)

      // THEN
      expect(utilisateurReadModel).toStrictEqual<UnUtilisateurReadModel>({
        departementCode: '75',
        derniereConnexion: epochTime,
        email: 'martin.tartempion@example.net',
        groupementId: 10,
        inviteLe: epochTime,
        isActive: true,
        isGestionnaireDepartement,
        isSuperAdmin: false,
        nom: 'Tartempion',
        prenom: 'Martin',
        regionCode: '11',
        role: roleReadModel,
        structureId: 10,
        telephone: '0102030405',
        uid: ssoIdExistant,
      })
    })

    it('quand je cherche un utilisateur qui n’existe pas par son ssoId alors je ne le trouve pas', async () => {
      // GIVEN
      const ssoIdInexistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ ssoId: '1234567890' }),
      })
      const utilisateurLoader = new PrismaUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel =
        async (): Promise<UnUtilisateurReadModel> => utilisateurLoader.findByUid(ssoIdInexistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
    })

    it('quand je cherche un utilisateur qui existe par son ssoId et dont le compte a été supprimé alors je ne le trouve pas', async () => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: true, ssoId: ssoIdExistant }),
      })
      const utilisateurLoader = new PrismaUtilisateurLoader(prisma)

      // WHEN
      const utilisateurReadModel =
        async (): Promise<UnUtilisateurReadModel> => utilisateurLoader.findByUid(ssoIdExistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
    })
  })

  describe('chercher mes utilisateurs', () => {
    it('étant admin quand je cherche mes utilisateurs alors je les trouve tous indépendamment de leur rôle rangé par ordre alphabétique', async () => {
      // GIVEN
      await prisma.groupementRecord.create({
        data: groupementRecordFactory(),
      })
      await prisma.regionRecord.create({
        data: regionRecordFactory(),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory(),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory(),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', role: 'administrateur_dispositif', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({
          departementCode: '75',
          nom: 'dupont',
          role: 'gestionnaire_departement',
          ssoEmail: 'martin.tartempion2@example.net',
          ssoId: '123456',
        }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel).toStrictEqual<UtilisateursCourantsEtTotalReadModel>({
        total: 2,
        utilisateursCourants: [
          {
            departementCode: '75',
            derniereConnexion: epochTime,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: epochTime,
            isActive: true,
            isGestionnaireDepartement: true,
            isSuperAdmin: false,
            nom: 'dupont',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'maille',
              groupe: 'gestionnaire',
              nom: 'Gestionnaire département',
              organisation: 'Paris',
              rolesGerables: ['Gestionnaire département'],
            },
            structureId: null,
            telephone: '0102030405',
            uid: '123456',
          },
          {
            departementCode: null,
            derniereConnexion: epochTime,
            email: 'martin.tartempion@example.net',
            groupementId: null,
            inviteLe: epochTime,
            isActive: true,
            isGestionnaireDepartement: false,
            isSuperAdmin: false,
            nom: 'Tartempion',
            prenom: 'Martin',
            regionCode: null,
            role: {
              categorie: 'anct',
              groupe: 'admin',
              nom: 'Administrateur dispositif',
              organisation: 'Administrateur dispositif',
              rolesGerables: Roles,
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
      const regionCode = '84'
      const departementCode = '69'
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        departementCode,
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire département',
          organisation: 'Rhône',
          rolesGerables: [],
        },
        uid: ssoId,
      })
      await prisma.regionRecord.create({
        data: regionRecordFactory({ code: regionCode }),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: departementCode, regionCode }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode, nom: 'Tartempion', role: 'gestionnaire_departement', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode, nom: 'Dupont', role: 'gestionnaire_departement', ssoEmail: 'alois.leroy@example.com', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'martin.tartempion@example.fr', ssoId: 'fakeSsoId' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('123456')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].role.nom).toBe('Gestionnaire département')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].role.nom).toBe('Gestionnaire département')
    })

    it('étant gestionnaire région quand je cherche mes utilisateurs alors je trouve tous ceux qui ont la même région', async () => {
      // GIVEN
      const regionCode = '84'
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        regionCode,
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire région',
          organisation: 'Auvergne-Rhône-Alpes',
          rolesGerables: [],
        },
        uid: ssoId,
      })
      await prisma.regionRecord.create({
        data: regionRecordFactory({ code: regionCode }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', regionCode, role: 'gestionnaire_region', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', regionCode, role: 'gestionnaire_region', ssoEmail: 'martin.tartempion@example.org', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'fakeSsoEmail@example.com', ssoId: 'fakeSsoId' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('123456')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].role.nom).toBe('Gestionnaire région')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].role.nom).toBe('Gestionnaire région')
    })

    it('étant gestionnaire groupement quand je cherche mes utilisateurs alors je trouve tous ceux qui ont le même groupement', async () => {
      // GIVEN
      const groupementId = 10
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        groupementId,
        role: {
          categorie: 'groupement',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire groupement',
          organisation: 'Hubikoop',
          rolesGerables: [],
        },
        uid: ssoId,
      })
      await prisma.groupementRecord.create({
        data: groupementRecordFactory({ id: groupementId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ groupementId, nom: 'Tartempion', role: 'gestionnaire_groupement', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ groupementId, nom: 'Dupont', role: 'gestionnaire_groupement', ssoEmail: 'martin.tartempion@example.com', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'fakeSsoEmail@example.com', ssoId: 'fakeSsoId' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('123456')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].role.nom).toBe('Gestionnaire groupement')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].role.nom).toBe('Gestionnaire groupement')
    })

    it('étant gestionnaire structure quand je cherche mes utilisateurs alors je trouve tous ceux qui ont la même structure', async () => {
      // GIVEN
      const structureId = 1
      const utilisateurAuthentifie = utilisateurReadModelFactory({
        role: {
          categorie: 'structure',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['Gestionnaire structure'],
        },
        structureId,
        uid: ssoId,
      })
      await prisma.regionRecord.create({
        data: regionRecordFactory(),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory(),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory({ id: structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', role: 'gestionnaire_structure', ssoId, structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', role: 'gestionnaire_structure', ssoEmail: 'martin.tartempion@example.org', ssoId: '123456', structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'fakeSsoEmail@example.com', ssoId: 'fakeSsoId' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('123456')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].role.nom).toBe('Gestionnaire structure')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].role.nom).toBe('Gestionnaire structure')
    })

    it('quand je cherche mes utilisateurs de la page 2 alors je les trouve tous', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Dupont', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' }),
      })
      const pageCourante = 1
      const utilisateursParPage = 1

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(1)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
    })

    it('quand je cherche mes utilisateurs alors je les trouve sauf ceux supprimés', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: false, ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ isSupprime: true, ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(1)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(1)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].isActive).toBe(true)
    })

    it('quand je cherche mes utilisateurs alors je distingue ceux inactifs', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: new Date('2024-01-01'), nom: 'a', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: null, nom: 'b', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.utilisateursCourants[1].derniereConnexion).toStrictEqual(epochTime)
      expect(mesUtilisateursReadModel.utilisateursCourants[1].isActive).toBe(false)
    })

    it('quand je cherche mes utilisateurs actifs alors je trouve tous ceux qui sont actifs', async () => {
      // GIVEN
      const derniereConnexion = new Date('2024-01-01')
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion, nom: 'a', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ derniereConnexion: null, nom: 'b', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' }),
      })
      const isActive = true

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(1)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(1)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].isActive).toBe(true)
    })

    it('quand je cherche mes utilisateurs par rôles alors je trouve tous ceux qui ont ces rôles', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'a', role: 'administrateur_dispositif', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'b', role: 'instructeur', ssoEmail: 'marcus.florent@example.com', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'c', role: 'gestionnaire_structure', ssoEmail: 'nicolas.james@example.com', ssoId: '67890' }),
      })
      const roles = ['administrateur_dispositif', 'gestionnaire_structure']

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].role.nom).toBe('Administrateur dispositif')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('67890')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].role.nom).toBe('Gestionnaire structure')
    })

    it('quand je cherche mes utilisateurs par un département alors je trouve tous ceux qui ont ce département', async () => {
      // GIVEN
      const codeDepartement = '93'
      await prisma.regionRecord.create({
        data: regionRecordFactory(),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: codeDepartement }),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: '75' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode: codeDepartement, nom: 'a', ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode: '75', nom: 'b', ssoEmail: 'nicolas.james@example.com', ssoId: '123456' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(1)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(1)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].departementCode).toBe('93')
    })

    it('quand je cherche mes utilisateurs par une région alors je trouve ceux qui ont cette région et tous les départements liés à cette région', async () => {
      // GIVEN
      const codeRegion = '11'
      await prisma.regionRecord.create({
        data: regionRecordFactory({ code: codeRegion }),
      })
      await prisma.regionRecord.create({
        data: regionRecordFactory({ code: '21' }),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: '75' }),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: '10', regionCode: '21' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'a', regionCode: codeRegion, ssoId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'b', regionCode: '21', ssoEmail: 'kevin.durand@example.com', ssoId: '123456' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode: '75', nom: 'c', ssoEmail: 'jean.lebrun@example.com', ssoId: '67890' }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ departementCode: '10', nom: 'D', ssoEmail: 'anthony.parquet@example.com', ssoId: 'azerty' }),
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].regionCode).toBe('11')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('67890')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].departementCode).toBe('75')
    })

    it('quand des utilisateurs sont recherchés par structure, alors tous ceux qui lui appartiennent sont trouvés', async () => {
      // GIVEN
      const structureId = 14
      await prisma.regionRecord.create({
        data: regionRecordFactory({ code: '93', nom: 'Provence-Alpes-Côte d’Azur' }),
      })
      await prisma.regionRecord.create({ data: regionRecordFactory() })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: '06', nom: 'Alpes-Maritimes', regionCode: '93' }),
      })
      await prisma.departementRecord.create({
        data: departementRecordFactory({ code: '93', nom: 'Seine-Saint-Denis' }),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory({
          departementCode: '06',
          id: structureId,
          nom: 'TETRIS',
        }),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory({
          departementCode: '93',
          id: 416,
          nom: 'GRAND PARIS GRAND EST',
        }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({ nom: 'Tartempion', prenom: 'Martin', structureId }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({
          nom: 'Dugenoux',
          prenom: 'Martine',
          ssoId: 'd6895238-e15b-43a6-9868-5d21ae29490e',
          structureId: 416,
        }),
      })
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory({
          nom: 'Duchmolle',
          prenom: 'Martine',
          ssoId: '31512478-64eb-4993-af47-a728ec4d8e06',
          structureId,
        }),
      })
      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.findMesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(2)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(2)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('31512478-64eb-4993-af47-a728ec4d8e06')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('8e39c6db-2f2a-45cf-ba65-e2831241cbe4')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].structureId).toBe(structureId)
      expect(mesUtilisateursReadModel.utilisateursCourants[1].structureId).toBe(structureId)
    })

    const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const pageCourante = 0
    const utilisateursParPage = 10
    const isActive = false
    const utilisateurAuthentifie = utilisateurReadModelFactory({
      uid: ssoId,
    })
    const roles: ReadonlyArray<string> = []
    const utilisateurLoader = new PrismaUtilisateurLoader(prisma)
    const codeDepartement = '0'
    const codeRegion = '0'
  })
})
