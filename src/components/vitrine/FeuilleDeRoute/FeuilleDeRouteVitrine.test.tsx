import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FeuilleDeRouteVitrine from './FeuilleDeRouteVitrine'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { epochTime } from '@/shared/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('feuilles de route du site vitrine', () => {
  it('le document de chaque feuille de route est présenté sous un titre de niveau 3, dans la zone de sa feuille de route, sans zone propre', () => {
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
    for (const nom of ['Feuille de route 1', 'Feuille de route 2']) {
      const zone = screen.getByRole('region', { name: nom })
      within(zone).getByRole('heading', { level: 3, name: 'Document de la feuille de route' })
      within(zone).getByRole('link', { name: `Télécharger la feuille de route « ${nom} » PDF` })
    }
    expect(screen.queryAllByRole('region', { name: 'Document de la feuille de route' })).toHaveLength(0)
  })

  it('le lien de téléchargement annonce le format déduit de l’extension et le poids lu dans le stockage', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...premiere,
          pieceJointe: { chemin: 'user/1/doc.odt', nom: 'Feuille de route.odt', poids: 1_638_400, upload: epochTime },
        },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const lien = screen.getByRole('link', {
      name: 'Télécharger la feuille de route « Feuille de route 1 » ODT – 1,6 Mo',
    })
    expect(lien.getAttribute('href')).toBe('/api/document-feuille-de-route/user/1/doc.odt')
    expect(lien.hasAttribute('download')).toBe(true)
    expect(lien.getAttribute('target')).toBeNull()
  })

  it('le document cite la structure porteuse comme source, ou le territoire quand il n’y en a pas', () => {
    // GIVEN
    const [premiere, , troisieme] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
        { ...troisieme, pieceJointe: { chemin: 'user/3/troisieme.pdf', nom: 'troisieme.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const avecPorteur = screen.getByRole('region', { name: 'Feuille de route 1' })
    expect(
      within(avecPorteur).getByText('Document fourni par CC des Monts du Lyonnais, mis en ligne le 01/01/1970.')
    ).not.toBeNull()
    const sansPorteur = screen.getByRole('region', { name: 'Feuille de route 3' })
    expect(
      within(sansPorteur).getByText('Document fourni par le territoire, mis en ligne le 01/01/1970.')
    ).not.toBeNull()
  })

  it('le document avertit que son accessibilité n’est pas garantie et renvoie vers la déclaration d’accessibilité', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const avertissement = screen.getByText(/^L’accessibilité de ce document/)
    expect(avertissement.textContent).toBe(
      'L’accessibilité de ce document, rédigé par le territoire, n’est pas garantie. ' +
        'Pour en obtenir une version accessible, utilisez le contact indiqué dans la déclaration d’accessibilité.'
    )
    const lien = within(avertissement).getByRole('link', { name: 'déclaration d’accessibilité' })
    expect(lien.getAttribute('href')).toBe('/accessibilite')
  })

  it('une feuille de route sans document n’affiche ni bloc ni lien de téléchargement', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [{ ...premiere, pieceJointe: undefined }],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    expect(screen.queryByRole('heading', { name: 'Document de la feuille de route' })).toBeNull()
    expect(screen.queryByRole('link', { name: /^Télécharger/ })).toBeNull()
  })
})
