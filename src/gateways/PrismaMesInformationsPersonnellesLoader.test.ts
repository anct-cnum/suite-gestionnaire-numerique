import { Role } from '@prisma/client'

import { PrismaMesInformationsPersonnellesLoader } from './PrismaMesInformationsPersonnellesLoader'
import { departementRecordFactory, regionRecordFactory, structureRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

describe('mes informations personnelles loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it.each([
    {
      role: 'administrateur_dispositif' as Role,
      roleLabel: 'Administrateur dispositif',
    },
    {
      role: 'gestionnaire_departement' as Role,
      roleLabel: 'Gestionnaire département',
    },
    {
      role: 'gestionnaire_region' as Role,
      roleLabel: 'Gestionnaire région',
    },
    {
      role: 'instructeur' as Role,
      roleLabel: 'Instructeur',
    },
    {
      role: 'pilote_politique_publique' as Role,
      roleLabel: 'Pilote politique publique',
    },
    {
      role: 'support_animation' as Role,
      roleLabel: 'Support animation',
    },
    {
      role: 'gestionnaire_groupement' as Role,
      roleLabel: 'Gestionnaire groupement',
    },
  ])('cherchant un utilisateur $roleLabel qui existe par son ssoId alors cela retourne ses informations personnelles sans notion de structure', async ({ role, roleLabel }) => {
    // GIVEN
    const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        role,
        ssoId: ssoIdExistant,
      }),
    })
    const mesInformationsPersonnellesLoader = new PrismaMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesLoader.findByUid(ssoIdExistant)

    // THEN
    expect(mesInformationsPersonnellesReadModel).toStrictEqual<MesInformationsPersonnellesReadModel>({
      emailDeContact: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleLabel,
      telephone: '0102030405',
    })
  })

  it('cherchant un utilisateur "Gestionnaire structure" qui existe par son ssoId alors cela retourne ses informations personnelles avec sa notion de structure', async () => {
    // GIVEN
    const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const structureId = 10
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
      data: utilisateurRecordFactory({
        role: 'gestionnaire_structure',
        ssoId: ssoIdExistant,
        structureId,
      }),
    })
    const mesInformationsPersonnellesLoader = new PrismaMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesLoader.findByUid(ssoIdExistant)

    // THEN
    expect(mesInformationsPersonnellesReadModel).toStrictEqual<MesInformationsPersonnellesReadModel>({
      emailDeContact: 'martin.tartempion@example.net',
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
        numeroDeSiret: '41816609600069',
        raisonSociale: 'Solidarnum',
        typeDeStructure: 'COMMUNE',
      },
      telephone: '0102030405',
    })
  })

  it('quand je cherche un utilisateur qui n’existe pas par son ssoId alors je ne le trouve pas', async () => {
    // GIVEN
    const ssoIdInexistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(),
    })
    const mesInformationsPersonnellesGateway = new PrismaMesInformationsPersonnellesLoader(prisma)

    // WHEN
    const utilisateurReadModel =
      async (): Promise<MesInformationsPersonnellesReadModel> =>
        mesInformationsPersonnellesGateway.findByUid(ssoIdInexistant)

    // THEN
    await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
  })
})
