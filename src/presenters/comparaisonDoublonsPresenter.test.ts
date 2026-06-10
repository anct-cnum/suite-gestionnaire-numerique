import { describe, expect, it } from 'vitest'

import {
  comparaisonDoublonsPresenter,
  matriceDistances,
  StructureComparaisonViewModel,
} from './comparaisonDoublonsPresenter'
import { StructureDetailReadModel } from '@/use-cases/queries/ComparerStructuresAFusionner'

describe('comparaison doublons presenter', () => {
  it('présente le détail complet d’une structure (champs ordonnés + ventilation des rattachements)', () => {
    // GIVEN
    const readModel: ReadonlyArray<StructureDetailReadModel> = [
      {
        adresse: '1 Place Chatelet 28000 Chartres',
        codeActivitePrincipale: '84.11Z',
        commune: 'Chartres',
        dejaFusionnee: false,
        denominationAntenne: 'Conseil Départemental',
        denominationSirene: "DEPARTEMENT DE L'EURE ET LOIR",
        estBeneficiaire: true,
        etatAdministratif: 'A',
        id: 4555,
        latitude: 48.45,
        longitude: 1.49,
        rattachements: {
          affectationsEmploi: 37,
          associationsLieux: 0,
          contacts: 2,
          contactsMembre: 1,
          contrats: 1,
          feuillesDeRoute: 1,
          gouvernances: 1,
          membresMin: 1,
          postes: 15,
          total: 58,
          utilisateursMin: 2,
        },
        ridet: null,
        rna: null,
        siret: '22280001300013',
        source: 'sonum',
      },
    ]

    // WHEN
    const [structure] = comparaisonDoublonsPresenter(readModel)

    // THEN
    expect(structure.denomination).toBe('Conseil Départemental')
    expect(structure.adresse).toBe('1 Place Chatelet 28000 Chartres')
    expect(structure.rattachementsTotal).toBe(58)
    expect(structure.champs).toStrictEqual([
      { label: 'SIRET', valeur: '22280001300013' },
      { label: 'RIDET', valeur: '—' },
      { label: 'RNA', valeur: '—' },
      { label: 'Dénomination SIRENE', valeur: "DEPARTEMENT DE L'EURE ET LOIR" },
      { label: 'Antenne', valeur: 'Oui — Conseil Départemental' },
      { label: 'Source', valeur: 'MIN' },
      { label: 'État administratif', valeur: 'A' },
      { label: 'Code activité (APE)', valeur: '84.11Z' },
      { label: 'Commune', valeur: 'Chartres' },
      { label: 'Bénéficiaire de subvention', valeur: 'Oui' },
      { label: 'Issue d’une fusion précédente', valeur: 'Non' },
    ])
    expect(structure.rattachements.map(({ label, nombre }) => ({ label, nombre }))).toStrictEqual([
      { label: 'Utilisateurs MIN', nombre: 2 },
      { label: 'Membres MIN', nombre: 1 },
      { label: 'Gouvernances', nombre: 1 },
      { label: 'Feuilles de route portées', nombre: 1 },
      { label: 'Contacts membres', nombre: 1 },
      { label: 'Postes', nombre: 15 },
      { label: 'Contrats', nombre: 1 },
      { label: 'Affectations emploi', nombre: 37 },
      { label: 'Contacts référents', nombre: 2 },
      { label: "Associations à des lieux d'inclusion", nombre: 0 },
    ])
  })

  it('applique les valeurs de repli quand les champs sont absents', () => {
    // GIVEN
    const readModel: ReadonlyArray<StructureDetailReadModel> = [
      {
        adresse: null,
        codeActivitePrincipale: null,
        commune: null,
        dejaFusionnee: false,
        denominationAntenne: null,
        denominationSirene: null,
        estBeneficiaire: false,
        etatAdministratif: null,
        id: 99,
        latitude: null,
        longitude: null,
        rattachements: {
          affectationsEmploi: 0,
          associationsLieux: 0,
          contacts: 0,
          contactsMembre: 0,
          contrats: 0,
          feuillesDeRoute: 0,
          gouvernances: 0,
          membresMin: 0,
          postes: 0,
          total: 0,
          utilisateursMin: 0,
        },
        ridet: null,
        rna: null,
        siret: null,
        source: null,
      },
    ]

    // WHEN
    const [structure] = comparaisonDoublonsPresenter(readModel)

    // THEN
    expect(structure.denomination).toBe('Structure #99')
    expect(structure.adresse).toBe('—')
    expect(structure.denominationSirene).toBe('')
  })

  it('matriceDistances classe chaque distance par niveau (identique / proche / normal / éloigné / inconnu)', () => {
    // GIVEN
    const structures = [
      structureAvecCoords(1, 48.8, 2.3),
      structureAvecCoords(2, 48.8, 2.3), // 0 m → identique
      structureAvecCoords(3, 48.8008, 2.3), // ~89 m → proche
      structureAvecCoords(4, 48.805, 2.3), // ~560 m → normal
      structureAvecCoords(5, 48.85, 2.3), // ~5,6 km → éloigné
      structureAvecCoords(6, null, null), // coords manquantes → inconnu
    ]

    // WHEN
    const matrice = matriceDistances(structures)

    // THEN
    expect(matrice.lignes[0]?.cellules.map((cellule) => cellule.niveau)).toStrictEqual([
      'diagonale',
      'identique',
      'proche',
      'normal',
      'eloigne',
      'inconnu',
    ])
  })
})

function structureAvecCoords(
  id: number,
  latitude: null | number,
  longitude: null | number
): StructureComparaisonViewModel {
  return {
    adresse: `Adresse ${id}`,
    champs: [],
    denomination: `Structure ${id}`,
    denominationSirene: `Structure ${id}`,
    estAssocieLieuInclusion: false,
    estCanonique: false,
    estMembre: false,
    id,
    latitude,
    longitude,
    rattachements: [],
    rattachementsTotal: 0,
  }
}
