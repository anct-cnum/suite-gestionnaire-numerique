import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NoticeInformation from './NoticeInformation'
import { renderComponent } from '../../testHelper'

describe('notice information', () => {
  it('avec un titre, affiche le titre en gras sur sa propre ligne puis le texte explicatif', () => {
    // WHEN
    renderComponent(
      <NoticeInformation
        viewModel={{
          description:
            'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
            ' de la CC Saône-Beaujolais au sein de la gouvernance du Rhône.',
          titre: 'La gouvernance est pilotée à l’échelle départementale',
        }}
      />
    )

    // THEN
    const titre = screen.getByText('La gouvernance est pilotée à l’échelle départementale')
    expect(titre.textContent).toBe('La gouvernance est pilotée à l’échelle départementale')
    const description = screen.getByText('Il n’existe pas de gouvernance propre à une intercommunalité.', {
      exact: false,
    })
    expect(description.textContent).toBe(
      'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
        ' de la CC Saône-Beaujolais au sein de la gouvernance du Rhône.'
    )
    expect(titre).not.toBe(description)
  })

  it('sans titre, affiche uniquement le texte explicatif', () => {
    // WHEN
    renderComponent(
      <NoticeInformation
        viewModel={{
          description:
            'Cette intercommunalité s’étend sur 2 départements. Les données présentées couvrent l’ensemble' +
            ' de ses communes, y compris celles situées hors du Rhône.',
        }}
      />
    )

    // THEN
    const description = screen.getByText('Cette intercommunalité s’étend sur 2 départements.', { exact: false })
    expect(description.textContent).toBe(
      'Cette intercommunalité s’étend sur 2 départements. Les données présentées couvrent l’ensemble' +
        ' de ses communes, y compris celles situées hors du Rhône.'
    )
  })
})
