import { describe, expect, it } from 'vitest'

import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from './shared/enveloppe'
import { formatMontant } from './shared/number'
import { structurePresenter } from './structurePresenter'
import { epochTime, epochTimePlusOneDay } from './testHelper'
import { UneStructureReadModel } from '@/use-cases/queries/RecupererUneStructure'

describe('structure presenter : caractérisation des enveloppes (Conum ET FNE, aucun filtrage)', () => {
  it('cas mixte : les 4 enveloppes Conum + FNE sont toutes restituées avec la même couleur que le tableau de bord (par libellé)', () => {
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
    const couleur = (libelle: string) => obtenirCouleurEnveloppe(libelle)

    expect(viewModel.conventionsEtFinancements.enveloppes).toStrictEqual([
      {
        color: couleur('Conseiller Numérique - initiale - État'),
        couleurGraphique: obtenirCouleurGraphique(couleur('Conseiller Numérique - initiale - État')),
        libelle: 'Conseiller Numérique - initiale - État',
        montant: 1_200_009,
        montantFormate: formatMontant(1_200_009),
      },
      {
        color: couleur('Conseiller Numérique - Renouvellement - État'),
        couleurGraphique: obtenirCouleurGraphique(couleur('Conseiller Numérique - Renouvellement - État')),
        libelle: 'Conseiller Numérique - Renouvellement - État',
        montant: 665_000,
        montantFormate: formatMontant(665_000),
      },
      {
        color: couleur('Ingénierie France Numérique Ensemble - 2024 - État'),
        couleurGraphique: obtenirCouleurGraphique(couleur('Ingénierie France Numérique Ensemble - 2024 - État')),
        libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
        montant: 49_100,
        montantFormate: formatMontant(49_100),
      },
      {
        color: couleur('Formation Aidant Numérique/Aidants Connect - 2024 - État'),
        couleurGraphique: obtenirCouleurGraphique(couleur('Formation Aidant Numérique/Aidants Connect - 2024 - État')),
        libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
        montant: 20_000,
        montantFormate: formatMontant(20_000),
      },
    ])

    // Même libellé côté "ma structure" et côté tableau de bord ⇒ même couleur (source de vérité partagée)
    expect(couleur('Conseiller Numérique - initiale - État')).toBe(
      couleur('Conseiller Numérique - Plan France Relance - État')
    )
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

  it('avec une attestation de moins de trois mois, le label est actif jusqu’à la date de renouvellement (attestation + 3 mois)', () => {
    // GIVEN
    const readModel = structureReadModel([], new Date('2026-06-12'))

    // WHEN
    const viewModel = structurePresenter(readModel, new Date('2026-08-12'))

    // THEN
    expect(viewModel.labellisations.labelConum).toStrictEqual({
      estActif: true,
      statut: "Jusqu'au 12/09/2026",
    })
  })

  it('avec une attestation de plus de trois mois, le label est suspendu', () => {
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
