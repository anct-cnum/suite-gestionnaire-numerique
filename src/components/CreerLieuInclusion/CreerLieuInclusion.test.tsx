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

  it('présente la page telle que les maquettes V6 la décrivent : retour, titre de section et encart cartographie', () => {
    // WHEN
    renderComponent(<CreerLieuInclusion />)

    // THEN
    expect(screen.getByRole('link', { name: 'Retour' })).toHaveAttribute('href', '/liste-lieux-inclusion')
    expect(screen.getByRole('heading', { level: 2, name: 'Identification du lieu' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Vous souhaitez rendre visible ce lieu sur la cartographie nationale des lieux d’inclusion numérique ?',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Renseignez des informations sur le lieu et les services d’inclusion numérique qui y sont proposés'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('Gagnez en visibilité et orientez les bénéficiaires grâce à la cartographie')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'En savoir plus sur la cartographie' })).toBeInTheDocument()
    expect(screen.queryByText('Les champs avec * sont obligatoires.')).not.toBeInTheDocument()
  })

  it('le bouton de création est disponible d’emblée : le SIRET est optionnel', () => {
    // WHEN
    renderComponent(<CreerLieuInclusion />)

    // THEN
    expect(screen.getByRole('button', { name: 'Créer le lieu d’activité' })).toBeEnabled()
  })

  it('crée le lieu avec tous les champs saisis, notifie et redirige vers la fiche créée', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const creerUnLieuInclusionAction = vi
      .fn<() => Promise<ResultatCreationLieu>>()
      .mockResolvedValueOnce({ lieuId: '4242', statut: 'cree', visibilitePourCartographieForcee: false })
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
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lieu d’activité itinérant (exemple : bus)' }))
    await userEvent.type(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ }), 'Mon lieu')
    await userEvent.type(screen.getByRole('textbox', { name: /Complément d’adresse/ }), 'Bât. B')
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
        siret: '',
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

  it('quand la visibilité cartographie a été forcée à false (adresse absente de la BAN), le notifie à l’utilisateur', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const creerUnLieuInclusionAction = vi
      .fn<() => Promise<ResultatCreationLieu>>()
      .mockResolvedValueOnce({ lieuId: '4242', statut: 'cree', visibilitePourCartographieForcee: true })
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
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))
    await userEvent.type(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ }), 'Mon lieu')
    await userEvent.click(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' }))
    await userEvent.click(await screen.findByRole('option', { name: typologieLabels.ASSO }))
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Rendre mon lieu d’activité visible sur la cartographie' })
    )

    // WHEN
    await userEvent.click(within(container).getByRole('button', { name: 'Créer le lieu d’activité' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('success', {
        description:
          'a bien été créé, mais n’est pas proposé à la cartographie nationale : son adresse n’a pas été trouvée ' +
          'dans la Base Adresse Nationale.',
        title: 'Le lieu d’inclusion numérique ',
      })
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
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))
    await userEvent.type(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ }), 'Mon lieu')
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

  it('dès qu’une adresse est choisie, présente les lieux déjà déclarés à cette adresse, sans bloquer la création', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([
        {
          adresse: '1 Rue de la Paix 75001 Paris',
          href: '/lieu/42?dejaEnregistre=1',
          libellePersonnesRattachees: '6 personnes rattachées',
          libelleSiret: 'SIRET 200 069 497 00013',
          nom: 'Médiathèque',
          typologies: 'Bibliothèque / Médiathèque',
        },
      ])
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    renderComponent(<CreerLieuInclusion />, { rechercherAdressesAction, rechercherLieuxInclusionSimilairesAction })
    await userEvent.type(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ }), 'Médiathèque')

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))

    // THEN
    await waitFor(() => {
      expect(rechercherLieuxInclusionSimilairesAction).toHaveBeenCalledWith({
        adresse: '1 Rue de la Paix, 75001 Paris',
      })
    })
    const titre = await screen.findByText('1 lieu est déjà déclaré à cette adresse')
    expect(titre).toBeInTheDocument()
    expect(
      screen.getByText('Si c’est votre lieu, inutile de le créer. Sinon, poursuivez la création.')
    ).toBeInTheDocument()
    expect(screen.getByText('Médiathèque')).toBeInTheDocument()
    expect(screen.getByText('Bibliothèque / Médiathèque ·')).toBeInTheDocument()
    expect(screen.getByText('1 Rue de la Paix 75001 Paris')).toBeInTheDocument()
    expect(screen.getByText('SIRET 200 069 497 00013 · 6 personnes rattachées')).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: 'C’est mon lieu' })
    expect(lien).toHaveAttribute('href', '/lieu/42?dejaEnregistre=1')
    expect(screen.getByRole('button', { name: 'Créer le lieu d’activité' })).toBeEnabled()
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
