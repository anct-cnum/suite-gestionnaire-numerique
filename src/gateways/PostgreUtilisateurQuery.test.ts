import { Prisma, Role } from '@prisma/client'

import { PostgreUtilisateurQuery } from './PostgreUtilisateurQuery'
import prisma from '../../prisma/prismaClient'
import { Categorie, TypologieRole } from '@/domain/Role'
import { UtilisateurReadModel } from '@/use-cases/queries/UtilisateurQuery'

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
        categorie: 'anct' as Categorie,
        nom: 'Administrateur dispositif' as TypologieRole,
        territoireOuStructure: 'Dispositif lambda',
      },
    },
    {
      role: 'gestionnaire_departement' as Role,
      roleReadModel: {
        categorie: 'maille' as Categorie,
        nom: 'Gestionnaire département' as TypologieRole,
        territoireOuStructure: 'Rhône',
      },
    },
    {
      role: 'gestionnaire_groupement' as Role,
      roleReadModel: {
        categorie: 'groupement' as Categorie,
        nom: 'Gestionnaire groupement' as TypologieRole,
        territoireOuStructure: 'Hubikoop',
      },
    },
    {
      role: 'gestionnaire_region' as Role,
      roleReadModel: {
        categorie: 'maille' as Categorie,
        nom: 'Gestionnaire région' as TypologieRole,
        territoireOuStructure: 'Auvergne-Rhône-Alpes',
      },
    },
    {
      role: 'gestionnaire_structure' as Role,
      roleReadModel: {
        categorie: 'structure' as Categorie,
        nom: 'Gestionnaire structure' as TypologieRole,
        territoireOuStructure: 'Solidarnum',
      },
    },
    {
      role: 'instructeur' as Role,
      roleReadModel: {
        categorie: 'bdt' as Categorie,
        nom: 'Instructeur' as TypologieRole,
        territoireOuStructure: '',
      },
    },
    {
      role: 'pilote_politique_publique' as Role,
      roleReadModel: {
        categorie: 'anct' as Categorie,
        nom: 'Pilote politique publique' as TypologieRole,
        territoireOuStructure: '',
      },
    },
    {
      role: 'support_animation' as Role,
      roleReadModel: {
        categorie: 'mednum' as Categorie,
        nom: 'Support animation' as TypologieRole,
        territoireOuStructure: '',
      },
    },
  ])('quand je cherche un utilisateur $roleReadModel.nom qui existe par son ssoId alors je le trouve', async ({ role, roleReadModel }) => {
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
      },
    })
    const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)

    // WHEN
    const utilisateurReadModel = await postgreUtilisateurQuery.findBySsoId(ssoIdExistant)

    // THEN
    expect(utilisateurReadModel).toStrictEqual<UtilisateurReadModel>({
      email: 'martin.tartempion@example.net',
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleReadModel,
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
    const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)

    // WHEN
    const utilisateurReadModel = async () => postgreUtilisateurQuery.findBySsoId(ssoIdInexistant)

    // THEN
    await expect(utilisateurReadModel).rejects.toThrow('L’utilisateur n’existe pas.')
  })

  it(
    'quand je cherche un utilisateur qui existe par son ssoId et dont le compte a été supprimé alors je ne le trouve pas',
    async () => {
      // GIVEN
      const ssoIdExistant = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
      const date = new Date(0)
      await prisma.utilisateurRecord.create({
        data: {
          dateDeCreation: date,
          derniereConnexion: date,
          email: 'martin.tartempion@example.net',
          inviteLe: date,
          isSuperAdmin: true,
          isSupprime: false,
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'administrateur_dispositif',
          ssoId: ssoIdExistant,
        },
      })
      const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)

      // WHEN
      const utilisateurReadModel = async () => postgreUtilisateurQuery.findBySsoId(ssoIdExistant)

      // THEN
      expect(totalUtilisateur).toBe(2)
    }
  )
})

function utilisateurRecordFactory(
  override: Partial<Prisma.UtilisateurRecordCreateInput>
): Prisma.UtilisateurRecordCreateInput {
  const date = new Date('2024-01-01')

  return {
    dateDeCreation: date,
    derniereConnexion: date,
    email: 'martin.tartempion@example.net',
    inviteLe: date,
    isSuperAdmin: false,
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'administrateur_dispositif',
    ssoId: '7396c91e-b9f2-4f9d-8547-5e7b3302725b',
    telephone: '0102030405',
    ...override,
  }
}
