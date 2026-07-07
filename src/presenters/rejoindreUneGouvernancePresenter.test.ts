import { describe, expect, it } from 'vitest'

import { rejoindreUneGouvernancePresenter } from './rejoindreUneGouvernancePresenter'
import { RejoindreUneGouvernanceReadModel } from '@/use-cases/queries/RecupererRejoindreUneGouvernance'

describe('rejoindre une gouvernance presenter', () => {
  it('quand la structure est complète, alors les départements sont formatés « code - nom » et l’entreprise est renseignée', () => {
    // GIVEN
    const readModel = readModelFactory()

    // WHEN
    const viewModel = rejoindreUneGouvernancePresenter(readModel)

    // THEN
    expect(viewModel.departements).toStrictEqual([
      { label: '01 - Ain', value: '01' },
      { label: '42 - Loire', value: '42' },
    ])
    expect(viewModel.entreprise).toStrictEqual({
      activitePrincipale: '85.59A',
      activitePrincipaleLibelle: 'Formation continue d’adultes (85.59A)',
      adresse: '123 rue de la Paix 75001 Paris',
      categorieJuridiqueCode: '5710',
      categorieJuridiqueLibelle: 'SAS, société par actions simplifiée',
      codeInsee: '',
      codePostal: '',
      commune: '',
      denomination: 'Ma Structure',
      identifiant: '12345678901234',
      nomVoie: '',
      numeroVoie: '',
    })
  })

  it.each([
    {
      activitePrincipaleAttendue: '-',
      activitePrincipaleCode: null,
      activitePrincipaleLibelle: null,
      intention: 'sans code ni libellé, un tiret est affiché',
    },
    {
      activitePrincipaleAttendue: '85.59A',
      activitePrincipaleCode: '85.59A',
      activitePrincipaleLibelle: null,
      intention: 'sans libellé, seul le code est affiché',
    },
    {
      activitePrincipaleAttendue: 'Formation continue d’adultes',
      activitePrincipaleCode: null,
      activitePrincipaleLibelle: 'Formation continue d’adultes',
      intention: 'sans code, seul le libellé est affiché',
    },
  ])(
    'quand l’activité principale est incomplète, $intention',
    ({ activitePrincipaleAttendue, activitePrincipaleCode, activitePrincipaleLibelle }) => {
      // GIVEN
      const readModel = readModelFactory({ activitePrincipaleCode, activitePrincipaleLibelle })

      // WHEN
      const viewModel = rejoindreUneGouvernancePresenter(readModel)

      // THEN
      expect(viewModel.entreprise.activitePrincipaleLibelle).toBe(activitePrincipaleAttendue)
    }
  )

  it('quand la catégorie juridique est inconnue, alors un tiret est affiché', () => {
    // GIVEN
    const readModel = readModelFactory({ categorieJuridiqueCode: null, categorieJuridiqueLibelle: null })

    // WHEN
    const viewModel = rejoindreUneGouvernancePresenter(readModel)

    // THEN
    expect(viewModel.entreprise.categorieJuridiqueCode).toBe('')
    expect(viewModel.entreprise.categorieJuridiqueLibelle).toBe('-')
  })
})

function readModelFactory(
  structureOverride?: Partial<RejoindreUneGouvernanceReadModel['structure']>
): RejoindreUneGouvernanceReadModel {
  return {
    departementsDisponibles: [
      { code: '01', nom: 'Ain' },
      { code: '42', nom: 'Loire' },
    ],
    structure: {
      activitePrincipaleCode: '85.59A',
      activitePrincipaleLibelle: 'Formation continue d’adultes',
      adresse: '123 rue de la Paix 75001 Paris',
      categorieJuridiqueCode: '5710',
      categorieJuridiqueLibelle: 'SAS, société par actions simplifiée',
      nom: 'Ma Structure',
      siret: '12345678901234',
      ...structureOverride,
    },
  }
}
