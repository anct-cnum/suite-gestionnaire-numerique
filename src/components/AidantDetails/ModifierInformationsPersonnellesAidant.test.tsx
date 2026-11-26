import { fireEvent, screen } from '@testing-library/react'
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
import { describe, expect, it } from 'vitest'

import ModifierInformationsPersonnellesAidant from './ModifierInformationsPersonnellesAidant'
import * as modifierInformationsPersonnellesAidant from '@/app/api/actions/modifierInformationsPersonnellesAidantAction'
import { renderComponent } from '@/components/testHelper'

describe('modifier les informations personnelles d’un aidant', () => {
  it('affiche un message générique et rend la main si l’enregistrement lève une erreur technique (#2390)', async () => {
    // GIVEN
    vi.spyOn(
      modifierInformationsPersonnellesAidant,
      'modifierInformationsPersonnellesAidantAction'
    ).mockRejectedValueOnce(new Error('panne technique'))
    const closeDrawer = vi.fn<() => void>()
    renderComponent(
      <PathnameContext.Provider value="/aidant/42">
        <ModifierInformationsPersonnellesAidant
          aidantId={42}
          closeDrawer={closeDrawer}
          emails={['aidant@example.com']}
          labelId="drawer-aidant"
          nom="Tartempion"
          prenom="Martin"
        />
      </PathnameContext.Provider>
    )

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : un problème technique est survenu, veuillez réessayer plus tard.')
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled()
    expect(closeDrawer).not.toHaveBeenCalled()
  })
})
