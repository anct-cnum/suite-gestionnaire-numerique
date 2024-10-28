import { Role } from '@prisma/client'

import { PostgreMesInformationsPersonnellesLoader } from './PostgreMesInformationsPersonnellesLoader'
import prisma from '../../prisma/prismaClient'
import { TypologieRole } from '@/domain/Role'
import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

describe('mes informations personnelles loader', () => {
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
      role: 'gestionnaire_region' as Role,
      roleLabel: 'Gestionnaire région' as TypologieRole,
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
    {
      role: 'gestionnaire_groupement' as Role,
      roleLabel: 'Gestionnaire groupement' as TypologieRole,
    },
  ])('cherchant un utilisateur $roleLabel qui existe par son ssoId alors cela retourne ses informations personnelles sans notion de structure', async ({ role, roleLabel }) => {
    // GIVEN
    const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const date = new Date(0)
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
    const mesInformationsPersonnellesLoader = new PostgreMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesLoader.findByUid(ssoIdExistant)

    // THEN
    expect(mesInformationsPersonnellesReadModel).toStrictEqual<MesInformationsPersonnellesReadModel>({
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleLabel,
      telephone: '0102030405',
    })
  })

  it('cherchant un utilisateur $roleLabel qui existe par son ssoId alors cela retourne ses informations personnelles avec sa notion de structure', async () => {
    // GIVEN
    const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const date = new Date(0)
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
    await prisma.structureRecord.create({
      data: {
        adresse: {
          code_postal: '84200',
          indice_repetition_voie: 'BIS',
          libelle_commune: 'PARIS',
          libelle_voie: 'CHARLES DE GAULLE',
          numero_voie: '3',
          type_voie: 'AVENUE',
        },
        contact: {
          email: 'manon.verminac@example.com',
          fonction: 'Chargée de mission',
          nom: 'Verninac',
          prenom: 'Manon',
          telephone: '0102030405',
        },
        departementCode: '69',
        id: 10,
        idMongo: '123456',
        identifiantEtablissement: '62520260000023',
        nom: 'Solidarnum',
        regionCode: '84',
        statut: 'VALIDATION_COSELEC',
        type: 'COMMUNE',
      },
    })
    await prisma.utilisateurRecord.create({
      data: {
        dateDeCreation: date,
        email: 'martin.tartempion@example.net',
        inviteLe: date,
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'gestionnaire_structure',
        ssoId: ssoIdExistant,
        structureId: 10,
        telephone: '0102030405',
      },
    })
    const mesInformationsPersonnellesLoader = new PostgreMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesLoader.findByUid(ssoIdExistant)

    // THEN
    expect(mesInformationsPersonnellesReadModel).toStrictEqual<MesInformationsPersonnellesReadModel>({
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Gestionnaire structure',
      structure: {
        adresse: '3 BIS AVENUE CHARLES DE GAULLE, 84200 PARIS',
        contact: {
          email: 'manon.verminac@example.com',
          fonction: 'Chargée de mission',
          nom: 'Verninac',
          prenom: 'Manon',
        },
        numeroDeSiret: '62520260000023',
        raisonSociale: 'Solidarnum',
        typeDeStructure: 'COMMUNE',
      },
      telephone: '0102030405',
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
