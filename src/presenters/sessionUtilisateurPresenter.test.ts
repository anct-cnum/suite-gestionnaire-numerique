import { createSessionUtilisateurPresenter } from './sessionUtilisateurPresenter'
import { Role } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

const utilisateur = {
  email: 'martin.tartempion@example.net',
  isSuperAdmin: false,
  nom: 'Tartempion',
  prenom: 'Martin',
}

describe(`Affichage des informations de session de l'utilisateur connecté ${utilisateur.prenom}`
  + ` ${utilisateur.nom}, qui a pour rôle`, () => {

  it.each([
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Banque des territoires',
          nom: 'Instructeur',
          pictogramme: 'bdt',
        },
      },
      nom: 'Instructeur' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'France Numérique Ensemble',
          nom: 'Pilote politique publique',
          pictogramme: 'anct',
        },
      },
      nom: 'Pilote politique publique' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Mednum',
          nom: 'Support animation',
          pictogramme: 'mednum',
        },
      },
      nom: 'Support animation' as const,
    },
  ])('$nom : $expected.role.libelle avec le pictogramme $expected.role.pictogramme', ({ nom, expected }) => {
    expect(
      createSessionUtilisateurPresenter(
        makeUtilisateur(new Role(nom)).state()
      )
    ).toStrictEqual(expected)
  })

  it.each([
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Administrateur Dispositif lambda',
          nom: 'Administrateur dispositif',
          pictogramme: 'anct',
        },
      },
      nom: 'Administrateur dispositif' as const,
      territoireOuStructure: 'Dispositif lambda',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Rhône',
          nom: 'Gestionnaire département',
          pictogramme: 'maille',
        },
      },
      nom: 'Gestionnaire département' as const,
      territoireOuStructure: 'Rhône',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Hubikoop',
          nom: 'Gestionnaire groupement',
          pictogramme: 'groupement',
        },
      },
      nom: 'Gestionnaire groupement' as const,
      territoireOuStructure: 'Hubikoop',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Auvergne-Rhône-Alpes',
          nom: 'Gestionnaire région',
          pictogramme: 'maille',
        },
      },
      nom: 'Gestionnaire région' as const,
      territoireOuStructure: 'Auvergne-Rhône-Alpes',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Solidarnum',
          nom: 'Gestionnaire structure',
          pictogramme: 'structure',
        },
      },
      nom: 'Gestionnaire structure' as const,
      territoireOuStructure: 'Solidarnum',
    },
  ])(
    '$nom $territoireOuStructure: $expected.role.libelle avec le pictogramme $expected.role.pictogramme',
    ({ nom, territoireOuStructure, expected }) => {
      expect(
        createSessionUtilisateurPresenter(
          makeUtilisateur(new Role(nom, territoireOuStructure)).state()
        )
      ).toStrictEqual(expected)
    }
  )
})

function makeUtilisateur(role: Role): Utilisateur {
  return new Utilisateur(role, utilisateur.nom, utilisateur.prenom, utilisateur.email)
}
