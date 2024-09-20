import { createSessionUtilisateurPresenter } from './sessionUtilisateurPresenter'
import { TypologieRole } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

const utilisateur = {
  email: 'martin.tartempion@example.net',
  isSuperAdmin: false,
  nom: 'Tartempion',
  prenom: 'Martin',
  uid: 'fooId',
}

describe(`Affichage des informations de session de l'utilisateur connecté ${utilisateur.prenom}`
  + ` ${utilisateur.nom}, qui a pour rôle`, () => {
  it.each([
    {
      expected: {
        ...utilisateur,
        role: {
          groupe: 'admin',
          libelle: 'Banque des territoires',
          nom: 'Instructeur',
          pictogramme: 'bdt',
        },
      },
      nom: 'Instructeur' as const,
      territoireOuStructure: 'Banque des territoires',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          groupe: 'admin',
          libelle: 'France Numérique Ensemble',
          nom: 'Pilote politique publique',
          pictogramme: 'anct',
        },
      },
      nom: 'Pilote politique publique' as const,
      territoireOuStructure: 'France Numérique Ensemble',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          groupe: 'admin',
          libelle: 'Mednum',
          nom: 'Support animation',
          pictogramme: 'mednum',
        },
      },
      nom: 'Support animation' as const,
      territoireOuStructure: 'Mednum',
    },
  ])('$nom : $expected.role.libelle avec le pictogramme $expected.role.pictogramme', ({ nom, expected }) => {
    expect(
      createSessionUtilisateurPresenter(
        makeUtilisateur(nom).state()
      )
    ).toStrictEqual(expected)
  })

  it.each([
    {
      expected: {
        ...utilisateur,
        role: {
          groupe: 'admin',
          libelle: 'Administrateur Dispositif lambda',
          nom: 'Administrateur dispositif',
          pictogramme: 'anct',
        },
      },
      nom: 'Administrateur dispositif' as const,
      territoireOuStructure: 'Administrateur Dispositif lambda',
    },
    {
      expected: {
        ...utilisateur,
        role: {
          groupe: 'gestionnaire',
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
          groupe: 'gestionnaire',
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
          groupe: 'gestionnaire',
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
          groupe: 'gestionnaire',
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
          makeUtilisateur(nom, territoireOuStructure).state()
        )
      ).toStrictEqual(expected)
    }
  )
})

function makeUtilisateur(role: TypologieRole, territoireOuStructure?: string): Utilisateur {
  return Utilisateur.create({
    email: utilisateur.email,
    isSuperAdmin: false,
    nom: utilisateur.nom,
    organisation: territoireOuStructure,
    prenom: utilisateur.prenom,
    role,
    uid: 'fooId',
  })
}
