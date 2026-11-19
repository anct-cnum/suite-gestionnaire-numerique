import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import DonneesEnTableau from './DonneesEnTableau'

describe('données d’un graphique sous forme de tableau', () => {
  it('sont repliées par défaut derrière un bouton d’accordéon DSFR explicite (RGAA 1.6)', () => {
    // WHEN
    afficherLeTableau()

    // THEN
    const bouton = screen.getByRole('button', { name: 'Afficher les données sous forme de tableau' })
    expect(bouton).toHaveAttribute('aria-expanded', 'false')
    expect(bouton).toHaveClass('fr-accordion__btn')
    expect(screen.getByRole('heading', { level: 5, name: 'Afficher les données sous forme de tableau' })).toBeVisible()
    expect(bouton.getAttribute('aria-controls')).toMatch(/-collapse$/)
  })

  it('s’ouvrent au clic', async () => {
    // GIVEN
    afficherLeTableau()
    const bouton = screen.getByRole('button', { name: 'Afficher les données sous forme de tableau' })

    // WHEN
    await userEvent.click(bouton)

    // THEN
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
  })

  it('forment un tableau DSFR titré, avec en-têtes de colonnes et de lignes (RGAA 5.4, 5.6, 5.7)', () => {
    // WHEN
    afficherLeTableau()

    // THEN
    const tableau = screen.getByRole('table', { hidden: true, name: 'Nombre d’accompagnements par mois' })
    const enTetesDeColonnes = within(tableau).getAllByRole('columnheader', { hidden: true })
    expect(enTetesDeColonnes.map((enTete) => enTete.textContent)).toStrictEqual(['Mois', 'Accompagnements'])
    enTetesDeColonnes.forEach((enTete) => {
      expect(enTete).toHaveAttribute('scope', 'col')
    })
    const lignes = within(tableau).getAllByRole('row', { hidden: true }).slice(1)
    expect(lignes).toHaveLength(2)
    const enTeteDeLigne = within(lignes[0]).getByRole('rowheader', { hidden: true })
    expect(enTeteDeLigne.textContent).toBe('novembre 2025')
    expect(enTeteDeLigne).toHaveAttribute('scope', 'row')
    const valeur = within(lignes[0]).getByRole('cell', { hidden: true })
    expect(valeur.textContent).toBe('2 813')
    expect(valeur).toHaveClass('fr-cell--right')
  })
})

function afficherLeTableau(): void {
  render(
    <DonneesEnTableau
      caption="Nombre d’accompagnements par mois"
      enTetes={['Mois', 'Accompagnements']}
      lignes={[
        ['novembre 2025', '2 813'],
        ['décembre 2025', '2 309'],
      ]}
      niveauTitre="h5"
    />
  )
}
