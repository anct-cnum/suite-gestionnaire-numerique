import { describe, expect, it } from 'vitest'

import { formatMontant } from './shared/number'
import { structurePresenter } from './structurePresenter'
import { epochTime, epochTimePlusOneDay } from './testHelper'
import { UneStructureReadModel } from '@/use-cases/queries/RecupererUneStructure'

describe('structure presenter : caractérisation des enveloppes (Conum ET FNE, aucun filtrage)', () => {
  it('cas mixte : les 4 enveloppes Conum + FNE sont toutes restituées avec couleurs cycliques', () => {
    // GIVEN
    const readModel = structureReadModel([
      { libelle: 'Conseiller Numérique - initiale - État', montant: 1_200_009, type: 'conseiller_numerique' },
      { libelle: 'Conseiller Numérique - Renouvellement - État', montant: 665_000, type: 'conseiller_numerique' },
      { libelle: 'Ingénierie France Numérique Ensemble - 2024 - État', montant: 49_100, type: 'fne' },
      { libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État', montant: 20_000, type: 'fne' },
    ])

    // WHEN
    const viewModel = structurePresenter(readModel, epochTimePlusOneDay)

    // THEN
    expect(viewModel.conventionsEtFinancements.enveloppes).toStrictEqual([
      {
        color: 'france',
        libelle: 'Conseiller Numérique - initiale - État',
        montant: 1_200_009,
        montantFormate: formatMontant(1_200_009),
      },
      {
        color: 'menthe',
        libelle: 'Conseiller Numérique - Renouvellement - État',
        montant: 665_000,
        montantFormate: formatMontant(665_000),
      },
      {
        color: 'tilleul',
        libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
        montant: 49_100,
        montantFormate: formatMontant(49_100),
      },
      {
        color: 'france',
        libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
        montant: 20_000,
        montantFormate: formatMontant(20_000),
      },
    ])
  })

  it('cas FNE pur : seules les enveloppes FNE sont restituées (aucune exclusion par type)', () => {
    // GIVEN
    const readModel = structureReadModel([
      { libelle: 'Ingénierie France Numérique Ensemble - 2024 - État', montant: 47_200, type: 'fne' },
      { libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État', montant: 20_000, type: 'fne' },
    ])

    // WHEN
    const viewModel = structurePresenter(readModel, epochTimePlusOneDay)

    // THEN
    expect(viewModel.conventionsEtFinancements.enveloppes.map((enveloppe) => enveloppe.libelle)).toStrictEqual([
      'Ingénierie France Numérique Ensemble - 2024 - État',
      'Formation Aidant Numérique/Aidants Connect - 2024 - État',
    ])
    expect(viewModel.conventionsEtFinancements.creditsEngagesParLEtat).toBe(formatMontant(67_200))
  })
})

function structureReadModel(
  enveloppes: ReadonlyArray<{ libelle: string; montant: number; type: 'conseiller_numerique' | 'fne' }>
): UneStructureReadModel {
  const creditsEngagesParLEtat = enveloppes.reduce((somme, enveloppe) => somme + enveloppe.montant, 0)

  return {
    aidantsEtMediateurs: {
      liste: [],
      totalAidant: 0,
      totalCoordinateur: 0,
      totalMediateur: 0,
    },
    contacts: [],
    contratsRattaches: [],
    conventionsEtFinancements: {
      conventions: [],
      creditsEngagesParLEtat,
      enveloppes,
      lienConventions: '#',
    },
    identite: {
      adresse: '12 Rue Saint-Laurent, 14000 Caen',
      codePostal: '14000',
      commune: 'Caen',
      deletedAt: null,
      denominationAntenne: null,
      departement: 'Calvados',
      editeur: 'carto',
      edition: epochTime,
      nom: 'DEPARTEMENT DU CALVADOS',
      region: 'Normandie',
      siret: '22140118500014',
      typologie: 'DEPT',
    },
    role: {
      feuillesDeRoute: [],
      gouvernances: [],
      membreDepuisLe: undefined,
    },
    structureId: 28189,
  }
}
