import { PrismaUtilisateurLoader } from './PrismaUtilisateurLoader'
import { creerUnDepartement, creerUneRegion, creerUneStructure, creerUnGroupement, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { epochTime } from '@/shared/testHelper'
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
          doesItBelongToGroupeAdmin: true,
          nom: 'Administrateur dispositif',
          organisation: 'Administrateur dispositif',
          rolesGerables: Roles,
          type: 'administrateur_dispositif',
        },
      },
      {
        isGestionnaireDepartement: true,
        role: 'gestionnaire_departement',
        roleReadModel: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire département',
          organisation: 'Paris (75)',
          rolesGerables: ['Gestionnaire département'],
          type: 'gestionnaire_departement',
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_groupement',
        roleReadModel: {
          categorie: 'groupement',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire groupement',
          organisation: 'Hubikoop',
          rolesGerables: ['Gestionnaire groupement'],
          type: 'gestionnaire_groupement',
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_region',
        roleReadModel: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire région',
          organisation: 'Île-de-France (11)',
          rolesGerables: ['Gestionnaire région'],
          type: 'gestionnaire_region',
        },
      },
      {
        isGestionnaireDepartement: false,
        role: 'gestionnaire_structure',
        roleReadModel: {
          categorie: 'structure',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['Gestionnaire structure'],
          type: 'gestionnaire_structure',
        },
      },
    ] as const)('quand je cherche un utilisateur $roleReadModel.nom qui existe par son ssoId alors je le trouve', async ({ isGestionnaireDepartement, role, roleReadModel }) => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await creerUneRegion()
      await creerUnDepartement()
      await creerUneStructure()
      await creerUnGroupement()
      await creerUnUtilisateur({
        departementCode: '75',
        groupementId: 10,
        regionCode: '11',
        role,
        ssoId: ssoIdExistant,
        structureId: 10,
      })

      // WHEN
      const utilisateurReadModel = await new PrismaUtilisateurLoader().findByUid(ssoIdExistant)

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
      await creerUnUtilisateur({ ssoId: '1234567890' })

      // WHEN
      const utilisateurReadModel =
        async (): Promise<UnUtilisateurReadModel> => new PrismaUtilisateurLoader().findByUid(ssoIdInexistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('Utilisateur non trouvé')
    })

    it('quand je cherche un utilisateur qui existe par son ssoId et dont le compte a été supprimé alors je ne le trouve pas', async () => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      await creerUnUtilisateur({ isSupprime: true, ssoId: ssoIdExistant })

      // WHEN
      const utilisateurReadModel =
        async (): Promise<UnUtilisateurReadModel> => new PrismaUtilisateurLoader().findByUid(ssoIdExistant)

      // THEN
      await expect(utilisateurReadModel).rejects.toThrow('Utilisateur non trouvé')
    })
  })

  //Ticket #681 : https://github.com/anct-cnum/suite-gestionnaire-numerique/issues/681
  it('quand je cherche un utilisateur qui existe par son ssoId et dont le ssoId egale a son email, et dont le compte est actif, alors je lui demande de se reconnecter', async () => {
    // GIVEN
    const ssoIdVenantDuProConnect = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const ssoIdDansLaBaeDeDonnees = 'martin.tartempion@example.net'
    await creerUnUtilisateur({ isSupprime: false, ssoId: ssoIdDansLaBaeDeDonnees })

    // WHEN
    const utilisateurReadModel =
      async (): Promise<UnUtilisateurReadModel> => new PrismaUtilisateurLoader()
        .findByUid(ssoIdVenantDuProConnect, ssoIdDansLaBaeDeDonnees)

    // THEN
    await expect(utilisateurReadModel).rejects.toThrow('Doit etre mis a jour')
  })

  describe('chercher mes utilisateurs', () => {
    it('étant admin quand je cherche mes utilisateurs alors je les trouve tous indépendamment de leur rôle rangé par ordre alphabétique', async () => {
      // GIVEN
      await creerUnGroupement()
      await creerUneRegion()
      await creerUnDepartement()
      await creerUneStructure()
      await creerUnUtilisateur({ nom: 'Tartempion', role: 'administrateur_dispositif', ssoId })
      await creerUnUtilisateur({
        departementCode: '75',
        nom: 'dupont',
        role: 'gestionnaire_departement',
        ssoEmail: 'martin.tartempion2@example.net',
        ssoId: '123456',
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
              doesItBelongToGroupeAdmin: false,
              nom: 'Gestionnaire département',
              organisation: 'Paris (75)',
              rolesGerables: ['Gestionnaire département'],
              type: 'gestionnaire_departement',
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
              doesItBelongToGroupeAdmin: true,
              nom: 'Administrateur dispositif',
              organisation: 'Administrateur dispositif',
              rolesGerables: Roles,
              type: 'administrateur_dispositif',
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
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire département',
          organisation: 'Rhône (69)',
          rolesGerables: [],
          type: 'gestionnaire_departement',
        },
        uid: ssoId,
      })
      await creerUneRegion({ code: regionCode })
      await creerUnDepartement({ code: departementCode, regionCode })
      await creerUnUtilisateur({ departementCode, nom: 'Tartempion', role: 'gestionnaire_departement', ssoId })
      await creerUnUtilisateur({ departementCode, nom: 'Dupont', role: 'gestionnaire_departement', ssoEmail: 'alois.leroy@example.com', ssoId: '123456' })
      await creerUnUtilisateur({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'martin.tartempion@example.fr', ssoId: 'fakeSsoId' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire région',
          organisation: 'Auvergne-Rhône-Alpes (93)',
          rolesGerables: [],
          type: 'gestionnaire_region',
        },
        uid: ssoId,
      })
      await creerUneRegion({ code: regionCode })
      await creerUnUtilisateur({ nom: 'Tartempion', regionCode, role: 'gestionnaire_region', ssoId })
      await creerUnUtilisateur({ nom: 'Dupont', regionCode, role: 'gestionnaire_region', ssoEmail: 'martin.tartempion@example.org', ssoId: '123456' })
      await creerUnUtilisateur({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'martin.tartempion@example.fr', ssoId: 'fakeSsoId' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire groupement',
          organisation: 'Hubikoop',
          rolesGerables: [],
          type: 'gestionnaire_groupement',
        },
        uid: ssoId,
      })
      await creerUnGroupement({ id: groupementId })
      await creerUnUtilisateur({ groupementId, nom: 'Tartempion', role: 'gestionnaire_groupement', ssoId })
      await creerUnUtilisateur({ groupementId, nom: 'Dupont', role: 'gestionnaire_groupement', ssoEmail: 'martin.tartempion@example.com', ssoId: '123456' })
      await creerUnUtilisateur({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'fakeSsoEmail@example.com', ssoId: 'fakeSsoId' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['Gestionnaire structure'],
          type: 'gestionnaire_structure',
        },
        structureId,
        uid: ssoId,
      })
      await creerUneRegion()
      await creerUnDepartement()
      await creerUneStructure({ id: structureId })
      await creerUnUtilisateur({ nom: 'Tartempion', role: 'gestionnaire_structure', ssoId, structureId })
      await creerUnUtilisateur({ nom: 'Dupont', role: 'gestionnaire_structure', ssoEmail: 'martin.tartempion@example.org', ssoId: '123456', structureId })
      await creerUnUtilisateur({ nom: 'Durant', role: 'administrateur_dispositif', ssoEmail: 'fakeSsoEmail@example.com', ssoId: 'fakeSsoId' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      await creerUnUtilisateur({ nom: 'Tartempion', ssoId })
      await creerUnUtilisateur({ nom: 'Dupont', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' })
      const pageCourante = 1
      const utilisateursParPage = 1

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      await creerUnUtilisateur({ isSupprime: false, ssoId })
      await creerUnUtilisateur({ isSupprime: true, ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      await creerUnUtilisateur({ derniereConnexion: epochTime, nom: 'a', ssoId })
      await creerUnUtilisateur({ derniereConnexion: null, nom: 'b', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      await creerUnUtilisateur({ derniereConnexion: epochTime, nom: 'a', ssoId })
      await creerUnUtilisateur({ derniereConnexion: null, nom: 'b', ssoEmail: 'anthony.parquet@example.com', ssoId: '123456' })
      const isActive = true

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      await creerUnUtilisateur({ nom: 'a', role: 'administrateur_dispositif', ssoId })
      await creerUnUtilisateur({ nom: 'c', role: 'gestionnaire_structure', ssoEmail: 'nicolas.james@example.com', ssoId: '67890' })
      const roles = ['administrateur_dispositif', 'gestionnaire_structure']

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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

    it(`quand je cherche mes utilisateurs par un département alors je trouve tous ceux qui sont rattachés à :
          - ce département
          - une structure rattachée à ce département`, async () => {
      // GIVEN
      const codeDepartement = '93'
      await creerUneRegion()
      await creerUnDepartement({ code: codeDepartement })
      await creerUnDepartement({ code: '75' })
      await creerUneStructure({ departementCode: '75' })
      await creerUneStructure({ departementCode: codeDepartement, id: 11 })
      await creerUnUtilisateur({ departementCode: codeDepartement, nom: 'a', ssoId })
      await creerUnUtilisateur({ departementCode: '75', nom: 'b', ssoEmail: 'nicolas.james@example.com', ssoId: '123456' })
      await creerUnUtilisateur({ ssoEmail: 'nicolas.james@example.net', ssoId: '1234567', structureId: 10 })
      await creerUnUtilisateur({ ssoEmail: 'nicolas.james@example.org', ssoId: '1234568', structureId: 11 })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('1234568')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].departementCode).toBe('93')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].structureId).toBe(11)
    })

    it(`quand je cherche mes utilisateurs par une région alors je trouve tous ceux qui sont rattachés à :
          - cette région
          - un département rattaché à cette région
          - une structure rattachée à un département rattaché à cette région`, async () => {
      // GIVEN
      const codeRegion = '11'
      await creerUneRegion({ code: codeRegion })
      await creerUneRegion({ code: '21' })
      await creerUnDepartement({ code: '75' })
      await creerUnDepartement({ code: '10', regionCode: '21' })
      await creerUneStructure({ departementCode: '75' })
      await creerUneStructure({ departementCode: '10', id: 11 })
      await creerUnUtilisateur({ nom: 'a', regionCode: codeRegion, ssoId })
      await creerUnUtilisateur({ nom: 'b', regionCode: '21', ssoEmail: 'kevin.durand@example.com', ssoId: '123456' })
      await creerUnUtilisateur({ departementCode: '75', nom: 'c', ssoEmail: 'jean.lebrun@example.com', ssoId: '67890' })
      await creerUnUtilisateur({ departementCode: '10', nom: 'D', ssoEmail: 'anthony.parquet@example.com', ssoId: 'azerty' })
      await creerUnUtilisateur({ ssoEmail: 'anthony.parquet@example.net', ssoId: 'uiopq', structureId: 10 })
      await creerUnUtilisateur({ ssoEmail: 'anthony.parquet@example.org', ssoId: 'sdfghj', structureId: 11 })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion
      )

      // THEN
      expect(mesUtilisateursReadModel.total).toBe(3)
      expect(mesUtilisateursReadModel.utilisateursCourants).toHaveLength(3)
      expect(mesUtilisateursReadModel.utilisateursCourants[0].uid).toBe('7396c91e-b9f2-4f9d-8547-5e7b3302725b')
      expect(mesUtilisateursReadModel.utilisateursCourants[0].regionCode).toBe('11')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('67890')
      expect(mesUtilisateursReadModel.utilisateursCourants[1].departementCode).toBe('75')
      expect(mesUtilisateursReadModel.utilisateursCourants[2].uid).toBe('uiopq')
      expect(mesUtilisateursReadModel.utilisateursCourants[2].structureId).toBe(10)
    })

    it('quand des utilisateurs sont recherchés par structure, alors tous ceux qui lui appartiennent sont trouvés', async () => {
      // GIVEN
      const structureId = 14
      await creerUneRegion({ code: '93', nom: 'Provence-Alpes-Côte d’Azur' })
      await creerUneRegion()
      await creerUnDepartement({ code: '06', nom: 'Alpes-Maritimes', regionCode: '93' })
      await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
      await creerUneStructure({
        departementCode: '06',
        id: structureId,
        nom: 'TETRIS',
      })
      await creerUneStructure({
        departementCode: '93',
        id: 416,
        nom: 'GRAND PARIS GRAND EST',
      })
      await creerUnUtilisateur({ nom: 'Tartempion', prenom: 'Martin', structureId })
      await creerUnUtilisateur({
        nom: 'Dugenoux',
        prenom: 'Martine',
        ssoEmail: 'martine.dugenoux@example.com',
        ssoId: 'd6895238-e15b-43a6-9868-5d21ae29490e',
        structureId: 416,
      })
      await creerUnUtilisateur({
        nom: 'Duchmolle',
        prenom: 'Martine',
        ssoEmail: 'martine.duchmolle@example.com',
        ssoId: '31512478-64eb-4993-af47-a728ec4d8e06',
        structureId,
      })

      // WHEN
      const mesUtilisateursReadModel = await utilisateurLoader.mesUtilisateursEtLeTotal(
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
      expect(mesUtilisateursReadModel.utilisateursCourants[1].uid).toBe('userFooId')
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
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const codeDepartement = '0'
    const codeRegion = '0'
  })

  describe('chercher un utilisateur par son nom ou son email', () => {
    const structureId = 15
    const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const pageCourante = 0
    const utilisateursParPage = 10
    const isActive = false
    const utilisateurAuthentifie = utilisateurReadModelFactory({
      uid: ssoId,
    })
    const roles: ReadonlyArray<string> = []
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const codeDepartement = '0'
    const codeRegion = '0'

    it('quand je cherche un utilisateur par son email alors je le trouve', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'gregory.logeais@example.net'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(1)
    })

    it('quand je cherche un utilisateur par son email de contact et qu‘un autre utilisateur a le même email de contact alors je les trouve', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'structure@example.net'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(2)
    })

    it('quand je cherche un utilisateur par son prénom alors je le trouve', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'Baptiste'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(1)
      expect(result.utilisateursCourants[0].prenom).toMatch(/baptiste/i)
    })

    it('quand je cherche un utilisateur par son nom alors je le trouve', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'Nogent'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(1)
      expect(result.utilisateursCourants[0].nom).toMatch(/nogent/i)
    })

    it('quand je cherche avec un email qui n‘existe pas alors je ne trouve personne', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'nonexistent@example.com'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(0)
      expect(result.utilisateursCourants).toHaveLength(0)
    })

    it('quand je cherche avec un nom qui n‘existe pas alors je ne trouve personne', async () => {
      // GIVEN
      await creationDesUtilisateurs(structureId)
      const prenomOuNomOuEmail = 'NonExistentName'

      // WHEN
      const result = await utilisateurLoader.mesUtilisateursEtLeTotal(
        utilisateurAuthentifie,
        pageCourante,
        utilisateursParPage,
        isActive,
        roles,
        codeDepartement,
        codeRegion,
        structureId,
        prenomOuNomOuEmail
      )

      // THEN
      expect(result.total).toBe(0)
      expect(result.utilisateursCourants).toHaveLength(0)
    })
  })
})

