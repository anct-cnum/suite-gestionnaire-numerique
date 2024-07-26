import { sessionUtilisateurPresenter } from './session-utilisateur-presenter'
import { Role } from '../../../domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

const utilisateur = {
  email: 'martin.tartempion@example.net',
  nom:'Tartempion',
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
          pictogramme: 'instructeur',
        },
      },
      role: 'Instructeur' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'France Numérique Ensemble',
          pictogramme: 'anct',
        },
      },
      role: 'Pilote politique publique' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Mednum',
          pictogramme: 'support-animation',
        },
      },
      role: 'Support animation' as const,
    },
  ])('$role : $expected.role.libelle avec le pictogramme $expected.role.pictogramme', ({ role, expected }) => {
    expect(sessionUtilisateurPresenter(makeUtilisateur(new Role({ typologie: role }))))
      .toStrictEqual(expected)
  })

  it.each([
    {
      expected: {
        ...utilisateur,
        role: { libelle: 'Administrateur Dispositif λ', pictogramme: 'anct' },
      },
      perimetre: 'Dispositif λ',
      role: 'Administrateur dispositif' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Haute Marne',
          pictogramme: 'marianne',
        },
      },
      perimetre: 'Haute Marne',
      role: 'Gestionnaire département' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Groupement λ',
          pictogramme: 'gestionnaire-groupement',
        },
      },
      perimetre: 'Groupement λ',
      role: 'Gestionnaire groupement' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Nouvelle-Aquitaine',
          pictogramme: 'marianne',
        },
      },
      perimetre: 'Nouvelle-Aquitaine',
      role: 'Gestionnaire région' as const,
    },
    {
      expected: {
        ...utilisateur,
        role: {
          libelle: 'Structure λ',
          pictogramme: 'gestionnaire-structure',
        },
      },
      perimetre: 'Structure λ',
      role: 'Gestionnaire structure' as const,
    },
  ])(
    '$role $perimetre: $expected.role.libelle avec le pictogramme $expected.role.pictogramme',
    ({ role, perimetre, expected }) => {
      expect(
        sessionUtilisateurPresenter(
          makeUtilisateur(
            new Role({ territoireOuStructure: perimetre, typologie: role })
          )
        )
      ).toStrictEqual(expected)
    }
  )
})

function makeUtilisateur(role: Role): Utilisateur {
  return new Utilisateur(role, utilisateur.nom, utilisateur.prenom, utilisateur.email)
}
