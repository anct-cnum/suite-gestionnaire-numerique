import { render, screen, within } from '@testing-library/react'
import { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import EtatDesLieux from './EtatDesLieux'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

describe('état des lieux de l’inclusion numérique', () => {
  it('affiche l’état de chargement des accompagnements avant la réponse de l’API', () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}))

    // WHEN
    afficherLEtatDesLieux({ accompagnementsTerritoire: 'France' })

    // THEN
    expect(titreDeLHistogramme()).toBeInTheDocument()
    expect(screen.getAllByText('Chargement...')).toHaveLength(2)
  })

  it('charge une seule fois les accompagnements du territoire, pour l’histogramme et pour son tableau', async () => {
    // GIVEN
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)

    // WHEN
    afficherLEtatDesLieux({ accompagnementsTerritoire: '06' })

    // THEN
    await expect(screen.findByText('Bar Chart Mock')).resolves.toBeDefined()
    expect(titreDeLHistogramme()).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/tableau-de-bord/accompagnements-realises?territoire=06')
    expect(lignesDuTableauDesAccompagnements()).toStrictEqual([
      'octobre 20261 200',
      'novembre 2026 (mois en cours, incomplet)34',
    ])
  })

  it('charge les accompagnements d’une structure', async () => {
    // GIVEN
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)

    // WHEN
    afficherLEtatDesLieux({ accompagnementsStructureId: 42 })

    // THEN
    await expect(screen.findByText('Bar Chart Mock')).resolves.toBeDefined()
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/tableau-de-bord/accompagnements-realises?structureId=42')
  })

  it('affiche les accompagnements résolus côté serveur, sans appeler l’API', async () => {
    // GIVEN
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    // WHEN
    afficherLEtatDesLieux({ accompagnementsRealisesPromise: Promise.resolve(resultat) })

    // THEN
    await expect(screen.findByText('Bar Chart Mock')).resolves.toBeDefined()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(lignesDuTableauDesAccompagnements()).toHaveLength(2)
  })

  it('affiche le message d’erreur quand l’API renvoie une erreur métier', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve({ message: 'Erreur Coop', type: 'error' }),
    } as unknown as Response)

    // WHEN
    afficherLEtatDesLieux({ accompagnementsTerritoire: 'France' })

    // THEN
    expect((await screen.findAllByText('Erreur Coop')).length).toBeGreaterThan(0)
    expect(titreDeLHistogramme()).toBeInTheDocument()
  })

  it('affiche un message d’erreur générique quand la requête échoue', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('réseau indisponible'))

    // WHEN
    afficherLEtatDesLieux({ accompagnementsTerritoire: 'France' })

    // THEN
    expect((await screen.findAllByText('Erreur de récupération des données')).length).toBeGreaterThan(0)
  })

  it('sous les graphiques, un accordéon fermé « Chiffres clés en tableau » propose un onglet par graphique', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)

    // WHEN
    afficherLEtatDesLieux({ accompagnementsTerritoire: 'France' })

    // THEN
    await screen.findByText('Bar Chart Mock')
    const accordeon = screen.getByRole('button', { expanded: false, name: 'Chiffres clés en tableau' })
    expect(accordeon).toHaveAttribute('aria-controls', 'chiffres-cles-etat-des-lieux-contenu')
    const onglets = within(screen.getByRole('tablist', { name: 'Chiffres clés en tableau' })).getAllByRole('tab')
    expect(onglets.map((onglet) => onglet.textContent)).toStrictEqual([
      'Indice de fragilité numérique',
      'Accompagnements des 6 derniers mois',
    ])
    expect(onglets[0]).toHaveAttribute('aria-selected', 'true')
    expect(onglets[1]).toHaveAttribute('aria-selected', 'false')
    const panneauIndice = screen.getByRole('tabpanel', { name: 'Indice de fragilité numérique' })
    expect(within(panneauIndice).getByText('Tableau de l’indice')).toBeInTheDocument()
  })

  it('sans carte, les chiffres clés ne contiennent que le tableau des accompagnements, sans onglets', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => Promise.resolve(resultat),
    } as unknown as Response)

    // WHEN
    afficherLEtatDesLieux({ accompagnementsStructureId: 42 }, false)

    // THEN
    await screen.findByText('Bar Chart Mock')
    expect(screen.getByRole('button', { name: 'Chiffres clés en tableau' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(lignesDuTableauDesAccompagnements()).toHaveLength(2)
  })
})

const resultat: AccompagnementsRealisesResult = {
  nombreTotal: 1234,
  repartitionMensuelle: [
    { mois: '10/26', nombre: 1200 },
    { mois: '11/26', nombre: 34 },
  ],
}

type Source =
  | Readonly<{ accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult> }>
  | Readonly<{ accompagnementsStructureId: number }>
  | Readonly<{ accompagnementsTerritoire: string }>

function afficherLEtatDesLieux(source: Source, avecCarte = true): void {
  const props = {
    ...source,
    carte: <div>La carte</div>,
    lieuxInclusionViewModel: { message: 'Erreur lieux', type: 'error' },
    mediateursEtAidantsViewModel: { message: 'Erreur médiateurs', type: 'error' },
    tableauFragilite: avecCarte ? <p>Tableau de l’indice</p> : undefined,
  } as ComponentProps<typeof EtatDesLieux>
  render(<EtatDesLieux {...props} />)
}

function titreDeLHistogramme(): HTMLElement {
  return screen.getByRole('heading', {
    level: 3,
    name: "Accompagnements des 6 derniers mois Plus d'information sur les accompagnements des 6 derniers mois",
  })
}

function lignesDuTableauDesAccompagnements(): ReadonlyArray<null | string> {
  const tableau = screen.getByRole('table', { hidden: true, name: 'Accompagnements des 6 derniers mois' })
  return within(tableau)
    .getAllByRole('row', { hidden: true })
    .slice(1)
    .map((ligne) => ligne.textContent)
}
