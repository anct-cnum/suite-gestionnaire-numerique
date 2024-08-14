import { Role } from '@prisma/client'

import { PostgreUtilisateurQuery } from './PostgreUtilisateurQuery'
import prisma from '../../prisma/prismaClient'

describe('postgre utilisateur query', () => {
  beforeEach(async () => {
    await prisma.$queryRaw`START TRANSACTION`
  })

  afterEach(async () => {
    await prisma.$queryRaw`ROLLBACK TRANSACTION`
  })

  it.each([
    {
      role: 'administrateur_dispositif' as Role,
      roleReadModel: {
        categorie: 'anct',
        nom: 'Administrateur dispositif',
        territoireOuStructure: 'Dispositif lambda',
      },
    },
    {
      role: 'gestionnaire_departement' as Role,
      roleReadModel: {
        categorie: 'maille',
        nom: 'Gestionnaire département',
        territoireOuStructure: 'Rhône',
      },
    },
    {
      role: 'gestionnaire_groupement' as Role,
      roleReadModel: {
        categorie: 'groupement',
        nom: 'Gestionnaire groupement',
        territoireOuStructure: 'Hubikoop',
      },
    },
    {
      role: 'gestionnaire_region' as Role,
      roleReadModel: {
        categorie: 'maille',
        nom: 'Gestionnaire région',
        territoireOuStructure: 'Auvergne-Rhône-Alpes',
      },
    },
    {
      role: 'gestionnaire_structure' as Role,
      roleReadModel: {
        categorie: 'structure',
        nom: 'Gestionnaire structure',
        territoireOuStructure: 'Solidarnum',
      },
    },
    {
      role: 'instructeur' as Role,
      roleReadModel: {
        categorie: 'bdt',
        nom: 'Instructeur',
        territoireOuStructure: '',
      },
    },
    {
      role: 'pilote_politique_publique' as Role,
      roleReadModel: {
        categorie: 'anct',
        nom: 'Pilote politique publique',
        territoireOuStructure: '',
      },
    },
    {
      role: 'support_animation' as Role,
      roleReadModel: {
        categorie: 'mednum',
        nom: 'Support animation',
        territoireOuStructure: '',
      },
    },
  ])
  ('quand je cherche un utilisateur $role qui existe par son sub alors je le trouve', async ({ role, roleReadModel }) => {
    // GIVEN
    const subExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const date = new Date()
    await prisma.utilisateurRecord.create({
      data: {
        dateDeCreation: date,
        email: 'martin.tartempion@example.net',
        inviteLe: date,
        nom: 'Tartempion',
        prenom: 'Martin',
        role,
        sub: subExistant,
      },
    })
    const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)

    // WHEN
    const utilisateurReadModel = await postgreUtilisateurQuery.findBySub(subExistant)

    // THEN
    expect(utilisateurReadModel).toStrictEqual({
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleReadModel,
    })
  })

  it('quand je cherche un utilisateur qui n’existe pas par son sub alors je ne le trouve pas', async () => {
    // GIVEN
    const subInexistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const date = new Date()
    await prisma.utilisateurRecord.create({
      data: {
        dateDeCreation: date,
        email: 'martin.tartempion@example.net',
        inviteLe: date,
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'administrateur_dispositif',
        sub: '1234567890',
      },
    })
    const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)

    // WHEN
    const utilisateurReadModel = async () => postgreUtilisateurQuery.findBySub(subInexistant)

    // THEN
    await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
  })
})
