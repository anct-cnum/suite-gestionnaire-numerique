import { fireEvent, screen, waitFor } from '@testing-library/react'
import { select } from 'react-select-event'
import { describe, expect, it } from 'vitest'

import SelecteurStructure from './SelecteurStructure'
import { renderComponent, structuresFetch, stubbedServerAction } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('sélecteur de structure (superadmin)', () => {
  it('affiche un sélecteur de structure avec le label "Structure"', () => {
    // GIVEN
    afficherSelecteurStructure()

    // THEN
    expect(screen.getByLabelText('Structure')).toBeInTheDocument()
  })

  it('quand je tape une recherche et que je sélectionne une structure alors changerMaStructureAction est appelée', async () => {
    // GIVEN
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    const changerMaStructureAction = stubbedServerAction(['OK'])
    afficherSelecteurStructure({ changerMaStructureAction })

    // WHEN
    const input = screen.getByLabelText('Structure')
    fireEvent.change(input, { target: { value: 'tet' } })
    await select(input, 'TETRIS — GRASSE')

    // THEN
    await waitFor(() => {
      expect(changerMaStructureAction).toHaveBeenCalledWith({ idStructure: 14, path: '/' })
    })
  })

  it('quand la recherche aboutit, la liste affiche un badge FNE pour les structures FNE', async () => {
    // GIVEN
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    afficherSelecteurStructure()

    // WHEN
    const input = screen.getByLabelText('Structure')
    fireEvent.change(input, { target: { value: 'agi' } })
    await waitFor(() => {
      expect(screen.getByText('FNE')).toBeInTheDocument()
    })
  })
})

function afficherSelecteurStructure(clientContextOverride?: Parameters<typeof renderComponent>[1]): void {
  renderComponent(<SelecteurStructure ariaControlsId="drawerMenuUtilisateurId" />, {
    sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
      peutChangerDeRole: true,
      role: {
        doesItBelongToGroupeAdmin: false,
        libelle: 'Structure Test',
        nom: 'Gestionnaire structure',
        pictogramme: 'support-animation',
        rolesGerables: [],
        type: 'gestionnaire_structure',
      },
    }),
    ...clientContextOverride,
  })
}
