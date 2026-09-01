import { describe, expect, it } from 'vitest'

import { noticeGouvernanceDepartementalePresenter } from './noticeGouvernanceDepartementalePresenter'

describe('notice gouvernance départementale presenter', () => {
  it('quand le département de rattachement est inconnu du référentiel alors aucun message n’est affiché', () => {
    // WHEN
    const viewModel = noticeGouvernanceDepartementalePresenter({ codeDepartement: '999', nom: 'CC Saône-Beaujolais' })

    // THEN
    expect(viewModel).toBeNull()
  })

  it('le message reprend le nom de l’intercommunalité et le département de la gouvernance', () => {
    // WHEN
    const viewModel = noticeGouvernanceDepartementalePresenter({ codeDepartement: '69', nom: 'CC Saône-Beaujolais' })

    // THEN
    expect(viewModel).toStrictEqual({
      description:
        'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
        ' de la CC Saône-Beaujolais au sein de la gouvernance du Rhône.',
      titre: 'La gouvernance est pilotée à l’échelle départementale',
    })
  })

  it.each([
    { intention: 'un type en préfixe', nom: 'CA Redon Agglomération', place: 'de la CA Redon Agglomération' },
    { intention: 'une métropole en préfixe', nom: 'Métropole du Grand Paris', place: 'de la Métropole du Grand Paris' },
    { intention: 'une métropole en suffixe', nom: 'Bordeaux Métropole', place: 'de Bordeaux Métropole' },
    { intention: 'un nom sans type à initiale vocalique', nom: 'Est Ensemble', place: 'd’Est Ensemble' },
    {
      intention: 'une eurométropole',
      nom: 'Eurométropole de Strasbourg',
      place: 'de l’Eurométropole de Strasbourg',
    },
    { intention: 'un nom sans type', nom: 'Plaine Commune', place: 'de Plaine Commune' },
  ])('quand l’intercommunalité a $intention alors le message est accordé : « $place »', ({ nom, place }) => {
    // WHEN
    const viewModel = noticeGouvernanceDepartementalePresenter({ codeDepartement: '75', nom })

    // THEN
    expect(viewModel?.description).toBe(
      'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
        ` ${place} au sein de la gouvernance de Paris.`
    )
  })

  it.each([
    { attendu: 'de l’Ain', codeDepartement: '01', intention: 'un nom à élision' },
    { attendu: 'de la Saône-et-Loire', codeDepartement: '71', intention: 'un nom féminin' },
    { attendu: 'des Vosges', codeDepartement: '88', intention: 'un nom au pluriel' },
    { attendu: 'du Territoire de Belfort', codeDepartement: '90', intention: 'un nom masculin' },
  ])(
    'quand le département de gouvernance a $intention alors le message est accordé : « $attendu »',
    ({ attendu, codeDepartement }) => {
      // WHEN
      const viewModel = noticeGouvernanceDepartementalePresenter({ codeDepartement, nom: 'CC Cœur de Savoie' })

      // THEN
      expect(viewModel?.description).toBe(
        'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
          ` de la CC Cœur de Savoie au sein de la gouvernance ${attendu}.`
      )
    }
  )
})
