import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BandeauLabelConumActif from './BandeauLabelConumActif'
import { renderComponent } from '../testHelper'

describe('bandeau label conum actif', () => {
  afterEach(() => {
    delete (globalThis as { _paq?: unknown })._paq
  })

  it('affiche le titre, le texte du label actif et le bouton vers la section labellisation de la structure', () => {
    // WHEN
    renderComponent(<BandeauLabelConumActif structureId={42} />)

    // THEN
    const titre = screen.getByRole('heading', {
      level: 2,
      name: '✅ Votre structure est labellisée conseiller numérique',
    })
    expect(titre).toBeInTheDocument()
    expect(screen.getByText('Le label est actif.', { exact: false })).toBeInTheDocument()
    const bouton = screen.getByRole('link', { name: 'Voir le statut de mon label' })
    expect(bouton).toHaveAttribute('href', '/structure/42#labellisation')
  })

  it('quand le bouton est cliqué alors le clic est suivi dans le plan de marquage', async () => {
    // GIVEN
    const push = vi.fn<(evenement: ReadonlyArray<string>) => void>()
    Object.assign(globalThis, { _paq: { push } })
    renderComponent(<BandeauLabelConumActif structureId={42} />)

    // WHEN
    await userEvent.click(screen.getByRole('link', { name: 'Voir le statut de mon label' }))

    // THEN
    expect(push).toHaveBeenCalledWith([
      'trackEvent',
      'tableau_de_bord',
      'clic_voir_statut_label',
      'gestionnaire_structure',
    ])
  })

  it('quand le script de mesure d’audience est absent alors le clic n’échoue pas', async () => {
    // GIVEN
    renderComponent(<BandeauLabelConumActif structureId={42} />)

    // WHEN
    await userEvent.click(screen.getByRole('link', { name: 'Voir le statut de mon label' }))

    // THEN
    expect(screen.getByRole('link', { name: 'Voir le statut de mon label' })).toBeInTheDocument()
  })
})
