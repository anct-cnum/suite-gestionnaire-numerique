import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Gouvernance from '../Gouvernance'
import MembreRempli from './MembreRempli'
import { renderComponent } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('le nom du membre de la préfecture est un lien vers la structure correspondante', () => {
    // GIVEN
    afficherGouvernance()

    // THEN
    const lien = screen.getByRole('link', { name: 'Préfecture du Rhône' })
    expect(lien).toHaveAttribute('href', '/structure/10')
  })

  it('le nom du membre autre que la préfecture est un lien vers la structure correspondante', () => {
    // GIVEN
    afficherGouvernance()

    // THEN
    const lien = screen.getByRole('link', { name: 'Département du Rhône' })
    expect(lien).toHaveAttribute('href', '/structure/20')
  })

  it('le nom du membre sans page de détail n’est pas un lien', () => {
    // GIVEN
    renderComponent(
      <MembreRempli
        coporteurs={[
          {
            details: [],
            logo: 'bank-line',
            nom: 'Département du Rhône',
            roles: [],
            type: 'Collectivité',
          },
        ]}
      />
    )

    // THEN
    expect(screen.getByText('Département du Rhône')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Département du Rhône' })).not.toBeInTheDocument()
  })
})

function afficherGouvernance(gouvernance?: Parameters<typeof gouvernanceReadModelFactory>[0]): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(gouvernance), epochTime)
  renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)
}
