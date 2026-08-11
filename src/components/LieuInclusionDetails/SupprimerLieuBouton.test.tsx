import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import SupprimerLieuBouton from './SupprimerLieuBouton'
import * as actions from '@/app/api/actions/supprimerUnLieuInclusionAction'

const mockPush = vi.hoisted(() => vi.fn<(href: string) => void>())

vi.mock(import('next/navigation'), () => ({
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: mockPush }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
}))

describe('bouton supprimer un lieu depuis la fiche détail', () => {
  it('quand je clique sur le bouton, alors la modale de confirmation s’affiche avec le nom, l’adresse et les conséquences', async () => {
    // GIVEN
    render(<SupprimerLieuBouton adresse="1 rue de la Paix, 75001 Paris" lieuId="42" nom="Mon lieu" />)

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer ce lieu' }))

    // THEN
    const modale = screen.getByRole('dialog')
    expect(within(modale).getByText('Êtes-vous sûr de vouloir supprimer ce lieu ?')).toBeInTheDocument()
    expect(modale.textContent).toContain('Mon lieu')
    expect(modale.textContent).toContain('1 rue de la Paix, 75001 Paris')
    expect(modale.textContent).toContain('Cette suppression entraîne')
  })

  it('quand je confirme la suppression, alors l’action est appelée et je suis redirigé vers la liste des lieux', async () => {
    // GIVEN
    vi.spyOn(actions, 'supprimerUnLieuInclusionAction').mockResolvedValueOnce(['OK'])
    render(<SupprimerLieuBouton adresse="1 rue de la Paix, 75001 Paris" lieuId="42" nom="Mon lieu" />)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer ce lieu' }))

    // WHEN
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer ce lieu' }))

    // THEN
    await waitFor(() => {
      expect(actions.supprimerUnLieuInclusionAction).toHaveBeenCalledWith({
        lieuId: '42',
        path: '/liste-lieux-inclusion',
      })
    })
    expect(mockPush).toHaveBeenCalledWith('/liste-lieux-inclusion')
  })

  it('quand la suppression échoue, alors je ne suis pas redirigé', async () => {
    // GIVEN
    mockPush.mockClear()
    vi.spyOn(actions, 'supprimerUnLieuInclusionAction').mockResolvedValueOnce(['Une erreur est survenue'])
    render(<SupprimerLieuBouton adresse="1 rue de la Paix, 75001 Paris" lieuId="42" nom="Mon lieu" />)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer ce lieu' }))

    // WHEN
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer ce lieu' }))

    // THEN
    await waitFor(() => {
      expect(actions.supprimerUnLieuInclusionAction).toHaveBeenCalledWith({
        lieuId: '42',
        path: '/liste-lieux-inclusion',
      })
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('quand j’annule, alors la modale se ferme sans appeler l’action', async () => {
    // GIVEN
    const spy = vi.spyOn(actions, 'supprimerUnLieuInclusionAction')
    render(<SupprimerLieuBouton adresse="1 rue de la Paix, 75001 Paris" lieuId="42" nom="Mon lieu" />)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer ce lieu' }))

    // WHEN
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' }))

    // THEN
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(spy).not.toHaveBeenCalled()
  })
})
