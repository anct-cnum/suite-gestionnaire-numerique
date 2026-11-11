import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import TableauFragilite from './TableauFragilite'
import { indiceFragilitePresenter, lignesTableauFragilite } from '@/presenters/tableauDeBord/indicesPresenter'

describe('tableau de l’indice de fragilité numérique', () => {
  it('affiche la synthèse par classe, un titre visible et une ligne par territoire, territoire en en-tête de ligne', () => {
    // WHEN
    afficherLeTableau([
      { codeInsee: '69456', ifn: 7.08, nom: 'Belleville-en-Beaujolais' },
      { codeInsee: '69123', ifn: null, nom: 'Lyon' },
    ])

    // THEN
    expect(screen.getByText(/^2 communes/).textContent).toBe(
      '2 communes : 1 en risque assez fort, 1 sans donnée disponible.'
    )
    const tableau = screen.getByRole('table', { name: 'Indice de fragilité numérique par commune' })
    const [entete, ...lignes] = within(tableau).getAllByRole('row')
    expect(
      within(entete)
        .getAllByRole('columnheader')
        .map((cellule) => cellule.textContent)
    ).toStrictEqual(['CommuneTrier par commune', 'Indice (sur 10)Trier par indice', 'Classe'])
    expect(within(lignes[0]).getByRole('rowheader').textContent).toBe('Belleville-en-Beaujolais')
    expect(
      within(lignes[0])
        .getAllByRole('cell')
        .map((cellule) => cellule.textContent)
    ).toStrictEqual(['7,1', ' Risque assez fort'])
    expect(within(lignes[1]).getByRole('rowheader').textContent).toBe('Lyon')
    expect(
      within(lignes[1])
        .getAllByRole('cell')
        .map((cellule) => cellule.textContent)
    ).toStrictEqual(['non disponible', ' non disponible'])
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('trie par commune puis par indice croissant et décroissant, en l’annonçant sur l’en-tête de colonne', async () => {
    // GIVEN
    afficherLeTableau([
      { codeInsee: '69001', ifn: 5, nom: 'Affoux' },
      { codeInsee: '69456', ifn: 9, nom: 'Belleville-en-Beaujolais' },
      { codeInsee: '69002', ifn: 2, nom: 'Aigueperse' },
    ])
    const enTeteCommune = screen.getByRole('columnheader', { name: /^Commune/ })
    const enTeteIndice = screen.getByRole('columnheader', { name: /^Indice/ })
    expect(enTeteCommune).toHaveAttribute('aria-sort', 'ascending')
    expect(enTeteIndice).not.toHaveAttribute('aria-sort')
    expect(communesAffichees()).toStrictEqual(['Affoux', 'Aigueperse', 'Belleville-en-Beaujolais'])

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Trier par indice' }))

    // THEN
    expect(enTeteIndice).toHaveAttribute('aria-sort', 'ascending')
    expect(enTeteCommune).not.toHaveAttribute('aria-sort')
    expect(communesAffichees()).toStrictEqual(['Aigueperse', 'Affoux', 'Belleville-en-Beaujolais'])

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Trier par indice' }))

    // THEN
    expect(enTeteIndice).toHaveAttribute('aria-sort', 'descending')
    expect(communesAffichees()).toStrictEqual(['Belleville-en-Beaujolais', 'Affoux', 'Aigueperse'])

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Trier par commune' }))

    // THEN
    expect(enTeteCommune).toHaveAttribute('aria-sort', 'ascending')
    expect(communesAffichees()).toStrictEqual(['Affoux', 'Aigueperse', 'Belleville-en-Beaujolais'])
  })

  it('pagine par 20 lignes, avec première, précédente, suivante et dernière page', async () => {
    // GIVEN
    afficherLeTableau(
      Array.from({ length: 45 }, (_, index) => ({
        codeInsee: `69${String(index).padStart(3, '0')}`,
        ifn: 5,
        nom: `Commune ${String(index).padStart(2, '0')}`,
      }))
    )
    const pagination = screen.getByRole('navigation', {
      name: 'Pagination du tableau : Indice de fragilité numérique par commune',
    })
    expect(within(pagination).getByRole('button', { current: 'page', name: '1' })).toBeInTheDocument()
    expect(within(pagination).getByRole('button', { name: 'Première page' })).toBeDisabled()
    expect(within(pagination).getByRole('button', { name: 'Page précédente' })).toBeDisabled()
    expect(communesAffichees()).toHaveLength(20)

    // WHEN
    await userEvent.click(within(pagination).getByRole('button', { name: 'Page suivante' }))

    // THEN
    expect(within(pagination).getByRole('button', { current: 'page', name: '2' })).toBeInTheDocument()
    expect(communesAffichees()[0]).toBe('Commune 20')

    // WHEN
    await userEvent.click(within(pagination).getByRole('button', { name: 'Dernière page' }))

    // THEN
    expect(within(pagination).getByRole('button', { current: 'page', name: '3' })).toBeInTheDocument()
    expect(within(pagination).getByRole('button', { name: 'Page suivante' })).toBeDisabled()
    expect(within(pagination).getByRole('button', { name: 'Dernière page' })).toBeDisabled()
    expect(communesAffichees()).toStrictEqual(['Commune 40', 'Commune 41', 'Commune 42', 'Commune 43', 'Commune 44'])

    // WHEN
    await userEvent.click(within(pagination).getByRole('button', { name: 'Page précédente' }))

    // THEN
    expect(within(pagination).getByRole('button', { current: 'page', name: '2' })).toBeInTheDocument()

    // WHEN
    await userEvent.click(within(pagination).getByRole('button', { name: 'Première page' }))

    // THEN
    expect(communesAffichees()[0]).toBe('Commune 00')

    // WHEN
    await userEvent.click(within(pagination).getByRole('button', { name: '3' }))

    // THEN
    expect(communesAffichees()[0]).toBe('Commune 40')
  })

  it('un tri ramène à la première page', async () => {
    // GIVEN
    afficherLeTableau(
      Array.from({ length: 25 }, (_, index) => ({
        codeInsee: `69${String(index).padStart(3, '0')}`,
        ifn: index / 10,
        nom: `Commune ${String(index).padStart(2, '0')}`,
      }))
    )
    await userEvent.click(screen.getByRole('button', { name: 'Page suivante' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Trier par indice' }))

    // THEN
    expect(screen.getByRole('button', { current: 'page', name: '1' })).toBeInTheDocument()
    expect(communesAffichees()[0]).toBe('Commune 00')
  })
})

function afficherLeTableau(communes: Parameters<typeof indiceFragilitePresenter>[0]): void {
  render(
    <TableauFragilite
      lignes={lignesTableauFragilite(indiceFragilitePresenter(communes))}
      nomColonneTerritoire="Commune"
      titre="Indice de fragilité numérique par commune"
    />
  )
}

function communesAffichees(): ReadonlyArray<null | string> {
  return screen.getAllByRole('rowheader').map((cellule) => cellule.textContent)
}
