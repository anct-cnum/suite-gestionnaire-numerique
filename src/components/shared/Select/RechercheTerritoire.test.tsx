import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

  it('quand aucun territoire ne correspond alors le message d’erreur est relié au champ et annoncé', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce({ territoires: [], total: 0 })
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )
    const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
    expect(champ).not.toHaveAttribute('aria-invalid')

    // WHEN
    await userEvent.type(champ, 'saonne')

    // THEN
    const message = await screen.findByText(/Aucun territoire ne correspond à/)
    expect(message).toHaveAttribute('id', 'territoire-erreur')
    expect(champ).toHaveAttribute('aria-invalid', 'true')
    expect(champ.getAttribute('aria-describedby')?.split(' ')).toContain('territoire-erreur')
    expect(champ).toHaveAccessibleDescription(/Aucun territoire ne correspond à « saonne »/)
    const statut = screen.getByRole('status')
    expect(statut.textContent).toBe('Aucun territoire ne correspond à « saonne »')
    expect(screen.getByRole('log').textContent).not.toContain('Utilisez les flèches')
  })

  it('quand une recherche aboutit après une erreur alors le champ n’est plus en erreur', async () => {
    // GIVEN
    const rechercher = vi
      .fn<Rechercher>()
      .mockResolvedValueOnce({ territoires: [], total: 0 })
      .mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )
    const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
    await userEvent.type(champ, 'saonne')
    await screen.findByText(/Aucun territoire ne correspond à/)

    // WHEN
    await userEvent.clear(champ)
    await userEvent.type(champ, 'saône')

    // THEN
    await screen.findByRole('option', { name: 'Haute-Saône · 70' })
    expect(champ).not.toHaveAttribute('aria-invalid')
    expect(champ.getAttribute('aria-describedby') ?? '').not.toContain('territoire-erreur')
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('le champ est décrit par la consigne d’utilisation, sans consigne dans la zone d’annonce', async () => {
    // GIVEN
    renderComponent(
      <RechercheTerritoire
        id="territoire"
        onSelectionner={vi.fn<OnSelectionner>()}
        rechercher={async () => Promise.resolve(createDefaultTerritoiresTrouves())}
      />
    )

    // WHEN
    await userEvent.tab()

    // THEN
    const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
    expect(champ).toHaveAccessibleDescription(
      "La liste des territoires apparaît automatiquement lorsqu'au moins 2 caractères sont saisis dans le champ. " +
        'Seuls les 5 premiers résultats seront affichés. Affinez votre recherche pour réduire la liste.' +
        ' Région, département, intercommunalité, ...'
    )
    expect(screen.getByRole('log').textContent).toBe('')
  })

  it('quand des territoires sont proposés alors seul le nombre de résultats est annoncé en français', async () => {
    // GIVEN
    const rechercher = vi.fn<Rechercher>().mockResolvedValueOnce(createDefaultTerritoiresTrouves())
    renderComponent(
      <RechercheTerritoire id="territoire" onSelectionner={vi.fn<OnSelectionner>()} rechercher={rechercher} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')

    // THEN
    await screen.findByRole('option', { name: 'Haute-Saône · 70' })
    const nombreDeResultats = await screen.findByText('5 résultats disponibles pour la recherche « saône ».')
    expect(nombreDeResultats).toBeInTheDocument()
    expect(screen.getByRole('log').textContent).toBe('5 résultats disponibles pour la recherche « saône ».')
  })

  it('quand le champ contenant un territoire reçoit le focus alors le territoire sélectionné est annoncé en français', async () => {
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

    // WHEN
    await userEvent.tab()

    // THEN
    const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
    expect(champ).toHaveAccessibleDescription(
      "La liste des territoires apparaît automatiquement lorsqu'au moins 2 caractères sont saisis dans le champ. " +
        'Seuls les 5 premiers résultats seront affichés. Affinez votre recherche pour réduire la liste.' +
        ' Territoire sélectionné : Haute-Saône · 70.'
    )
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

  describe('en mode « sélectionner puis rechercher » (vitrine)', () => {
    afterEach(() => {
      // La simulation d'un appareil Apple ne doit pas fuir vers les autres tests (ordre aléatoire)
      vi.restoreAllMocks()
    })

    it('le champ et le bouton Rechercher forment un formulaire de recherche', () => {
      // GIVEN
      renderComponent(
        <RechercheTerritoire id="territoire" onValider={vi.fn<OnValider>()} rechercher={rechercherParDefaut} />
      )

      // THEN
      const formulaire = screen.getByRole('search')
      expect(formulaire).toBeInTheDocument()
      const bouton = screen.getByRole('button', { name: 'Rechercher' })
      expect(bouton).toHaveAttribute('type', 'submit')
    })

    it('quand un territoire est sélectionné alors rien n’est lancé et le territoire est repris dans le champ', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)

      // WHEN
      await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
      await userEvent.click(await screen.findByRole('option', { name: 'Haute-Saône · 70' }))

      // THEN
      expect(onValider).not.toHaveBeenCalled()
      const champ = screen.getByText('Haute-Saône · 70')
      expect(champ).toBeInTheDocument()
    })

    it('quand un territoire est sélectionné puis le bouton Rechercher activé alors la recherche est lancée sur ce territoire', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)

      // WHEN
      await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
      await userEvent.click(await screen.findByRole('option', { name: 'Haute-Saône · 70' }))
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // THEN
      expect(onValider).toHaveBeenCalledExactlyOnceWith({
        code: '70',
        label: 'Haute-Saône · 70',
        type: 'departement',
        value: 'departement-70',
      })
    })

    it('au clavier, Entrée sur une option la sélectionne seulement, puis Entrée liste fermée lance la recherche', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)
      await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
      await screen.findByRole('option', { name: 'Haute-Saône · 70' })

      // WHEN
      await userEvent.keyboard('{Enter}')

      // THEN
      expect(onValider).not.toHaveBeenCalled()

      // WHEN
      // jsdom est vu comme un écran tactile : react-select y retire le focus du champ après une sélection
      await userEvent.tab()
      await userEvent.keyboard('{Enter}')

      // THEN
      expect(onValider).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ label: 'Haute-Saône · 70' }))
    })

    it('quand le champ est vide et le bouton Rechercher activé alors une erreur reliée au champ demande de saisir puis sélectionner', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)

      // WHEN
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // THEN
      expect(onValider).not.toHaveBeenCalled()
      const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
      expect(champ).toHaveAttribute('aria-invalid', 'true')
      expect(champ).toHaveAccessibleDescription(
        /^Saisissez au moins 2 caractères, puis sélectionnez un territoire dans la liste\./
      )
      expect(champ).toHaveFocus()
    })

    it('quand un texte est saisi sans sélection et le bouton Rechercher activé alors une erreur demande de sélectionner un territoire', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)
      await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
      await screen.findByRole('option', { name: 'Haute-Saône · 70' })

      // WHEN
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // THEN
      expect(onValider).not.toHaveBeenCalled()
      const erreur = screen.getByText('Sélectionnez un territoire dans la liste des résultats.')
      expect(erreur).toHaveClass('fr-error-text')
      const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
      expect(champ).toHaveAttribute('aria-invalid', 'true')
      expect(champ).toHaveFocus()
    })

    it('quand le texte est modifié après une sélection alors la sélection est annulée', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      renderComponent(<RechercheTerritoire id="territoire" onValider={onValider} rechercher={rechercherParDefaut} />)
      const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
      await userEvent.type(champ, 'saône')
      await userEvent.click(await screen.findByRole('option', { name: 'Haute-Saône · 70' }))

      // WHEN
      await userEvent.type(champ, 'lo')
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // THEN
      expect(onValider).not.toHaveBeenCalled()
      const erreur = screen.getByText('Sélectionnez un territoire dans la liste des résultats.')
      expect(erreur).toBeInTheDocument()
    })

    it('quand le champ est pré-rempli et le bouton Rechercher activé alors la recherche est lancée sur le territoire affiché', async () => {
      // GIVEN
      const onValider = vi.fn<OnValider>()
      const territoire: TerritoireViewModel = {
        code: '41',
        label: 'Loir-et-Cher · 41',
        type: 'departement',
        value: 'departement-41',
      }
      renderComponent(
        <RechercheTerritoire
          id="territoire"
          onValider={onValider}
          rechercher={rechercherParDefaut}
          valeurInitiale={territoire}
        />
      )

      // WHEN
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // THEN
      expect(onValider).toHaveBeenCalledExactlyOnceWith(territoire)
    })

    it('quand la liste est rouverte après une sélection alors l’option choisie porte aria-selected, y compris sur un appareil Apple', async () => {
      // GIVEN
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      renderComponent(
        <RechercheTerritoire id="territoire" onValider={vi.fn<OnValider>()} rechercher={rechercherParDefaut} />
      )
      const champ = screen.getByRole('combobox', { name: 'Rechercher un territoire' })
      await userEvent.type(champ, 'saône')
      await userEvent.click(await screen.findByRole('option', { name: 'Haute-Saône · 70' }))

      // WHEN
      // jsdom est vu comme un écran tactile : react-select y retire le focus du champ après une sélection
      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}')

      // THEN
      const choisie = await screen.findByRole('option', { name: 'Haute-Saône · 70' })
      expect(choisie).toHaveAttribute('aria-selected', 'true')
      const autre = screen.getByRole('option', { name: 'Saône-et-Loire · 71' })
      expect(autre).toHaveAttribute('aria-selected', 'false')
    })

    it('les textes de la liste qui ne sont pas des options sont des paragraphes', async () => {
      // GIVEN
      renderComponent(
        <RechercheTerritoire id="territoire" onValider={vi.fn<OnValider>()} rechercher={rechercherParDefaut} />
      )

      // WHEN
      await userEvent.type(screen.getByRole('combobox', { name: 'Rechercher un territoire' }), 'saône')
      await screen.findByRole('option', { name: 'Haute-Saône · 70' })

      // THEN
      const intitule = screen.getByText('Départements')
      expect(intitule.tagName).toBe('P')
      const pied = screen.getByText(/5 territoires correspondent à/)
      expect(pied.tagName).toBe('P')
    })
  })
})

type OnSelectionner = (territoire: null | TerritoireViewModel) => void

type OnValider = (territoire: TerritoireViewModel) => void

type Rechercher = (terme: string) => Promise<ReturnType<typeof createDefaultTerritoiresTrouves>>

async function rechercherParDefaut(): ReturnType<Rechercher> {
  return Promise.resolve(createDefaultTerritoiresTrouves())
}
