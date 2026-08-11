import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BandeauLabelConum from './BandeauLabelConum'
import { renderComponent } from '../testHelper'

describe('bandeau label conum', () => {
  afterEach(() => {
    delete (globalThis as { _paq?: unknown })._paq
  })

  it('affiche le titre, le texte d’éligibilité et le bouton vers le formulaire de labellisation', () => {
    // WHEN
    renderComponent(<BandeauLabelConum />)

    // THEN
    const titre = screen.getByRole('heading', {
      level: 2,
      name: 'Votre structure est éligible au label conseiller numérique',
    })
    expect(titre).toBeInTheDocument()
    expect(
      screen.getByText('La labellisation conseiller numérique est désormais ouverte.', { exact: false })
    ).toBeInTheDocument()
    const bouton = screen.getByRole('link', { name: 'Labelliser ma structure' })
    expect(bouton).toHaveAttribute('href', '/label')
  })

  it('quand le bouton est cliqué alors le clic est suivi dans le plan de marquage', async () => {
    // GIVEN
    const push = vi.fn<(evenement: ReadonlyArray<string>) => void>()
    Object.assign(globalThis, { _paq: { push } })
    renderComponent(<BandeauLabelConum />)

    // WHEN
    await userEvent.click(screen.getByRole('link', { name: 'Labelliser ma structure' }))

    // THEN
    expect(push).toHaveBeenCalledWith([
      'trackEvent',
      'tableau_de_bord',
      'clic_labelliser_structure',
      'gestionnaire_structure',
    ])
  })

  it('quand le script de mesure d’audience est absent alors le clic n’échoue pas', async () => {
    // GIVEN
    renderComponent(<BandeauLabelConum />)

    // WHEN
    await userEvent.click(screen.getByRole('link', { name: 'Labelliser ma structure' }))

    // THEN
    expect(screen.getByRole('link', { name: 'Labelliser ma structure' })).toBeInTheDocument()
  })
})