async function creationDesUtilisateurs(structureId: number): Promise<void> {
  await creerUneRegion({ code: '92', nom: 'Provence-Alpes-Côte d\'Azur' })

  await creerUnDepartement({ code: '07', nom: 'Alpes-Maritimes', regionCode: '92' })

  await creerUneStructure({ departementCode: '07', id: structureId, nom: 'LAPOSTE' })

  await creerUnUtilisateur({
    emailDeContact: 'gregory.logeais@example.net',
    nom: 'Logeais',
    prenom: 'Gregory',
    ssoEmail: 'gregory.logeais@example.net',
    ssoId: 'fooId1',
    structureId,
  })

  await creerUnUtilisateur({
    emailDeContact: 'structure@example.net',
    nom: 'Belleville',
    prenom: 'Romain',
    ssoEmail: 'romain.belleville@example.net',
    ssoId: 'barId1',
    structureId,
  })

  await creerUnUtilisateur({
    emailDeContact: 'structure@example.net',
    nom: 'Belleville',
    prenom: 'Romain',
    ssoEmail: 'robin.desmurs@example.net',
    ssoId: 'barId2',
    structureId,
  })

  await creerUnUtilisateur({
    emailDeContact: 'structure1@example.net',
    nom: 'Deschamps',
    prenom: 'Baptiste',
    ssoEmail: 'romain.sceller@example.net',
    ssoId: 'barId23',
    structureId,
  })

  await creerUnUtilisateur({
    emailDeContact: 'structure3@example.net',
    nom: 'Nogent',
    prenom: 'Eric',
    ssoEmail: 'foo.bar@example.net',
    ssoId: 'barId234',
    structureId,
  })
}
