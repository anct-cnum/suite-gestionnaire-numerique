import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Alerte from './Alerte'

describe('alerte DSFR', () => {
  it('affiche un titre de niveau 3 et le message, en information par défaut (rôle status)', () => {
    // WHEN
    render(<Alerte titre="Lieu géré dans la Coop numérique">Les informations viennent de la Coop.</Alerte>)

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: 'Lieu géré dans la Coop numérique' })).toBeInTheDocument()
    expect(screen.getByText('Les informations viennent de la Coop.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveClass('fr-alert', 'fr-alert--info')
  })

  it.each([
    { role: 'status', type: 'success' as const },
    { role: 'alert', type: 'warning' as const },
    { role: 'alert', type: 'error' as const },
  ])('prend la variante $type du DSFR avec le rôle $role', ({ role, type }) => {
    // WHEN
    render(
      <Alerte titre="Titre" type={type}>
        Message
      </Alerte>
    )

    // THEN
    expect(screen.getByRole(role)).toHaveClass('fr-alert', `fr-alert--${type}`)
  })
})
