import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NoticeEpciMultiDepartements from './NoticeEpciMultiDepartements'
import { renderComponent } from '../../testHelper'

describe('notice epci multi-départements', () => {
  it('affiche le bandeau d’information avec le titre et le texte explicatif', () => {
    // WHEN
    renderComponent(
      <NoticeEpciMultiDepartements
        viewModel={{
          description:
            'Les données présentées couvrent l’ensemble de ses communes, y compris celles situées hors du Rhône.',
          titre: 'Cette intercommunalité s’étend sur 2 départements.',
        }}
      />
    )

    // THEN
    const titre = screen.getByText('Cette intercommunalité s’étend sur 2 départements.')
    expect(titre.textContent).toBe('Cette intercommunalité s’étend sur 2 départements.')
    const description = screen.getByText(
      'Les données présentées couvrent l’ensemble de ses communes, y compris celles situées hors du Rhône.'
    )
    expect(description.textContent).toBe(
      'Les données présentées couvrent l’ensemble de ses communes, y compris celles situées hors du Rhône.'
    )
  })
})
