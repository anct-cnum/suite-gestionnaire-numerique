import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Gouvernance from '../Gouvernance'
import MembreRempli from './MembreRempli'
import { renderComponent, simulerResizeObserver } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  beforeEach(() => {
    simulerResizeObserver()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('le nom, le type et le rôle de chaque membre sont dans des colonnes aux en-têtes visibles, sans colonne de logo (RGAA 10.11)', () => {
    // GIVEN
    afficherMembres()

    // THEN
    const tableau = screen.getByRole('table', { name: 'Membres de la gouvernance' })
    const [enTete, corps] = within(tableau).getAllByRole('rowgroup')
    expect(enTete).not.toHaveClass('fr-sr-only')
    const enTetes = within(enTete)
      .getAllByRole('columnheader')
      .map((colonne) => colonne.textContent)
    expect(enTetes).toStrictEqual(['Nom', 'Type', 'Rôle'])
    const cellules = within(within(corps).getByRole('row'))
      .getAllByRole('cell')
      .map((cellule) => cellule.textContent)
    expect(cellules).toStrictEqual([
      'CENTRE REGIONAL INFORMATION JEUNESSE AUVERGNE RHONE ALPES',
      'Association',
      'Co-porteur ',
    ])
  })

  it('quand le tableau est plus large que son cadre, le cadre est atteignable au clavier pour le faire défiler', () => {
    // GIVEN
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(554)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(311)

    // WHEN
    afficherMembres()

    // THEN
    const cadre = screen.getByRole('region', { name: 'Membres de la gouvernance' })
    expect(cadre).toHaveAttribute('tabindex', '0')
  })

  it('quand le tableau tient dans son cadre, le cadre n’ajoute pas d’arrêt de tabulation', () => {
    // WHEN
    afficherMembres()

    // THEN
    const cadre = screen.getByRole('region', { name: 'Membres de la gouvernance' })
    expect(cadre).not.toHaveAttribute('tabindex')
  })
})

function afficherMembres(): void {
  renderComponent(
    <MembreRempli
      coporteurs={[
        {
          details: [],
          logo: 'community-line',
          nom: 'CENTRE REGIONAL INFORMATION JEUNESSE AUVERGNE RHONE ALPES',
          roles: [{ color: 'purple-glycine', nom: 'Co-porteur' }],
          type: 'Association',
        },
      ]}
    />
  )
}

function afficherGouvernance(gouvernance?: Parameters<typeof gouvernanceReadModelFactory>[0]): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(gouvernance), epochTime)
  renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)
}
