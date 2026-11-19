import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import EnteteStatistiquesMediateurs from './EnteteStatistiquesMediateurs'

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/donnees-territoriales/mediateurs-numeriques/departement/69',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: vi.fn<(href: string) => void>() }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
  useSearchParams: (): ReturnType<typeof import('next/navigation').useSearchParams> =>
    new URLSearchParams() as unknown as ReturnType<typeof import('next/navigation').useSearchParams>,
}))

describe('en-tête des statistiques des médiateurs', () => {
  it('affiche la période des données dans un message de statut, sous le titre (RGAA 7.5)', () => {
    // WHEN
    afficherLEnTete('2026-01-01', '2026-06-30', 'Données du 1er janvier 2026 au 30 juin 2026')

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: 'Données et statistiques' })).toBeInTheDocument()
    const statut = screen.getByRole('status')
    expect(statut.textContent).toBe('Données du 1er janvier 2026 au 30 juin 2026')
    expect(statut.tagName).toBe('P')
  })

  it('quand la période change, alors le même message de statut est mis à jour et « Période » garde le focus', async () => {
    // GIVEN
    const { rerender } = afficherLEnTete('2026-01-01', '2026-06-30', 'Données du 1er janvier 2026 au 30 juin 2026')
    const statut = screen.getByRole('status')
    const bouton = screen.getByRole('button', { name: '01.01.26 - 30.06.26' })
    await userEvent.click(bouton)
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

    // WHEN : la page est rendue de nouveau avec la nouvelle période
    rerender(
      <EnteteStatistiquesMediateurs
        dateDebut="2026-02-01"
        dateFin="2026-03-31"
        periode="Données du 1er février 2026 au 31 mars 2026"
      />
    )

    // THEN
    expect(screen.getByRole('status')).toBe(statut)
    expect(statut.textContent).toBe('Données du 1er février 2026 au 31 mars 2026')
    expect(screen.getByRole('button', { name: '01.02.26 - 31.03.26' })).toBe(bouton)
    expect(bouton).toHaveFocus()
  })
})

function afficherLEnTete(dateDebut: string, dateFin: string, periode: string): ReturnType<typeof render> {
  return render(<EnteteStatistiquesMediateurs dateDebut={dateDebut} dateFin={dateFin} periode={periode} />)
}
