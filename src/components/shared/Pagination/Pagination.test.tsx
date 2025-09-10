import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Pagination from './Pagination'
import { renderComponent } from '@/components/testHelper'

describe('[URL] pagination', () => {
  it('[URL] quand je suis sur la première page d\'une page', () => {
    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={9}
      />
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(3)

    const premierePage = within(pages[0]).getByRole('link', { name: 'Première page' })
    expect(premierePage).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=1')
    const page1 = within(pages[1]).getByRole('link', { current: 'page', name: '1' })
    expect(page1).toHaveAttribute('href', '#')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const dernierePage = within(pages[2]).getByRole('link', { name: 'Dernière page' })
    expect(dernierePage).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=1')
  })

  it('[URL] quand je suis sur la première page de six pages', () => {
    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={55}
      />
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { current: 'page', name: '1' })
    expect(page1).toHaveAttribute('href', '#')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const page2 = within(pages[2]).getByRole('link', { name: '2' })
    expect(page2).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=2')
    expect(page2).toHaveAttribute('title', 'Page 2')
    const page3 = within(pages[3]).getByRole('link', { name: '3' })
    expect(page3).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=3')
    expect(page3).toHaveAttribute('title', 'Page 3')
    const page4 = within(pages[4]).getByRole('link', { name: '4' })
    expect(page4).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=4')
    expect(page4).toHaveAttribute('title', 'Page 4')
    const page5 = within(pages[5]).getByRole('link', { name: '5' })
    expect(page5).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=5')
    expect(page5).toHaveAttribute('title', 'Page 5')
  })

  it('[URL] quand je suis sur la deuxième page de six pages', () => {
    // GIVEN - Utilise maintenant page=2 pour la deuxième page (base 1)
    const searchParams = new URLSearchParams({ page: '2' })

    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={55}
      />,
      { searchParams }
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { name: '1' })
    expect(page1).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=1')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const page2 = within(pages[2]).getByRole('link', { current: 'page', name: '2' })
    expect(page2).toHaveAttribute('href', '#')
    expect(page2).toHaveAttribute('title', 'Page 2')
    const page3 = within(pages[3]).getByRole('link', { name: '3' })
    expect(page3).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=3')
    expect(page3).toHaveAttribute('title', 'Page 3')
    const page4 = within(pages[4]).getByRole('link', { name: '4' })
    expect(page4).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=4')
    expect(page4).toHaveAttribute('title', 'Page 4')
    const page5 = within(pages[5]).getByRole('link', { name: '5' })
    expect(page5).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=5')
    expect(page5).toHaveAttribute('title', 'Page 5')
  })

  it('[URL] quand je suis sur la quatrième page de huit pages', () => {
    // GIVEN - Utilise maintenant page=4 pour la quatrième page (base 1)
    const searchParams = new URLSearchParams({ page: '4' })

    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={75}
      />,
      { searchParams }
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { name: '2' })
    expect(page1).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=2')
    expect(page1).toHaveAttribute('title', 'Page 2')
    const page2 = within(pages[2]).getByRole('link', { name: '3' })
    expect(page2).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=3')
    expect(page2).toHaveAttribute('title', 'Page 3')
    const page3 = within(pages[3]).getByRole('link', { current: 'page', name: '4' })
    expect(page3).toHaveAttribute('href', '#')
    expect(page3).toHaveAttribute('title', 'Page 4')
    const page4 = within(pages[4]).getByRole('link', { name: '5' })
    expect(page4).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=5')
    expect(page4).toHaveAttribute('title', 'Page 5')
    const page5 = within(pages[5]).getByRole('link', { name: '6' })
    expect(page5).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=6')
    expect(page5).toHaveAttribute('title', 'Page 6')
  })

  it('[URL] quand je suis sur la cinquième page de six pages', () => {
    // GIVEN - Utilise maintenant page=5 pour la cinquième page (base 1)
    const searchParams = new URLSearchParams({ page: '5' })

    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={55}
      />,
      { searchParams }
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { name: '2' })
    expect(page1).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=2')
    expect(page1).toHaveAttribute('title', 'Page 2')
    const page2 = within(pages[2]).getByRole('link', { name: '3' })
    expect(page2).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=3')
    expect(page2).toHaveAttribute('title', 'Page 3')
    const page3 = within(pages[3]).getByRole('link', { name: '4' })
    expect(page3).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=4')
    expect(page3).toHaveAttribute('title', 'Page 4')
    const page4 = within(pages[4]).getByRole('link', { current: 'page', name: '5' })
    expect(page4).toHaveAttribute('href', '#')
    expect(page4).toHaveAttribute('title', 'Page 5')
    const page5 = within(pages[5]).getByRole('link', { name: '6' })
    expect(page5).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=6')
    expect(page5).toHaveAttribute('title', 'Page 6')
  })

  it('[URL] quand je suis sur la 320 page de 323 pages', () => {
    // GIVEN - Utilise maintenant page=320 pour la 320ème page (base 1)
    const searchParams = new URLSearchParams({ page: '320' })

    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={3230}
      />,
      { searchParams }
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { name: '319' })
    expect(page1).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=319')
    expect(page1).toHaveAttribute('title', 'Page 319')
    const page2 = within(pages[2]).getByRole('link', { current: 'page', name: '320' })
    expect(page2).toHaveAttribute('href', '#')
    expect(page2).toHaveAttribute('title', 'Page 320')
    const page3 = within(pages[3]).getByRole('link', { name: '321' })
    expect(page3).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=321')
    expect(page3).toHaveAttribute('title', 'Page 321')
    const page4 = within(pages[4]).getByRole('link', { name: '322' })
    expect(page4).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=322')
    expect(page4).toHaveAttribute('title', 'Page 322')
    const page5 = within(pages[5]).getByRole('link', { name: '323' })
    expect(page5).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?page=323')
    expect(page5).toHaveAttribute('title', 'Page 323')
  })

  it('[URL] quand je suis sur une page quelconque et avec un autre paramètre dans l\'url', () => {
    // GIVEN
    const searchParams = new URLSearchParams({ fakeParam: 'fakeValue' })

    // WHEN
    renderComponent(
      <Pagination
        pathname="/mes-utilisateurs"
        totalUtilisateurs={9}
      />,
      { searchParams }
    )

    // THEN
    const pages = listerLesPages()
    expect(pages).toHaveLength(3)

    const premierePage = within(pages[0]).getByRole('link', { name: 'Première page' })
    expect(premierePage).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?fakeParam=fakeValue&page=1')
    const page1 = within(pages[1]).getByRole('link', { current: 'page', name: '1' })
    expect(page1).toHaveAttribute('href', '#')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const dernierePage = within(pages[2]).getByRole('link', { name: 'Dernière page' })
    expect(dernierePage).toHaveAttribute('href', 'http://example.com/mes-utilisateurs?fakeParam=fakeValue&page=1')
  })

  function listerLesPages(): Array<HTMLElement> {
    return screen.getAllByRole('listitem')
  }
})