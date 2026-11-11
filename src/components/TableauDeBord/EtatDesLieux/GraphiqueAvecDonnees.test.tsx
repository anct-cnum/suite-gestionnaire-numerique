import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import GraphiqueAvecDonnees from './GraphiqueAvecDonnees'

describe('graphique avec ses données sous forme de tableau', () => {
  it('affiche d’abord le graphique, le tableau n’est pas encore rendu', () => {
    // WHEN
    afficherLeGraphique()

    // THEN
    const choix = screen.getByRole('group', { name: 'Affichage de l’indice de fragilité numérique' })
    expect(choix).toBeInTheDocument()
    expect(screen.getByRole('radio', { checked: true, name: 'Carte' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { checked: false, name: 'Tableau' })).toBeInTheDocument()
    expect(screen.getByText('Le graphique')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('quand je choisis « Tableau », le tableau remplace le graphique, qui reste monté mais masqué', async () => {
    // GIVEN
    afficherLeGraphique()

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Tableau' }))

    // THEN
    expect(screen.getByRole('table', { name: 'Les données' })).toBeVisible()
    expect(screen.getByText('Le graphique')).not.toBeVisible()
  })

  it('quand je reviens sur le graphique, le tableau disparaît', async () => {
    // GIVEN
    afficherLeGraphique()
    await userEvent.click(screen.getByRole('radio', { name: 'Tableau' }))

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Carte' }))

    // THEN
    expect(screen.getByText('Le graphique')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

function afficherLeGraphique(): void {
  render(
    <GraphiqueAvecDonnees
      entete={<h3>Indice de fragilité numérique</h3>}
      graphique={<p>Le graphique</p>}
      idTableau="donnees-carte-fragilite"
      nomVueGraphique="Carte"
      tableau={
        <table>
          <caption>Les données</caption>
          <thead>
            <tr>
              <th scope="col">Mois</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>juin</td>
            </tr>
          </tbody>
        </table>
      }
      titre="l’indice de fragilité numérique"
    />
  )
}
