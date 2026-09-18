import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LieuxInclusionDetails from './LieuInclusionDetails'
import { renderComponent } from '../testHelper'
import { createDefaultLieuInclusionDetailsData } from '@/stories/Components/LieuInclusionDetails/LieuInclusionDetailsTestData'

// Les sections lisent l'identifiant du lieu dans l'URL et le bouton de suppression redirige.
vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/lieu/42',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: vi.fn<(href: string) => void>() }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
}))

describe('fiche d’un lieu d’inclusion', () => {
  it('quand le lieu est géré dans la Coop, alors un message le dit et aucune action de modification n’est proposée (#1951)', () => {
    // GIVEN
    const data = {
      ...createDefaultLieuInclusionDetailsData(),
      estLieuCoop: true,
      peutModifier: false,
      peutModifierInformationsGenerales: false,
    }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: 'Lieu géré dans la Coop numérique' })).toBeInTheDocument()
    expect(screen.getByText(/passez par la Coop/)).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: 'Modifier' })).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Supprimer ce lieu' })).not.toBeInTheDocument()
  })

  it('quand le lieu n’est pas géré dans la Coop, alors aucun message n’est affiché et les actions restent disponibles', () => {
    // GIVEN
    const data = {
      ...createDefaultLieuInclusionDetailsData(),
      estLieuCoop: false,
      peutModifier: true,
      peutModifierInformationsGenerales: true,
    }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} lieuId="42" peutSupprimer={true} />)

    // THEN
    expect(screen.queryByRole('heading', { name: 'Lieu géré dans la Coop numérique' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Modifier' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Supprimer ce lieu' })).toBeInTheDocument()
  })

  it('signale un lieu visible mais pas encore référencé sur la carte (#1495)', () => {
    // GIVEN
    const data = { ...createDefaultLieuInclusionDetailsData(), estEnAttenteDeReferencement: true }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(
      screen.getByRole('heading', { level: 3, name: 'En attente de référencement sur la cartographie' })
    ).toBeInTheDocument()
  })

  it('ne signale rien quand le lieu est référencé sur la carte', () => {
    // GIVEN
    const data = { ...createDefaultLieuInclusionDetailsData(), estEnAttenteDeReferencement: false }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(
      screen.queryByRole('heading', { level: 3, name: 'En attente de référencement sur la cartographie' })
    ).not.toBeInTheDocument()
  })
})
