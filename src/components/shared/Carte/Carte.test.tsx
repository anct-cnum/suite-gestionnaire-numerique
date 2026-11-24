import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Carte from './Carte'
import CarteFranceAvecInsets from './CarteFranceAvecInsets'
import { CibleDonneesDeLaCarte } from '@/components/shared/ChiffresClesEnTableau/LienVersChiffresCles'

describe('cartes : lien vers les données en tableau (RGAA 1.1)', () => {
  it('le conteneur du canvas d’une carte de territoire est le dernier de son bloc, suivi du lien vers les données', () => {
    // WHEN
    render(
      <CibleDonneesDeLaCarte value={{ idChiffresCles: 'chiffres-cles', indexOnglet: 0 }}>
        <Carte fragilite={[]} territoire={{ code: '41', type: 'departement' }} />
      </CibleDonneesDeLaCarte>
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Voir les données de la carte en tableau' })
    expect(lien).toHaveAttribute('href', '#chiffres-cles-panneau-0')
    // L'ordre du DOM est l'objet même du test : le lien suit immédiatement le conteneur du canvas
    /* eslint-disable testing-library/no-node-access */
    const blocDeLaCarte = screen.getByTestId('carte-wrapper')
    expect(blocDeLaCarte.lastElementChild).toBe(screen.getByTestId('carte-container'))
    expect(blocDeLaCarte.nextElementSibling).toBe(lien.parentElement)
    /* eslint-enable testing-library/no-node-access */
  })

  it('le conteneur du canvas de la France métropolitaine est suivi du lien vers les données', () => {
    // WHEN
    render(
      <CibleDonneesDeLaCarte value={{ idChiffresCles: 'chiffres-cles', indexOnglet: 0 }}>
        <CarteFranceAvecInsets
          donneesDepartements={[]}
          legend={<p>Légende</p>}
          nomAccessible="Carte de l'indice de fragilité numérique par département"
        />
      </CibleDonneesDeLaCarte>
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Voir les données de la carte en tableau' })
    // L'ordre du DOM est l'objet même du test : le canvas de la France métropolitaine est le dernier des cartes
    /* eslint-disable testing-library/no-node-access */
    const conteneurPrincipal = screen.getByTestId('carte-france-wrapper').parentElement
    const blocDesCartes = conteneurPrincipal?.parentElement
    expect(blocDesCartes?.lastElementChild).toBe(conteneurPrincipal)
    expect(blocDesCartes?.nextElementSibling).toBe(lien.parentElement)
    /* eslint-enable testing-library/no-node-access */
  })

  it('sans tableau associé (page d’accueil), aucun lien ne suit la carte', () => {
    // WHEN
    render(
      <CarteFranceAvecInsets donneesDepartements={[]} legend={<p>Légende</p>} nomAccessible="Carte des départements" />
    )

    // THEN
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
