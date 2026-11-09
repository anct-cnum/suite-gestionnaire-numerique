import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import SelecteurRangeDates from './SelecteurRangeDates'

const mockPush = vi.hoisted(() => vi.fn<(href: string) => void>())

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/donnees-territoriales/mediateurs-numeriques/france',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: mockPush }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
  useSearchParams: (): ReturnType<typeof import('next/navigation').useSearchParams> =>
    new URLSearchParams() as unknown as ReturnType<typeof import('next/navigation').useSearchParams>,
}))

describe('sélecteur de période des médiateurs', () => {
  it('quand j’ouvre le sélecteur, alors le bouton « Période » contrôle un panneau de dialogue nommé', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: '10.03.25 - 20.03.25' })

    // WHEN
    await userEvent.click(bouton)

    // THEN
    const panneau = screen.getByRole('dialog', { name: 'Choisir une période' })
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
    expect(bouton).toHaveAttribute('aria-controls', panneau.id)
  })

  it('quand j’ouvre le sélecteur, alors le focus est envoyé sur le début de la période et un seul jour est tabulable', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: '10.03.25 - 20.03.25' }))

    // THEN
    expect(screen.getByRole('button', { name: 'lundi 10 mars 2025, sélectionné' })).toHaveFocus()
    expect(joursTabulables()).toStrictEqual(['10'])
  })

  it.each([
    { intention: 'le jour suivant', jourAttendu: 'mardi 11 mars 2025, sélectionné', touche: '{ArrowRight}' },
    { intention: 'le jour précédent', jourAttendu: 'dimanche 9 mars 2025', touche: '{ArrowLeft}' },
    { intention: 'la semaine suivante', jourAttendu: 'lundi 17 mars 2025, sélectionné', touche: '{ArrowDown}' },
    { intention: 'la semaine précédente', jourAttendu: 'lundi 3 mars 2025', touche: '{ArrowUp}' },
    { intention: 'le début de semaine', jourAttendu: 'lundi 10 mars 2025, sélectionné', touche: '{Home}' },
    { intention: 'la fin de semaine', jourAttendu: 'dimanche 16 mars 2025, sélectionné', touche: '{End}' },
    { intention: 'le mois suivant', jourAttendu: 'jeudi 10 avril 2025', touche: '{PageDown}' },
    { intention: 'le mois précédent', jourAttendu: 'lundi 10 février 2025', touche: '{PageUp}' },
  ])('quand j’appuie sur $touche, alors le focus va sur $intention', async ({ jourAttendu, touche }) => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: '10.03.25 - 20.03.25' }))

    // WHEN
    await userEvent.keyboard(touche)

    // THEN
    expect(screen.getByRole('button', { name: jourAttendu })).toHaveFocus()
    expect(joursTabulables()).toHaveLength(1)
  })

  it('quand la navigation au clavier sort des mois affichés, alors les mois affichés suivent le focus', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: '10.03.25 - 20.03.25' }))

    // WHEN
    await userEvent.keyboard('{PageDown}{PageDown}')

    // THEN
    expect(screen.getByRole('grid', { name: 'avril 2025' })).toBeInTheDocument()
    expect(screen.getByRole('grid', { name: 'mai 2025' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'samedi 10 mai 2025' })).toHaveFocus()
  })

  it('quand la navigation au clavier dépasse la date de début du dispositif, alors le focus reste sur cette date', async () => {
    // GIVEN
    afficherLeSelecteur('2020-11-17', '2020-11-30')
    await userEvent.click(screen.getByRole('button', { name: '17.11.20 - 30.11.20' }))

    // WHEN
    await userEvent.keyboard('{ArrowLeft}{PageUp}')

    // THEN
    expect(screen.getByRole('button', { name: 'mardi 17 novembre 2020, sélectionné' })).toHaveFocus()
  })

  it('quand je clique sur un jour, alors ce jour devient le seul jour tabulable', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: '10.03.25 - 20.03.25' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'mercredi 5 mars 2025' }))

    // THEN
    expect(joursTabulables()).toStrictEqual(['5'])
  })

  it('quand j’appuie sur Échap dans le panneau, alors il se ferme et le focus revient sur le bouton', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: '10.03.25 - 20.03.25' })
    await userEvent.click(bouton)

    // WHEN
    await userEvent.keyboard('{Escape}')

    // THEN
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(bouton).toHaveAttribute('aria-expanded', 'false')
    expect(bouton).toHaveFocus()
  })

  it('quand je valide la période, alors le panneau se ferme et le focus revient sur le bouton', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: '10.03.25 - 20.03.25' })
    await userEvent.click(bouton)

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

    // THEN
    expect(mockPush).toHaveBeenCalledWith(
      '/donnees-territoriales/mediateurs-numeriques/france?du=2025-03-10&au=2025-03-20'
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(bouton).toHaveFocus()
  })
})

function afficherLeSelecteur(dateDebut: string, dateFin: string): void {
  render(<SelecteurRangeDates dateDebut={dateDebut} dateFin={dateFin} />)
}

function joursTabulables(): ReadonlyArray<string> {
  return screen
    .getAllByRole('grid')
    .flatMap((grille) => within(grille).queryAllByRole('button'))
    .filter((jour) => jour.tabIndex === 0)
    .map((jour) => jour.textContent ?? '')
}
