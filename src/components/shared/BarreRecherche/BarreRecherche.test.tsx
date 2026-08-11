import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BarreRecherche from './BarreRecherche'

describe('barre de recherche', () => {
  it("quand je saisis un terme et que j'appuie sur Entrée, alors la recherche est lancée avec le terme sans espaces superflus", async () => {
    // GIVEN
    const rechercher = vi.fn<(valeur: string) => void>()
    render(<BarreRecherche label="Rechercher par nom" rechercher={rechercher} valeurInitiale="" />)

    // WHEN
    await userEvent.type(screen.getByLabelText('Rechercher par nom'), '  Dupont  {enter}')

    // THEN
    expect(rechercher).toHaveBeenCalledWith('Dupont')
  })

  it("quand je vide le champ et que j'appuie sur Entrée, alors la recherche est lancée avec une valeur vide", async () => {
    // GIVEN
    const rechercher = vi.fn<(valeur: string) => void>()
    render(<BarreRecherche label="Rechercher par nom" rechercher={rechercher} valeurInitiale="Dupont" />)

    // WHEN
    const champ = screen.getByLabelText('Rechercher par nom')
    await userEvent.clear(champ)
    await userEvent.type(champ, '{enter}')

    // THEN
    expect(rechercher).toHaveBeenCalledWith('')
  })

  it("quand j'affiche la barre de recherche, alors le champ est prérempli avec la valeur initiale et le bouton rechercher est présent", () => {
    // WHEN
    render(
      <BarreRecherche
        label="Rechercher par nom"
        rechercher={vi.fn<(valeur: string) => void>()}
        valeurInitiale="Martin"
      />
    )

    // THEN
    expect(screen.getByLabelText('Rechercher par nom')).toHaveValue('Martin')
    expect(screen.getByRole('button', { name: 'Rechercher' })).toBeInTheDocument()
  })

  it('quand je clique sur le bouton rechercher, alors la recherche est lancée avec le terme saisi', async () => {
    // GIVEN
    const rechercher = vi.fn<(valeur: string) => void>()
    render(<BarreRecherche label="Rechercher par prénom" rechercher={rechercher} valeurInitiale="" />)

    // WHEN
    await userEvent.type(screen.getByLabelText('Rechercher par prénom'), 'Jean')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    expect(rechercher).toHaveBeenCalledWith('Jean')
  })
})
