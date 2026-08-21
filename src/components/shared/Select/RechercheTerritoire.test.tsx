import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import RechercheTerritoire from './RechercheTerritoire'
import { renderComponent } from '@/components/testHelper'
import { TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'
import { createDefaultTerritoiresTrouves } from '@/stories/Components/Shared/RechercheTerritoireTestData'

describe('recherche territoire', () => {
  it('affiche un label associé au champ et le placeholder attendu', () => {
    // GIVEN
    renderComponent(
      <RechercheTerritoire
        id="territoire"
        onSelectionner={vi.fn<OnSelectionner>()}
        rechercher={async () => Promise.resolve(createDefaultTerritoiresTrouves())}
      />
    )

    // THEN
    const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
    expect(champ).toBeInTheDocument()
    const placeholder = screen.getByText('Région, département, intercommunalité, ...')
    expect(placeholder).toBeInTheDocument()
  })

  it('quand moins de 2 caractères sont saisis alors aucune recherche n’est lancée et un message l’explique', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 's')

    // THEN
    const message = await screen.findByText('Saisissez au moins 2 caractères pour lancer la recherche.')
    expect(message).toBeInTheDocument()
    expect(rechercher).not.toHaveBeenCalled()
  })

  it('quand 2 caractères ou plus sont saisis alors les territoires sont proposés regroupés par type avec le nombre de résultats', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')

    // THEN
    const departement = await screen.findByRole('option', { name: 'Haute-Saône · 70' })
    expect(departement).toBeInTheDocument()
    const epci = screen.getByRole('option', { name: 'CC Saône-Beaujolais · 69' })
    expect(epci).toBeInTheDocument()
    const groupes = screen.getAllByText(/Départements|Intercommunalités/)
    expect(groupes).toHaveLength(2)
    const compteur = screen.getByText(/5 territoires correspondent à/)
    expect(compteur.textContent).toBe('5 territoires correspondent à « saône »')
    expect(rechercher).toHaveBeenCalledWith('saône')
  })

  it('quand un seul territoire correspond alors le compteur est au singulier', async () => {
    // GIVEN
    const territoiresTrouves = createDefaultTerritoiresTrouves()
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce({
      territoires: [territoiresTrouves.territoires[0]],
      total: 1,
    })
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'haute-saône')

    // THEN
    const compteur = await screen.findByText(/1 territoire correspond à/)
    expect(compteur.textContent).toBe('1 territoire correspond à « haute-saône »')
  })

  it('quand il y a plus de résultats que d’affichés alors un message invite à affiner la recherche', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves({ total: 34 }))
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'loire')

    // THEN
    const message = await screen.findByText(/Seuls les 5 premiers résultats sont affichés sur 34\./)
    expect(message.textContent).toBe(
      'Seuls les 5 premiers résultats sont affichés sur 34.Affinez votre recherche pour réduire la liste.'
    )
  })

  it('quand un territoire est sélectionné alors il est transmis et repris dans le champ', async () => {
    // GIVEN
    const onSelectionner = vi.fn<OnSelectionner>()
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(<RechercheTerritoire id="territoire" onSelectionner={onSelectionner} rechercher={rechercher} />)

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
    await userEvent.click(await screen.findByRole('option', { name: 'CC Saône-Beaujolais · 69' }))

    // THEN
    expect(onSelectionner).toHaveBeenCalledWith({
      code: '246900682',
      label: 'CC Saône-Beaujolais · 69',
      type: 'epci',
      value: 'epci-246900682',
    })
    const champ = screen.getByText('CC Saône-Beaujolais · 69')
    expect(champ).toBeInTheDocument()
  })

  it('quand aucun territoire ne correspond alors un message d’erreur est affiché sans aucun résultat sélectionnable', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce({ territoires: [], total: 0 })
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saonne')

    // THEN
    const message = await screen.findByText(/Aucun territoire ne correspond à/)
    expect(message.textContent).toBe('Aucun territoire ne correspond à « saonne »')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('quand la sélection est effacée alors le filtre est supprimé', async () => {
    // GIVEN
    const onSelectionner = vi.fn<OnSelectionner>()
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(<RechercheTerritoire id="territoire" onSelectionner={onSelectionner} rechercher={rechercher} />)
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
    await userEvent.click(await screen.findByRole('option', { name: 'CC Saône-Beaujolais · 69' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }))

    // THEN
    expect(onSelectionner).toHaveBeenLastCalledWith(null)
    expect(screen.queryByText('CC Saône-Beaujolais · 69')).not.toBeInTheDocument()
  })

  it('quand une valeur initiale est fournie alors elle est affichée dans le champ', () => {
    // GIVEN
    renderComponent(
      <RechercheTerritoire
        id="territoire"
        onSelectionner={vi.fn<OnSelectionner>()}
        rechercher={async () => Promise.resolve(createDefaultTerritoiresTrouves())}
        valeurInitiale={{
          code: '70',
          label: 'Haute-Saône · 70',
          type: 'departement',
          value: 'departement-70',
        }}
      />
    )

    // THEN
    const champ = screen.getByText('Haute-Saône · 70')
    expect(champ).toBeInTheDocument()
  })

  it('quand le périmètre de recherche est limité alors l’information est affichée', () => {
    // GIVEN
    renderComponent(
      <RechercheTerritoire
        id="territoire"
        onSelectionner={vi.fn<OnSelectionner>()}
        perimetreLimite={true}
        rechercher={async () => Promise.resolve(createDefaultTerritoiresTrouves())}
      />
    )

    // THEN
    const information = screen.getByText('Recherche limitée à votre périmètre')
    expect(information).toBeInTheDocument()
  })
})

type OnSelectionner = (territoire: null | TerritoireViewModel) => void

type Rechercher = (terme: string) => Promise<ReturnType<typeof createDefaultTerritoiresTrouves>>
