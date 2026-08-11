import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import EnTeteLabel from './EnTeteLabel'

describe('en-tête du parcours label', () => {
  it('affiche le logo ANCT, le service conseiller numérique et le lien d’aide', () => {
    // WHEN
    render(<EnTeteLabel />)

    // THEN
    expect(screen.getByRole('img', { name: 'Agence Nationale de la Cohésion des Territoires' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CONSEILLER NUMÉRIQUE/ })).toHaveAttribute('href', '/label')
    expect(screen.getByRole('link', { name: 'J’ai une question' })).toHaveAttribute(
      'href',
      'mailto:moninclusionnumerique@anct.gouv.fr'
    )
  })
})
