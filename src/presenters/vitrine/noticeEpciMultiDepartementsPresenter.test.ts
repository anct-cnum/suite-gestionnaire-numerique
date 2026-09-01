import { describe, expect, it } from 'vitest'

import { noticeEpciMultiDepartementsPresenter } from './noticeEpciMultiDepartementsPresenter'

describe('notice epci multi-départements presenter', () => {
  it('quand l’EPCI couvre un seul département alors aucun message n’est affiché', () => {
    // WHEN
    const viewModel = noticeEpciMultiDepartementsPresenter({ codeDepartement: '69', nombreDepartements: 1 })

    // THEN
    expect(viewModel).toBeNull()
  })

  it('quand l’EPCI n’a pas de département de rattachement alors aucun message n’est affiché', () => {
    // WHEN
    const viewModel = noticeEpciMultiDepartementsPresenter({ codeDepartement: null, nombreDepartements: 2 })

    // THEN
    expect(viewModel).toBeNull()
  })

  it('quand le département de rattachement est inconnu du référentiel alors aucun message n’est affiché', () => {
    // WHEN
    const viewModel = noticeEpciMultiDepartementsPresenter({ codeDepartement: '999', nombreDepartements: 2 })

    // THEN
    expect(viewModel).toBeNull()
  })

  it('quand l’EPCI couvre plusieurs départements alors le message reprend leur nombre et le département de contexte', () => {
    // WHEN
    const viewModel = noticeEpciMultiDepartementsPresenter({ codeDepartement: '69', nombreDepartements: 2 })

    // THEN
    expect(viewModel).toStrictEqual({
      description:
        'Les données présentées couvrent l’ensemble de ses communes, y compris celles situées hors du Rhône.',
      titre: 'Cette intercommunalité s’étend sur 2 départements.',
    })
  })

  it.each([
    { codeDepartement: '01', horsDu: 'hors de l’Ain', intention: 'un nom à élision' },
    { codeDepartement: '34', horsDu: 'hors de l’Hérault', intention: 'un nom à élision avec h muet' },
    { codeDepartement: '71', horsDu: 'hors de la Saône-et-Loire', intention: 'un nom féminin' },
    { codeDepartement: '88', horsDu: 'hors des Vosges', intention: 'un nom au pluriel' },
    { codeDepartement: '90', horsDu: 'hors du Territoire de Belfort', intention: 'un nom masculin' },
    { codeDepartement: '75', horsDu: 'hors de Paris', intention: 'un nom sans article' },
  ])(
    'quand le département de contexte a $intention alors le message est accordé : « $horsDu »',
    ({ codeDepartement, horsDu }) => {
      // WHEN
      const viewModel = noticeEpciMultiDepartementsPresenter({ codeDepartement, nombreDepartements: 3 })

      // THEN
      expect(viewModel?.description).toBe(
        `Les données présentées couvrent l’ensemble de ses communes, y compris celles situées ${horsDu}.`
      )
    }
  )
})
