import { describe, expect, it } from 'vitest'

import {
  ENTETES_UTILISATEURS,
  ENTETES_UTILISATEURS_GOUVERNANCES,
  genererLigneUtilisateur,
  genererLigneUtilisateurGouvernance,
} from './exportUtilisateursPresenter'
import { epochTime } from './testHelper'
import { GouvernanceStructureReadModel } from '@/use-cases/queries/shared/GouvernanceStructureReadModel'
import { TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

const territoires: TerritoiresReadModel = {
  departements: [
    { code: '69', nom: 'Rhône', regionCode: '84', regionNom: 'Auvergne-Rhône-Alpes' },
    { code: '75', nom: 'Paris', regionCode: '84', regionNom: 'Auvergne-Rhône-Alpes' },
  ],
  structureDepartements: new Map([[1, '75']]),
}

describe('exportUtilisateursPresenter', () => {
  it('génère les en-têtes gouvernances comme une extension des en-têtes utilisateurs', () => {
    // THEN
    expect(ENTETES_UTILISATEURS_GOUVERNANCES.slice(0, ENTETES_UTILISATEURS.length)).toStrictEqual(ENTETES_UTILISATEURS)
    expect(ENTETES_UTILISATEURS_GOUVERNANCES.slice(ENTETES_UTILISATEURS.length)).toStrictEqual([
      'SIRET',
      'Statut de la structure',
      'Territoires',
      'Rôle gouvernance',
    ])
  })

  describe(genererLigneUtilisateur, () => {
    it('génère la ligne d’un administrateur dispositif sans structure ni territoire', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory()

      // WHEN
      const ligne = genererLigneUtilisateur(utilisateur, territoires)

      // THEN
      expect(ligne).toStrictEqual([
        'Tartempion',
        'Martin',
        'martin.tartempion@example.net',
        '0102030405',
        'Administrateur dispositif',
        '',
        '',
        '',
        'Activé',
        formatteAttendu(epochTime),
      ])
    })

    it('génère la ligne d’un gestionnaire département avec son département et sa région', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({
        departementCode: '69',
        role: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire département',
          organisation: 'Rhône (69)',
          rolesGerables: ['Gestionnaire département'],
          type: 'gestionnaire_departement',
        },
      })

      // WHEN
      const ligne = genererLigneUtilisateur(utilisateur, territoires)

      // THEN
      expect(ligne.slice(4, 8)).toStrictEqual([
        'Gestionnaire département',
        'Rhône (69)',
        'Rhône',
        'Auvergne-Rhône-Alpes',
      ])
    })

    it('génère la ligne d’un gestionnaire structure avec le département de l’adresse de sa structure', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({
        role: {
          categorie: 'structure',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: 'Ma structure',
          rolesGerables: ['Gestionnaire structure'],
          type: 'gestionnaire_structure',
        },
        structureId: 1,
      })

      // WHEN
      const ligne = genererLigneUtilisateur(utilisateur, territoires)

      // THEN
      expect(ligne.slice(4, 8)).toStrictEqual([
        'Gestionnaire structure',
        'Ma structure',
        'Paris',
        'Auvergne-Rhône-Alpes',
      ])
    })

    it('génère une ligne vide de dernière connexion pour un utilisateur en attente', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({ derniereConnexion: epochTime, isActive: false })

      // WHEN
      const ligne = genererLigneUtilisateur(utilisateur, territoires)

      // THEN
      expect(ligne.slice(8)).toStrictEqual(['En attente', ''])
    })
  })

  describe(genererLigneUtilisateurGouvernance, () => {
    const roleGestionnaireStructure = {
      categorie: 'structure',
      doesItBelongToGroupeAdmin: false,
      nom: 'Gestionnaire structure',
      organisation: 'Ma structure',
      rolesGerables: ['Gestionnaire structure'],
      type: 'gestionnaire_structure',
    } as const

    it('étend la ligne commune avec les colonnes de gouvernance quand la structure y est présente', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 1 })
      const gouvernanceParStructure: GouvernanceStructureReadModel = new Map([
        [
          1,
          {
            roleGouvernance: 'coporteur',
            siret: '11111111111111',
            statutStructure: 'validée',
            territoires: ['Paris'],
          },
        ],
      ])

      // WHEN
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, gouvernanceParStructure)

      // THEN
      expect(ligne.slice(0, 10)).toStrictEqual(genererLigneUtilisateur(utilisateur, territoires))
      expect(ligne.slice(10)).toStrictEqual(['11111111111111', 'validée', 'Paris', 'coporteur'])
    })

    it('laisse les colonnes de gouvernance vides quand la structure n’a pas de membre de gouvernance', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 1 })

      // WHEN
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, new Map())

      // THEN
      expect(ligne.slice(10)).toStrictEqual(['', '', '', ''])
    })

    it('renseigne Territoires avec le département géré pour un gestionnaire département', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({
        departementCode: '69',
        role: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire département',
          organisation: 'Rhône (69)',
          rolesGerables: ['Gestionnaire département'],
          type: 'gestionnaire_departement',
        },
      })

      // WHEN
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, new Map())

      // THEN
      expect(ligne.slice(10)).toStrictEqual(['', '', 'Rhône', ''])
    })

    it('renseigne Territoires avec la région gérée pour un gestionnaire région', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory({
        regionCode: '84',
        role: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire région',
          organisation: 'Auvergne-Rhône-Alpes (84)',
          rolesGerables: ['Gestionnaire région'],
          type: 'gestionnaire_region',
        },
      })

      // WHEN
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, new Map())

      // THEN
      expect(ligne.slice(10)).toStrictEqual(['', '', 'Auvergne-Rhône-Alpes', ''])
    })

    it('laisse les colonnes de gouvernance vides pour un administrateur dispositif', () => {
      // GIVEN
      const utilisateur = utilisateurReadModelFactory()

      // WHEN
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, new Map())

      // THEN
      expect(ligne.slice(10)).toStrictEqual(['', '', '', ''])
    })
  })
})

function formatteAttendu(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}
