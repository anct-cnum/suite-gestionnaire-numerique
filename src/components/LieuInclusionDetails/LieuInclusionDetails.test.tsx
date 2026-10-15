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
  it('quand le lieu est géré dans la Coop, alors un message dit que ses médiateurs verront les modifications, qui restent possibles (#2105)', () => {
    // GIVEN
    const data = {
      ...createDefaultLieuInclusionDetailsData(),
      estLieuCoop: true,
      peutModifier: true,
      peutModifierInformationsGenerales: true,
    }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={true} />)

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: 'Lieu géré dans la Coop numérique' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ce lieu est aussi renseigné par ses médiateurs dans la Coop numérique. Vos modifications leur seront présentées, et ils pourront les reprendre.'
      )
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Modifier' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Supprimer ce lieu' })).toBeInTheDocument()
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
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={true} />)

    // THEN
    expect(screen.queryByRole('heading', { name: 'Lieu géré dans la Coop numérique' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Modifier' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Supprimer ce lieu' })).toBeInTheDocument()
  })

  it('signale un lieu visible mais pas encore référencé sur la carte (#1495)', () => {
    // GIVEN
    const data = { ...createDefaultLieuInclusionDetailsData(), estEnAttenteDeReferencement: true }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(
      screen.getByRole('heading', { level: 3, name: 'En attente de référencement sur la cartographie' })
    ).toBeInTheDocument()
  })

  it('quand on arrive depuis « C’est mon lieu », accueille avec un bandeau qui dit que le lieu existe déjà (V6-3)', () => {
    // GIVEN
    const data = createDefaultLieuInclusionDetailsData()

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={true} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(screen.getByText('Ce lieu est déjà enregistré')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Vous n’avez pas besoin de le créer. Vérifiez ses informations et modifiez-les si elles ne sont plus à jour.'
      )
    ).toBeInTheDocument()
  })

  it('n’affiche pas ce bandeau quand on arrive sur la fiche par le chemin habituel', () => {
    // GIVEN
    const data = createDefaultLieuInclusionDetailsData()

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(screen.queryByText('Ce lieu est déjà enregistré')).not.toBeInTheDocument()
  })

  it('ne signale rien quand le lieu est référencé sur la carte', () => {
    // GIVEN
    const data = { ...createDefaultLieuInclusionDetailsData(), estEnAttenteDeReferencement: false }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(
      screen.queryByRole('heading', { level: 3, name: 'En attente de référencement sur la cartographie' })
    ).not.toBeInTheDocument()
  })
})
