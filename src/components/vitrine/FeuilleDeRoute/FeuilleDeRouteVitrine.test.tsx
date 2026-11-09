import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FeuilleDeRouteVitrine from './FeuilleDeRouteVitrine'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { epochTime } from '@/shared/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('feuilles de route du site vitrine', () => {
  it('le document de chaque feuille de route est une zone nommée par son titre, de niveau 3 sous la feuille de route', () => {
    // GIVEN
    const [premiere, seconde] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
        { ...seconde, pieceJointe: { chemin: 'user/1/seconde.pdf', nom: 'seconde.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const zonePremiere = screen.getByRole('region', { name: 'premiere.pdf' })
    const titrePremiere = within(zonePremiere).getByRole('heading', { level: 3, name: 'premiere.pdf' })
    const zoneSeconde = screen.getByRole('region', { name: 'seconde.pdf' })
    const titreSeconde = within(zoneSeconde).getByRole('heading', { level: 3, name: 'seconde.pdf' })
    expect(titrePremiere.id).not.toBe(titreSeconde.id)
    expect(screen.queryAllByRole('heading', { level: 2, name: /\.pdf$/ })).toHaveLength(0)
  })
})
