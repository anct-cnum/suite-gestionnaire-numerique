import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AccompagnementsRealisesClient from './AccompagnementsRealisesClient'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

describe('AccompagnementsRealisesClient', () => {
  it('affiche l’état de chargement avant la réponse de l’API', () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}))

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect(screen.getByText('Chargement...').textContent).toBe('Chargement...')
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
    expect(await screen.findByText('Bar Chart Mock')).toBeDefined()
    expect(fetchSpy).toHaveBeenCalledWith('/api/tableau-de-bord/accompagnements-realises?territoire=06')
  })

  it('affiche le message d’erreur quand l’API renvoie une erreur métier', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve({ message: 'Erreur Coop', type: 'error' }),
    } as unknown as Response)

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect((await screen.findAllByText('Erreur Coop')).length).toBeGreaterThan(0)
  })

  it('affiche un message d’erreur générique quand la requête échoue', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('réseau indisponible'))

    // WHEN
    render(<AccompagnementsRealisesClient territoire="France" />)

    // THEN
    expect((await screen.findAllByText('Erreur de récupération des données')).length).toBeGreaterThan(0)
  })
})
