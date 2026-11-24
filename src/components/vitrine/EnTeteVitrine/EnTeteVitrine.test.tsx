import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import EnTeteVitrine from './EnTeteVitrine'

const mockPathname = vi.hoisted(() => ({ current: '/' }))

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => mockPathname.current,
}))

describe('en-tête de la vitrine', () => {
  it.each([
    { intention: 'l’accueil', pathname: '/', rubrique: 'Accueil' },
    { intention: 'une page de premier niveau', pathname: '/lieux', rubrique: 'Lieux' },
    { intention: 'une ancienne adresse préfixée', pathname: '/vitrine/dispositifs', rubrique: 'Dispositifs' },
    { intention: 'l’accueil des données', pathname: '/donnees-territoriales', rubrique: 'Données territoriales' },
  ])('sur $intention, le menu principal signale la page en cours (RGAA 10.10)', ({ pathname, rubrique }) => {
    // GIVEN
    mockPathname.current = pathname

    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const menu = screen.getByRole('navigation', { hidden: true, name: 'Menu principal' })
    const lienCourant = within(menu).getByRole('link', { current: 'page', hidden: true })
    expect(lienCourant.textContent).toBe(rubrique)
    expect(within(menu).queryByRole('link', { current: true, hidden: true })).not.toBeInTheDocument()
  })

  it.each([
    {
      intention: 'une page de données',
      pathname: '/donnees-territoriales/gouvernances/departement/69',
      rubrique: 'Données territoriales',
    },
    { intention: 'la page d’un outil', pathname: '/outils-numeriques/min', rubrique: 'Outils numériques' },
  ])('sur $intention, le menu principal signale la rubrique parente (RGAA 10.10)', ({ pathname, rubrique }) => {
    // GIVEN
    mockPathname.current = pathname

    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const menu = screen.getByRole('navigation', { hidden: true, name: 'Menu principal' })
    const lienRubrique = within(menu).getByRole('link', { current: true, hidden: true })
    expect(lienRubrique.textContent).toBe(rubrique)
    expect(within(menu).queryByRole('link', { current: 'page', hidden: true })).not.toBeInTheDocument()
  })

  it('les liens du menu principal pointent vers les adresses publiques, sans le préfixe technique /vitrine', () => {
    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const menu = screen.getByRole('navigation', { hidden: true, name: 'Menu principal' })
    const adresses = within(menu)
      .getAllByRole('link', { hidden: true })
      .map((lien) => lien.getAttribute('href'))
    expect(adresses).toStrictEqual([
      '/',
      '/lieux',
      '/dispositifs',
      '/donnees-territoriales',
      '/outils-numeriques',
      'https://www.societenumerique.gouv.fr/nos-ressources/etudes',
      'https://labo.societenumerique.gouv.fr/fr/',
    ])
  })

  it('le nom du service ramène à l’accueil de la vitrine avec un intitulé explicite', () => {
    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const enTete = screen.getByRole('banner')
    const lienAccueil = within(enTete).getByRole('link', { name: "Retour à l'accueil Inclusion Numérique" })
    expect(lienAccueil).toHaveAttribute('href', '/')
    expect(lienAccueil).not.toHaveAttribute('title')
    expect(within(lienAccueil).getByText('Inclusion Numérique')).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([
    { href: 'https://www.societenumerique.gouv.fr/nos-ressources/etudes', intitule: 'Études' },
    { href: 'https://labo.societenumerique.gouv.fr/fr/', intitule: 'Labo Société Numérique' },
  ])('le lien « $intitule » du menu signale qu’il ouvre une nouvelle fenêtre', ({ href, intitule }) => {
    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const lien = screen.getByRole('link', { hidden: true, name: intitule })
    expect(lien).toHaveAttribute('href', href)
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('title', `${intitule} - nouvelle fenêtre`)
  })
})
