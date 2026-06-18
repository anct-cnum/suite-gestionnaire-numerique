import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import EditionNomStructure from './EditionNomStructure'
import { renderComponent, stubbedServerAction } from '@/components/testHelper'

describe('édition du nom de structure', () => {
  it('ouvre la modale, affiche les onglets et la liste des rattachements non nuls', () => {
    // GIVEN
    renderComponent(<EditionNomStructure {...props()} />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Éditer' }))

    // THEN
    expect(screen.getByRole('button', { name: 'Renommer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fusionner' })).toBeInTheDocument()
    expect(screen.getByText('Contrats', { exact: false })).toBeInTheDocument()
  })

  it('enregistre le nouveau nom en appelant l’action puis notifie', async () => {
    // GIVEN
    const modifierNomStructureAction = stubbedServerAction(['OK'])
    renderComponent(<EditionNomStructure {...props()} />, { modifierNomStructureAction, pathname: '/structure/978' })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Éditer' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nouveau nom' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await screen.findByRole('status')
    expect(modifierNomStructureAction).toHaveBeenCalledWith({
      nomAffichage: 'Nouveau nom',
      path: '/structure/978',
      structureId: 978,
    })
  })

  it('affiche « Fonctionnalité à venir » dans l’onglet Fusionner', () => {
    // GIVEN
    renderComponent(<EditionNomStructure {...props()} />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Éditer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fusionner' }))

    // THEN
    expect(screen.getByText('Fonctionnalité à venir')).toBeInTheDocument()
  })
})

function props(): Readonly<{
  denominationAntenne: null | string
  nom: string
  rattachements: ReadonlyArray<Readonly<{ label: string; nombre: number }>>
  structureId: number
}> {
  return {
    denominationAntenne: 'Antenne actuelle',
    nom: 'Conseil départemental',
    rattachements: [
      { label: 'Contrats', nombre: 16 },
      { label: 'Postes', nombre: 0 },
    ],
    structureId: 978,
  }
}
