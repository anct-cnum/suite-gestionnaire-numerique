import { describe, expect, it } from 'vitest'

import { comparaisonDoublonsPresenter } from './comparaisonDoublonsPresenter'
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
    expect(structure.rattachements).toStrictEqual([
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
})
