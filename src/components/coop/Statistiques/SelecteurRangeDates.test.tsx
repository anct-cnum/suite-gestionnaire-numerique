import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DATE_DEBUT_DISPOSITIF } from '@/shared/dispositif'
import SelecteurRangeDates from './SelecteurRangeDates'

const PERIODE_DU_10_AU_20_MARS = 'Période des données à afficher, 10/03/25 - 20/03/25'

const mockPush = vi.hoisted(() => vi.fn<(href: string) => void>())

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/donnees-territoriales/mediateurs-numeriques/france',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: mockPush }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
  useSearchParams: (): ReturnType<typeof import('next/navigation').useSearchParams> =>
    new URLSearchParams() as unknown as ReturnType<typeof import('next/navigation').useSearchParams>,
}))

describe('sélecteur de période des médiateurs', () => {
  it('quand aucune période n’est choisie, alors le bouton « Période » a un nom explicite (RGAA 7.1)', () => {
    // GIVEN
    vi.useFakeTimers({ now: new Date('2020-11-30T12:00:00Z'), toFake: ['Date'] })

    // WHEN
    afficherLeSelecteur(DATE_DEBUT_DISPOSITIF, '2020-11-30')

    // THEN
    const bouton = screen.getByRole('button', { name: 'Période des données à afficher' })
    expect(bouton.textContent).toBe('Période')
    vi.useRealTimers()
  })

  it('quand une période est choisie, alors le bouton la donne dans son nom et l’affiche avec des « / » (RGAA 7.1)', () => {
    // WHEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // THEN
    const bouton = screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS })
    expect(bouton.textContent).toBe('10/03/25 - 20/03/25')
  })

  it('quand j’ouvre le sélecteur, alors une fenêtre modale nommée s’ouvre et le bouton n’est pas un accordéon (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS })

    // WHEN
    await userEvent.click(bouton)

    // THEN
    const fenetre = screen.getByRole('dialog', { name: 'Choisir une période' })
    expect(fenetre).toHaveAttribute('aria-modal', 'true')
    expect(bouton).not.toHaveAttribute('aria-expanded')
    expect(bouton).not.toHaveAttribute('aria-controls')
    expect(within(fenetre).queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('quand j’ouvre le sélecteur, alors les listes des mois et des années ont un nom explicite (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // THEN
    expect(screen.getByRole('combobox', { name: 'Choisir le mois de départ de la période' })).toHaveValue('2')
    expect(screen.getByRole('combobox', { name: 'Choisir l’année de départ de la période' })).toHaveValue('2025')
    expect(screen.getByRole('combobox', { name: 'Choisir le mois de fin de la période' })).toHaveValue('3')
    expect(screen.getByRole('combobox', { name: 'Choisir l’année de fin de la période' })).toHaveValue('2025')
  })

  it('quand j’ouvre le sélecteur, alors les en-têtes des jours sont restitués avec leur nom complet (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // THEN
    const grille = screen.getByRole('grid', { name: 'mars 2025' })
    // eslint-disable-next-line testing-library/no-node-access
    expect(grille.querySelector('thead')).not.toHaveAttribute('aria-hidden')
    const entetes = within(grille).getAllByRole('columnheader')
    expect(entetes.map((entete) => entete.getAttribute('abbr'))).toStrictEqual([
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ])
    // eslint-disable-next-line testing-library/no-node-access
    expect(grille.querySelectorAll('td[role]')).toHaveLength(0)
  })

  it('quand j’ouvre le sélecteur, alors le début et la fin de la période sont nommés (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // THEN
    expect(
      screen.getByRole('button', { name: 'lundi 10 mars 2025, sélectionné, début de la période' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'mercredi 12 mars 2025, sélectionné' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'jeudi 20 mars 2025, sélectionné, fin de la période' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Effacer la période sélectionnée' }).textContent).toBe('Effacer')
    expect(screen.getByRole('button', { name: 'Valider la période sélectionnée' }).textContent).toBe('Valider')
  })

  it('quand je tabule après le dernier élément de la fenêtre, alors le focus revient au premier (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))
    screen.getByRole('button', { name: 'Valider la période sélectionnée' }).focus()

    // WHEN
    await userEvent.tab()

    // THEN
    expect(screen.getByRole('button', { name: 'Aller au début de la sélection' })).toHaveFocus()
  })

  it('quand je tabule en arrière depuis le premier élément de la fenêtre, alors le focus va au dernier (RGAA 7.1)', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))
    screen.getByRole('button', { name: 'Aller au début de la sélection' }).focus()

    // WHEN
    await userEvent.tab({ shift: true })

    // THEN
    expect(screen.getByRole('button', { name: 'Valider la période sélectionnée' })).toHaveFocus()
  })

  it('quand j’ouvre le sélecteur, alors le focus est envoyé sur le début de la période et un seul jour est tabulable', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // THEN
    expect(screen.getByRole('button', { name: 'lundi 10 mars 2025, sélectionné, début de la période' })).toHaveFocus()
    expect(joursTabulables()).toStrictEqual(['10'])
  })

  it.each([
    { intention: 'le jour suivant', jourAttendu: 'mardi 11 mars 2025, sélectionné', touche: '{ArrowRight}' },
    { intention: 'le jour précédent', jourAttendu: 'dimanche 9 mars 2025', touche: '{ArrowLeft}' },
    { intention: 'la semaine suivante', jourAttendu: 'lundi 17 mars 2025, sélectionné', touche: '{ArrowDown}' },
    { intention: 'la semaine précédente', jourAttendu: 'lundi 3 mars 2025', touche: '{ArrowUp}' },
    {
      intention: 'le début de semaine',
      jourAttendu: 'lundi 10 mars 2025, sélectionné, début de la période',
      touche: '{Home}',
    },
    { intention: 'la fin de semaine', jourAttendu: 'dimanche 16 mars 2025, sélectionné', touche: '{End}' },
    { intention: 'le mois suivant', jourAttendu: 'jeudi 10 avril 2025', touche: '{PageDown}' },
    { intention: 'le mois précédent', jourAttendu: 'lundi 10 février 2025', touche: '{PageUp}' },
  ])('quand j’appuie sur $touche, alors le focus va sur $intention', async ({ jourAttendu, touche }) => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // WHEN
    await userEvent.keyboard(touche)

    // THEN
    expect(screen.getByRole('button', { name: jourAttendu })).toHaveFocus()
    expect(joursTabulables()).toHaveLength(1)
  })

  it('quand la navigation au clavier sort des mois affichés, alors les mois affichés suivent le focus', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

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
    await userEvent.click(screen.getByRole('button', { name: 'Période des données à afficher, 17/11/20 - 30/11/20' }))

    // WHEN
    await userEvent.keyboard('{ArrowLeft}{PageUp}')

    // THEN
    expect(
      screen.getByRole('button', { name: 'mardi 17 novembre 2020, sélectionné, début de la période' })
    ).toHaveFocus()
  })

  it('quand je clique sur un jour, alors ce jour devient le seul jour tabulable', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    await userEvent.click(screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'mercredi 5 mars 2025' }))

    // THEN
    expect(joursTabulables()).toStrictEqual(['5'])
  })

  it('quand j’appuie sur Échap dans le panneau, alors il se ferme et le focus revient sur le bouton', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS })
    await userEvent.click(bouton)

    // WHEN
    await userEvent.keyboard('{Escape}')

    // THEN
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(bouton).toHaveFocus()
  })

  it('quand je valide la période, alors le panneau se ferme et le focus revient sur le bouton', async () => {
    // GIVEN
    afficherLeSelecteur('2025-03-10', '2025-03-20')
    const bouton = screen.getByRole('button', { name: PERIODE_DU_10_AU_20_MARS })
    await userEvent.click(bouton)

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Valider la période sélectionnée' }))

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
