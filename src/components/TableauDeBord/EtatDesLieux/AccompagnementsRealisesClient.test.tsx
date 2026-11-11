import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import AccompagnementsRealisesClient from './AccompagnementsRealisesClient'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

describe(AccompagnementsRealisesClient, () => {
  it("affiche l'état de chargement avant la réponse de l'API", () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}))

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect(screen.getByText('Chargement...').textContent).toBe('Chargement...')
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: "Accompagnements des 6 derniers mois Plus d'information sur les accompagnements des 6 derniers mois",
      })
    ).toBeInTheDocument()
  })

  it('récupère les accompagnements du territoire puis affiche le résultat', async () => {
    // GIVEN
    const resultat: AccompagnementsRealisesResult = {
      nombreTotal: 1234,
      repartitionMensuelle: [{ mois: 'Jan.', nombre: 10 }],
    }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)

    // WHEN
    render(<AccompagnementsRealisesClient territoire="06" />)

    // THEN
    await expect(screen.findByText('Bar Chart Mock')).resolves.toBeDefined()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: "Accompagnements des 6 derniers mois Plus d'information sur les accompagnements des 6 derniers mois",
      })
    ).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledWith('/api/tableau-de-bord/accompagnements-realises?territoire=06')
  })

  it('propose les accompagnements de chaque mois sous forme de tableau, le mois en cours écrit en clair', async () => {
    // GIVEN
    const resultat: AccompagnementsRealisesResult = {
      nombreTotal: 1234,
      repartitionMensuelle: [
        { mois: '10/26', nombre: 1200 },
        { mois: '11/26', nombre: 34 },
      ],
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)
    render(<AccompagnementsRealisesClient territoire="France" />)
    await screen.findByText('Bar Chart Mock')

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Tableau' }))

    // THEN
    expect(screen.getByRole('group', { name: 'Affichage de l’histogramme des accompagnements' })).toBeInTheDocument()
    const tableau = screen.getByRole('table', { name: 'Accompagnements des 6 derniers mois' })
    const lignes = within(tableau).getAllByRole('row').slice(1)
    expect(lignes.map((ligne) => ligne.textContent)).toStrictEqual([
      'octobre 20261\u202f200',
      'novembre 2026 (mois en cours, incomplet)34',
    ])
  })

  it("affiche le message d'erreur quand l'API renvoie une erreur métier", async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve({ message: 'Erreur Coop', type: 'error' }),
    } as unknown as Response)

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect((await screen.findAllByText('Erreur Coop')).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: "Accompagnements des 6 derniers mois Plus d'information sur les accompagnements des 6 derniers mois",
      })
    ).toBeInTheDocument()
  })

  it("affiche un message d'erreur générique quand la requête échoue", async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('réseau indisponible'))

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect((await screen.findAllByText('Erreur de récupération des données')).length).toBeGreaterThan(0)
  })
})
