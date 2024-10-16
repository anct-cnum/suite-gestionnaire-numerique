import { Role } from '@prisma/client'

import { PostgreMesInformationsPersonnellesLoader } from './PostgreMesInformationsPersonnellesLoader'
import prisma from '../../prisma/prismaClient'
import { TypologieRole } from '@/domain/Role'
import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

describe('postgre mes informations personnelles', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it.each([
    {
      role: 'administrateur_dispositif' as Role,
      roleLabel: 'Administrateur dispositif' as TypologieRole,
    },
    {
      role: 'gestionnaire_departement' as Role,
      roleLabel: 'Gestionnaire département' as TypologieRole,
    },
    {
      role: 'gestionnaire_groupement' as Role,
      roleLabel: 'Gestionnaire groupement' as TypologieRole,
    },
    {
      role: 'gestionnaire_region' as Role,
      roleLabel: 'Gestionnaire région' as TypologieRole,
    },
    {
      role: 'gestionnaire_structure' as Role,
      roleLabel: 'Gestionnaire structure' as TypologieRole,
    },
    {
      role: 'instructeur' as Role,
      roleLabel: 'Instructeur' as TypologieRole,
    },
    {
      role: 'pilote_politique_publique' as Role,
      roleLabel: 'Pilote politique publique' as TypologieRole,
    },
    {
      role: 'support_animation' as Role,
      roleLabel: 'Support animation' as TypologieRole,
    },
  ])('quand je cherche un utilisateur $roleLabel qui existe par son ssoId alors je retourne ses informations personnelles',
    async ({ role, roleLabel }) => {
    // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const date = new Date()
      await prisma.utilisateurRecord.create({
        data: {
          dateDeCreation: date,
          email: 'martin.tartempion@example.net',
          inviteLe: date,
          nom: 'Tartempion',
          prenom: 'Martin',
          role,
          ssoId: ssoIdExistant,
          telephone: '0102030405',
        },
      })
      const postgreMesInformationsPersonnellesGateway = new PostgreMesInformationsPersonnellesLoader(prisma)

      // WHEN
      const mesInformationsPersonnellesReadModel =
        await postgreMesInformationsPersonnellesGateway.findByUid(ssoIdExistant)

      // THEN
      expect(mesInformationsPersonnellesReadModel).toStrictEqual<MesInformationsPersonnellesReadModel>({
        contactEmail: 'manon.verminac@example.com',
        contactFonction: 'Chargée de mission',
        contactNom: 'Verninac',
        contactPrenom: 'Manon',
        informationsPersonnellesEmail: 'martin.tartempion@example.net',
        informationsPersonnellesNom: 'Tartempion',
        informationsPersonnellesPrenom: 'Martin',
        informationsPersonnellesTelephone: '0102030405',
        role: roleLabel,
        structureAdresse: '201 bis rue de la plaine, 69000 Lyon',
        structureNumeroDeSiret: '62520260000023',
        structureRaisonSociale: 'Préfecture du Rhône',
        structureTypeDeStructure: 'Administration',
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
        telephone: '0102030405',
      },
    })
    const postgreMesInformationsPersonnellesGateway = new PostgreMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const utilisateurReadModel = async () => postgreMesInformationsPersonnellesGateway.findByUid(ssoIdInexistant)

    // THEN
    await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
  })
})
