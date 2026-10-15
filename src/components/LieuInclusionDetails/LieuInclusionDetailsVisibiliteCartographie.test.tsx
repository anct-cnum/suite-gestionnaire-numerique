import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import LieuInclusionDetailsVisibiliteCartographie from './LieuInclusionDetailsVisibiliteCartographie'
import { renderComponent } from '../testHelper'
import * as actions from '@/app/api/actions/modifierLieuInclusionVisibiliteCartographieAction'
import * as notification from '@/components/shared/Notification/Notification'

describe('visibilité cartographique depuis la fiche d’un lieu (#1495)', () => {
  it('présente l’encart cartographie avec la bascule à l’état du lieu', () => {
    // WHEN
    renderComponent(
      <LieuInclusionDetailsVisibiliteCartographie lieuId="42" peutModifier={true} visiblePourCartographie={true} />
    )

    // THEN
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Vous souhaitez rendre visible ce lieu sur la cartographie nationale des lieux d’inclusion numérique ?',
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'En savoir plus sur la cartographie' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    ).toBeChecked()
  })

  it('sans droit de modification, la bascule est désactivée', () => {
    // WHEN
    renderComponent(
      <LieuInclusionDetailsVisibiliteCartographie lieuId="42" peutModifier={false} visiblePourCartographie={false} />
    )

    // THEN
    expect(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    ).toBeDisabled()
  })

  it('quand je bascule la visibilité, alors elle est enregistrée aussitôt et le confirme', async () => {
    // GIVEN
    vi.spyOn(actions, 'modifierLieuInclusionVisibiliteCartographieAction').mockResolvedValueOnce(['OK'])
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    renderComponent(
      <LieuInclusionDetailsVisibiliteCartographie lieuId="42" peutModifier={true} visiblePourCartographie={false} />
    )

    // WHEN
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    )

    // THEN
    await waitFor(() => {
      expect(actions.modifierLieuInclusionVisibiliteCartographieAction).toHaveBeenCalledWith({
        lieuId: '42',
        path: '/lieu/42',
        visiblePourCartographie: true,
      })
    })
    expect(notification.Notification).toHaveBeenCalledWith('success', {
      description: 'modifiée',
      title: 'Visibilité cartographique ',
    })
  })

  it('quand l’enregistrement échoue, alors la bascule revient à son état précédent', async () => {
    // GIVEN
    vi.spyOn(actions, 'modifierLieuInclusionVisibiliteCartographieAction').mockResolvedValueOnce(['Erreur de droits'])
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    renderComponent(
      <LieuInclusionDetailsVisibiliteCartographie lieuId="42" peutModifier={true} visiblePourCartographie={false} />
    )
    const bascule = screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })

    // WHEN
    await userEvent.click(bascule)

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description: 'Erreur de droits',
        title: 'Erreur : ',
      })
    })
    expect(bascule).not.toBeChecked()
  })
})
