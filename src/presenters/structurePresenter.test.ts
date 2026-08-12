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

describe('structure presenter : statut du label conseiller numérique', () => {
  it('sans attestation, aucun label conum n’est présenté', () => {
    // GIVEN
    const readModel = structureReadModel([], null)

    // WHEN
    const viewModel = structurePresenter(readModel, epochTimePlusOneDay)

    // THEN
    expect(viewModel.labellisations.labelConum).toBeUndefined()
  })

  it('avec une attestation de moins d’un an, le label est actif jusqu’à la date de renouvellement (attestation + 1 an)', () => {
    // GIVEN
    const readModel = structureReadModel([], new Date('2025-12-12'))

    // WHEN
    const viewModel = structurePresenter(readModel, new Date('2026-08-12'))

    // THEN
    expect(viewModel.labellisations.labelConum).toStrictEqual({
      estActif: true,
      statut: "Jusqu'au 12/12/2026",
    })
  })

  it('avec une attestation de plus d’un an, le label est suspendu', () => {
    // GIVEN
    const readModel = structureReadModel([], new Date('2024-06-01'))

    // WHEN
    const viewModel = structurePresenter(readModel, new Date('2026-08-12'))

    // THEN
    expect(viewModel.labellisations.labelConum).toStrictEqual({
      estActif: false,
      statut: 'Suspendu',
    })
  })
})

describe('structure presenter : habilitation aidants connect', () => {
  it.each([
    { estHabiliteeAidantsConnect: true, intention: 'avec un rattachement Aidants Connect, la structure est habilitée' },
    {
      estHabiliteeAidantsConnect: false,
      intention: 'sans rattachement Aidants Connect, la structure n’est pas habilitée',
    },
  ])('$intention', ({ estHabiliteeAidantsConnect }) => {
    // GIVEN
    const readModel = structureReadModel([], null, estHabiliteeAidantsConnect)

    // WHEN
    const viewModel = structurePresenter(readModel, epochTimePlusOneDay)

    // THEN
    expect(viewModel.labellisations.estHabiliteeAidantsConnect).toBe(estHabiliteeAidantsConnect)
  })
})

function structureReadModel(
  enveloppes: ReadonlyArray<{ libelle: string; montant: number; type: 'conseiller_numerique' | 'fne' }>,
  derniereAttestationLabelConum: Date | null = null,
  estHabiliteeAidantsConnect = false
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
    labellisations: {
      derniereAttestationLabelConum,
      estHabiliteeAidantsConnect,
    },
    role: {
      feuillesDeRoute: [],
      gouvernances: [],
      membreDepuisLe: undefined,
    },
    structureId: 28189,
  }
}
