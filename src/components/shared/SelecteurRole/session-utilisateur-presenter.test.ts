import { sessionUtilisateurPresenter } from './session-utilisateur-presenter'
import { Role } from '../../../core/domain/role'

const utilisateur = {
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
  ])('$role : $expected.libelle avec le pictogramme $expected.pictogramme', ({ role, expected }) => {
    expect(sessionUtilisateurPresenter(new Role(role), utilisateur.nom, utilisateur.prenom))
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
          libelle: 'Poitou-Charentes',
          pictogramme: 'marianne',
        },
      },
      perimetre: 'Poitou-Charentes',
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
  ])('$role $perimetre: $expected.libelle avec le pictogramme $expected.pictogramme', ({ role, perimetre, expected }) => {
    expect(sessionUtilisateurPresenter(new Role(role, perimetre), utilisateur.nom, utilisateur.prenom))
      .toStrictEqual(expected)
  })
})
