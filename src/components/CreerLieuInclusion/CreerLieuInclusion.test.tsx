import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CreerLieuInclusion from './CreerLieuInclusion'
import { ResultatCreationLieu } from '@/app/api/actions/creerUnLieuInclusionAction'
import * as notification from '@/components/shared/Notification/Notification'
import { renderComponent } from '@/components/testHelper'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'
import { typologieLabels } from '@/presenters/shared/typologie'

describe('création d’un lieu d’inclusion numérique (#1495)', () => {
  it('affiche le titre, le toggle de visibilité décoché par défaut et le lien Annuler vers la liste', () => {
    // WHEN
    renderComponent(<CreerLieuInclusion />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Création d’un lieu d’activité' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    ).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute('href', '/liste-lieux-inclusion')
  })

  it('avec SIRET, le bouton de création reste désactivé tant qu’aucune entreprise n’est trouvée', () => {
    // WHEN
    renderComponent(<CreerLieuInclusion />)

    // THEN
    expect(screen.getByRole('button', { name: 'Créer le lieu d’activité' })).toBeDisabled()
  })

  it('sans SIRET, crée le lieu, notifie et redirige vers la fiche créée', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const creerUnLieuInclusionAction = vi
      .fn<() => Promise<ResultatCreationLieu>>()
      .mockResolvedValueOnce({ lieuId: '4242', statut: 'cree' })
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([])
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    const push = vi.fn<(href: string) => void>()
    const { container } = renderComponent(<CreerLieuInclusion />, {
      creerUnLieuInclusionAction,
      rechercherAdressesAction,
      rechercherLieuxInclusionSimilairesAction,
      router: routerAvec(push),
    })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' }))
    await userEvent.type(screen.getByRole('combobox', { name: 'Adresse *' }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lieu d’activité itinérant (exemple : bus)' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Nom du lieu d’activité *' }), 'Mon lieu')
    await userEvent.type(screen.getByRole('textbox', { name: 'Complément d’adresse' }), 'Bât. B')
    await userEvent.click(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' }))
    await userEvent.click(await screen.findByRole('option', { name: typologieLabels.ASSO }))
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    )

    // WHEN
    await userEvent.click(within(container).getByRole('button', { name: 'Créer le lieu d’activité' }))

    // THEN
    await waitFor(() => {
      expect(creerUnLieuInclusionAction).toHaveBeenCalledWith({
        adresse: '1 Rue de la Paix, 75001 Paris',
        complementAdresse: 'Bât. B',
        itinerant: true,
        nom: 'Mon lieu',
        typologies: ['ASSO'],
        visiblePourCartographie: true,
      })
    })
    expect(notification.Notification).toHaveBeenCalledWith('success', {
      description: 'a bien été créé.',
      title: 'Le lieu d’inclusion numérique ',
    })
    expect(push).toHaveBeenCalledWith('/lieu/4242')
  })

  it('en cas d’échec, notifie l’erreur et reste sur la page', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const creerUnLieuInclusionAction = vi
      .fn<() => Promise<ResultatCreationLieu>>()
      .mockResolvedValueOnce({ messages: ['Adresse introuvable — vérifiez la saisie'], statut: 'erreur' })
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([])
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    const push = vi.fn<(href: string) => void>()
    renderComponent(<CreerLieuInclusion />, {
      creerUnLieuInclusionAction,
      rechercherAdressesAction,
      rechercherLieuxInclusionSimilairesAction,
      router: routerAvec(push),
    })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' }))
    await userEvent.type(screen.getByRole('combobox', { name: 'Adresse *' }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Nom du lieu d’activité *' }), 'Mon lieu')
    await userEvent.click(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' }))
    await userEvent.click(await screen.findByRole('option', { name: typologieLabels.ASSO }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Créer le lieu d’activité' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description: 'Adresse introuvable — vérifiez la saisie',
        title: 'Erreur : ',
      })
    })
    expect(push).not.toHaveBeenCalled()
  })

  it('dès qu’une adresse est choisie, propose les lieux existants aux alentours avec un lien vers leur fiche', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([
        {
          adresse: '1 Rue de la Paix 75001 Paris',
          estLieuCoop: true,
          href: '/lieu/42',
          libelleMotif: 'Même adresse',
          nom: 'Médiathèque',
        },
      ])
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    renderComponent(<CreerLieuInclusion />, { rechercherAdressesAction, rechercherLieuxInclusionSimilairesAction })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Nom du lieu d’activité *' }), 'Médiathèque')

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Adresse *' }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))

    // THEN
    await waitFor(() => {
      expect(rechercherLieuxInclusionSimilairesAction).toHaveBeenCalledWith({
        adresse: '1 Rue de la Paix, 75001 Paris',
        nom: 'Médiathèque',
      })
    })
    const titre = await screen.findByRole('heading', { level: 3, name: 'Des lieux existent déjà aux alentours' })
    expect(titre).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: /Médiathèque/ })
    expect(lien).toHaveAttribute('href', '/lieu/42')
    expect(screen.getByText(/Même adresse/)).toBeInTheDocument()
    expect(screen.getByText(/géré dans la Coop/)).toBeInTheDocument()
  })
})

function routerAvec(push: (href: string) => void): ReturnType<typeof import('next/navigation').useRouter> {
  return {
    back: vi.fn<() => void>(),
    bfcacheId: '',
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  } as unknown as ReturnType<typeof import('next/navigation').useRouter>
}
