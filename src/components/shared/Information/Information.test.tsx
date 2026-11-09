import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import Information from './Information'

describe('infobulle d’information', () => {
  it('est déclenchée par un bouton nommé, décrit par l’infobulle DSFR (RGAA 1.1, 7.3, 10.13)', () => {
    // WHEN
    render(
      <Information libelle="Plus d'information sur l'indice de fragilité numérique">
        Issu des données de la Mednum
      </Information>
    )

    // THEN
    const declencheur = screen.getByRole('button', { name: "Plus d'information sur l'indice de fragilité numérique" })
    expect(declencheur).toHaveAttribute('type', 'button')
    expect(declencheur).toHaveClass('fr-btn', 'fr-icon-information-line')
    expect(declencheur).toHaveAccessibleDescription('Issu des données de la Mednum')
    const infobulle = screen.getByRole('tooltip', { hidden: true })
    expect(infobulle).toHaveClass('fr-tooltip')
    expect(infobulle.id).toBe(declencheur.getAttribute('aria-describedby'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('est atteignable au clavier', async () => {
    // GIVEN
    render(<Information libelle="Plus d'information sur les lieux d'inclusion numérique">Contenu</Information>)

    // WHEN
    await userEvent.tab()

    // THEN
    expect(screen.getByRole('button', { name: "Plus d'information sur les lieux d'inclusion numérique" })).toHaveFocus()
  })
})
