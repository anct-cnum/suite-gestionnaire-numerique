import { describe, expect, it } from 'vitest'

import { posteConseillerNumeriqueDetailPresenter } from './posteConseillerNumeriqueDetailPresenter'
import { formatMontant } from './shared/number'
import { epochTime, epochTimeMinusOneDay } from './testHelper'
import { PosteConseillerNumeriqueDetailReadModel } from '@/use-cases/queries/RecupererUnPosteConseillerNumerique'

describe('poste conseiller numérique presenter : caractérisation des enveloppes (Conum uniquement)', () => {
  it('avec conventions V1 et V2, les enveloppes sont exactement les 2 enveloppes Conseiller Numérique (jamais de FNE)', () => {
    // GIVEN
    const readModel = posteReadModel({
      v1: { bonification: 0, dateDebut: null, dateFin: epochTimeMinusOneDay, subvention: 56_098, versement: 56_098 },
      v2: {
        bonification: 7_500,
        dateDebut: epochTimeMinusOneDay,
        dateFin: epochTimeMinusOneDay,
        subvention: 2_500,
        versement: 10_000,
      },
    })

    // WHEN
    const conventionsEtFinancements = conventionsEtFinancementsDe(readModel)

    // THEN
    expect(conventionsEtFinancements.creditsEngagesParLEtat).toBe(formatMontant(66_098))
    expect(conventionsEtFinancements.enveloppes).toStrictEqual([
      {
        color: 'menthe',
        libelle: 'Conseiller Numérique - Renouvellement - État',
        montant: 10_000,
        montantFormate: formatMontant(10_000),
      },
      {
        color: 'france',
        libelle: 'Conseiller Numérique - initiale - État',
        montant: 56_098,
        montantFormate: formatMontant(56_098),
      },
    ])
    expect(
      conventionsEtFinancements.enveloppes.every((enveloppe) => enveloppe.libelle.startsWith('Conseiller Numérique'))
    ).toBe(true)
  })

  it('avec seulement la convention V1, une seule enveloppe Conseiller Numérique initiale', () => {
    // GIVEN
    const readModel = posteReadModel({
      v1: { bonification: 0, dateDebut: null, dateFin: epochTimeMinusOneDay, subvention: 56_098, versement: 56_098 },
      v2: null,
    })

    // WHEN
    const conventionsEtFinancements = conventionsEtFinancementsDe(readModel)

    // THEN
    expect(conventionsEtFinancements.enveloppes).toStrictEqual([
      {
        color: 'france',
        libelle: 'Conseiller Numérique - initiale - État',
        montant: 56_098,
        montantFormate: formatMontant(56_098),
      },
    ])
  })

  it('sans aucune convention, aucune enveloppe', () => {
    // GIVEN
    const readModel = posteReadModel({ v1: null, v2: null })

    // WHEN
    const conventionsEtFinancements = conventionsEtFinancementsDe(readModel)

    // THEN
    expect(conventionsEtFinancements.enveloppes).toStrictEqual([])
  })
})

function conventionsEtFinancementsDe(readModel: PosteConseillerNumeriqueDetailReadModel): {
  creditsEngagesParLEtat: string
  enveloppes: ReadonlyArray<{ color: string; libelle: string; montant: number; montantFormate: string }>
} {
  const viewModel = posteConseillerNumeriqueDetailPresenter(readModel, epochTime)
  if ('type' in viewModel) {
    throw new Error('viewModel inattendu : ErrorReadModel')
  }
  return viewModel.conventionsEtFinancements
}

function posteReadModel(
  conventions: Partial<PosteConseillerNumeriqueDetailReadModel['conventions']>
): PosteConseillerNumeriqueDetailReadModel {
  const v1 = conventions.v1 ?? null
  const v2 = conventions.v2 ?? null
  const creditsEngagesParLEtat = (v1 ? v1.subvention + v1.bonification : 0) + (v2 ? v2.subvention + v2.bonification : 0)

  return {
    contrats: [],
    conventions: {
      creditsEngagesParLEtat,
      v1,
      v2,
    },
    estBonifie: true,
    estCoordinateur: false,
    posteConumId: 2672,
    posteId: 1,
    statut: 'rendu',
    structure: {
      adresse: '12 Rue Saint-Laurent, 14000 Caen',
      contacts: [],
      departement: 'Calvados',
      nom: 'DEPARTEMENT DU CALVADOS',
      region: 'Normandie',
      siret: '22140118500014',
      structureId: 28_189,
      typologie: 'DEPT',
    },
  }
}
