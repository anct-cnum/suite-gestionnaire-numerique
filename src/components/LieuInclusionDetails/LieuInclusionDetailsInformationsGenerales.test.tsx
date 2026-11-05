import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { InformationsGeneralesData } from './LieuInclusionDetails'
import LieuInclusionDetailsInformationsGenerales from './LieuInclusionDetailsInformationsGenerales'
import { renderComponent } from '../testHelper'
import * as notification from '@/components/shared/Notification/Notification'

// La section lit l'identifiant du lieu dans l'URL (#1498).
vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/lieu/42',
}))

describe('informations générales d’un lieu d’inclusion (#1495)', () => {
  it('à la soumission, notifie que les informations sont modifiées et quitte l’édition', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const modifierLieuInclusionInformationsGeneralesAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['OK'])
    renderComponent(<LieuInclusionDetailsInformationsGenerales data={donneesInitiales} peutModifier={true} />, {
      modifierLieuInclusionInformationsGeneralesAction,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('success', {
        description: 'modifiées',
        title: 'Informations générales ',
      })
    })
    expect(screen.queryByRole('button', { name: 'Enregistrer' })).not.toBeInTheDocument()
  })

  it('quand la visibilité cartographie a été forcée à false (adresse perdue dans la BAN), le signale dans la notification', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const modifierLieuInclusionInformationsGeneralesAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['OK', 'ce lieu n’est plus proposé à la cartographie nationale'])
    renderComponent(<LieuInclusionDetailsInformationsGenerales data={donneesInitiales} peutModifier={true} />, {
      modifierLieuInclusionInformationsGeneralesAction,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('success', {
        description: 'modifiées, mais ce lieu n’est plus proposé à la cartographie nationale',
        title: 'Informations générales ',
      })
    })
  })

  it('en cas d’échec, notifie l’erreur et reste en édition', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const modifierLieuInclusionInformationsGeneralesAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['Adresse introuvable — vérifiez la saisie'])
    renderComponent(<LieuInclusionDetailsInformationsGenerales data={donneesInitiales} peutModifier={true} />, {
      modifierLieuInclusionInformationsGeneralesAction,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description: 'Adresse introuvable — vérifiez la saisie',
        title: 'Erreur : ',
      })
    })
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument()
  })
})

const donneesInitiales: InformationsGeneralesData = {
  adresse: '1 rue de la Paix, 75001 Paris',
  nomStructure: 'Ma Structure',
  typologies: ['ASSO'],
}
