import { render, screen, within } from '@testing-library/react'

import Pagination from './Pagination'

describe('pagination', () => {
  it('quand je suis sur la première page d’une page (< ① >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={0}
        totalUtilisateurs={9}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')
    expect(pages).toHaveLength(3)

    const premierePage = within(pages[0]).getByRole('link', { name: 'Première page' })
    expect(premierePage).toHaveAttribute('href', '/mes-utilisateurs')
    const page1 = within(pages[1]).getByRole('link', { name: '1' })
    expect(page1).toHaveAttribute('aria-current', 'page')
    expect(page1).toHaveAttribute('href', '#')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const dernierePage = within(pages[2]).getByRole('link', { name: 'Dernière page' })
    expect(dernierePage).toHaveAttribute('href', '/mes-utilisateurs?page=0')
  })

  it('quand je suis sur la première page de six pages (< ① 2 3 4 5 >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={0}
        totalUtilisateurs={55}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')
    expect(pages).toHaveLength(7)

    const page1 = within(pages[1]).getByRole('link', { name: '1' })
    expect(page1).toHaveAttribute('aria-current', 'page')
    expect(page1).toHaveAttribute('href', '#')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const page2 = within(pages[2]).getByRole('link', { name: '2' })
    expect(page2).toHaveAttribute('href', '/mes-utilisateurs?page=1')
    expect(page2).toHaveAttribute('title', 'Page 2')
    const page3 = within(pages[3]).getByRole('link', { name: '3' })
    expect(page3).toHaveAttribute('href', '/mes-utilisateurs?page=2')
    expect(page3).toHaveAttribute('title', 'Page 3')
    const page4 = within(pages[4]).getByRole('link', { name: '4' })
    expect(page4).toHaveAttribute('href', '/mes-utilisateurs?page=3')
    expect(page4).toHaveAttribute('title', 'Page 4')
    const page5 = within(pages[5]).getByRole('link', { name: '5' })
    expect(page5).toHaveAttribute('href', '/mes-utilisateurs?page=4')
    expect(page5).toHaveAttribute('title', 'Page 5')
  })

  it('quand je suis sur la deuxième page de six pages (< 1 ② 3 4 5 >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={1}
        totalUtilisateurs={55}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')

    const page1 = within(pages[1]).getByRole('link', { name: '1' })
    expect(page1).toHaveAttribute('href', '/mes-utilisateurs?page=0')
    expect(page1).toHaveAttribute('title', 'Page 1')
    const page2 = within(pages[2]).getByRole('link', { name: '2' })
    expect(page2).toHaveAttribute('aria-current', 'page')
    expect(page2).toHaveAttribute('href', '#')
    expect(page2).toHaveAttribute('title', 'Page 2')
    const page3 = within(pages[3]).getByRole('link', { name: '3' })
    expect(page3).toHaveAttribute('href', '/mes-utilisateurs?page=2')
    expect(page3).toHaveAttribute('title', 'Page 3')
    const page4 = within(pages[4]).getByRole('link', { name: '4' })
    expect(page4).toHaveAttribute('href', '/mes-utilisateurs?page=3')
    expect(page4).toHaveAttribute('title', 'Page 4')
    const page5 = within(pages[5]).getByRole('link', { name: '5' })
    expect(page5).toHaveAttribute('href', '/mes-utilisateurs?page=4')
    expect(page5).toHaveAttribute('title', 'Page 5')
  })

  it('quand je suis sur la quatrième page de huit pages (< 2 3 ④ 5 6 >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={3}
        totalUtilisateurs={75}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')

    const page1 = within(pages[1]).getByRole('link', { name: '2' })
    expect(page1).toHaveAttribute('href', '/mes-utilisateurs?page=1')
    expect(page1).toHaveAttribute('title', 'Page 2')
    const page2 = within(pages[2]).getByRole('link', { name: '3' })
    expect(page2).toHaveAttribute('href', '/mes-utilisateurs?page=2')
    expect(page2).toHaveAttribute('title', 'Page 3')
    const page3 = within(pages[3]).getByRole('link', { name: '4' })
    expect(page3).toHaveAttribute('aria-current', 'page')
    expect(page3).toHaveAttribute('href', '#')
    expect(page3).toHaveAttribute('title', 'Page 4')
    const page4 = within(pages[4]).getByRole('link', { name: '5' })
    expect(page4).toHaveAttribute('href', '/mes-utilisateurs?page=4')
    expect(page4).toHaveAttribute('title', 'Page 5')
    const page5 = within(pages[5]).getByRole('link', { name: '6' })
    expect(page5).toHaveAttribute('href', '/mes-utilisateurs?page=5')
    expect(page5).toHaveAttribute('title', 'Page 6')
  })

  it('quand je suis sur la cinquième page de six pages (< 2 3 4 ⑤ 6 >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={4}
        totalUtilisateurs={55}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')

    const page1 = within(pages[1]).getByRole('link', { name: '2' })
    expect(page1).toHaveAttribute('href', '/mes-utilisateurs?page=1')
    expect(page1).toHaveAttribute('title', 'Page 2')
    const page2 = within(pages[2]).getByRole('link', { name: '3' })
    expect(page2).toHaveAttribute('href', '/mes-utilisateurs?page=2')
    expect(page2).toHaveAttribute('title', 'Page 3')
    const page3 = within(pages[3]).getByRole('link', { name: '4' })
    expect(page3).toHaveAttribute('href', '/mes-utilisateurs?page=3')
    expect(page3).toHaveAttribute('title', 'Page 4')
    const page4 = within(pages[4]).getByRole('link', { name: '5' })
    expect(page4).toHaveAttribute('aria-current', 'page')
    expect(page4).toHaveAttribute('href', '#')
    expect(page4).toHaveAttribute('title', 'Page 5')
    const page5 = within(pages[5]).getByRole('link', { name: '6' })
    expect(page5).toHaveAttribute('href', '/mes-utilisateurs?page=5')
    expect(page5).toHaveAttribute('title', 'Page 6')
  })

  it('quand je suis sur la 320 page de 323 pages (< 318 319 ③②⓪ 321 322 >)', () => {
    // WHEN
    render(
      <Pagination
        pageCourante={319}
        totalUtilisateurs={3225}
      />
    )

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const pagination = within(navigation).getByRole('list')
    const pages = within(pagination).getAllByRole('listitem')

    const page1 = within(pages[1]).getByRole('link', { name: '318' })
    expect(page1).toHaveAttribute('href', '/mes-utilisateurs?page=317')
    expect(page1).toHaveAttribute('title', 'Page 318')
    const page2 = within(pages[2]).getByRole('link', { name: '319' })
    expect(page2).toHaveAttribute('href', '/mes-utilisateurs?page=318')
    expect(page2).toHaveAttribute('title', 'Page 319')
    const page3 = within(pages[3]).getByRole('link', { name: '320' })
    expect(page3).toHaveAttribute('aria-current', 'page')
    expect(page3).toHaveAttribute('href', '#')
    expect(page3).toHaveAttribute('title', 'Page 320')
    const page4 = within(pages[4]).getByRole('link', { name: '321' })
    expect(page4).toHaveAttribute('href', '/mes-utilisateurs?page=320')
    expect(page4).toHaveAttribute('title', 'Page 321')
    const page5 = within(pages[5]).getByRole('link', { name: '322' })
    expect(page5).toHaveAttribute('href', '/mes-utilisateurs?page=321')
    expect(page5).toHaveAttribute('title', 'Page 322')
  })
})