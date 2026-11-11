import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ListeDepartements from './ListeDepartements'
import { renderComponent } from '@/components/testHelper'

describe('liste des départements de l’accueil des données', () => {
  it('affiche un accordéon DSFR fermé « Afficher la liste des départements »', () => {
    // WHEN
    afficherLaListe()

    // THEN
    const titreAccordeon = screen.getByRole('heading', { level: 2, name: 'Afficher la liste des départements' })
    expect(titreAccordeon.className).toBe('fr-accordion__title')
    const bouton = within(titreAccordeon).getByRole('button', { name: 'Afficher la liste des départements' })
    expect(bouton.getAttribute('aria-expanded')).toBe('false')
    expect(bouton.getAttribute('aria-controls')).toBe('liste-departements')
    expect(bouton.className).toBe('fr-accordion__btn')
  })

  it('affiche un titre par région suivi de la liste des liens vers la synthèse de chaque département', () => {
    // WHEN
    afficherLaListe()

    // THEN
    const titres = screen.getAllByRole('heading', { hidden: true, level: 3 })
    expect(titres.map((titre) => titre.textContent)).toStrictEqual(['Auvergne-Rhône-Alpes', 'Outre-mer'])
    const listes = screen.getAllByRole('list', { hidden: true })
    expect(listes).toHaveLength(2)
    const liensRegion = within(listes[0]).getAllByRole('link', { hidden: true })
    expect(liensRegion.map((lien) => [lien.textContent, lien.getAttribute('href')])).toStrictEqual([
      ['Ain (01)', '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/01'],
      ['Rhône (69)', '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/69'],
    ])
    expect(liensRegion[0].className).toBe('fr-link')
    const liensOutreMer = within(listes[1]).getAllByRole('link', { hidden: true })
    expect(liensOutreMer.map((lien) => [lien.textContent, lien.getAttribute('href')])).toStrictEqual([
      ['Guadeloupe (971)', '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/971'],
    ])
  })
})

function afficherLaListe(): void {
  renderComponent(
    <ListeDepartements
      groupes={[
        {
          departements: [
            { libelle: 'Ain (01)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/01' },
            { libelle: 'Rhône (69)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/69' },
          ],
          id: 'departements-region-84',
          titre: 'Auvergne-Rhône-Alpes',
        },
        {
          departements: [
            {
              libelle: 'Guadeloupe (971)',
              lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/971',
            },
          ],
          id: 'departements-outre-mer',
          titre: 'Outre-mer',
        },
      ]}
    />
  )
}
