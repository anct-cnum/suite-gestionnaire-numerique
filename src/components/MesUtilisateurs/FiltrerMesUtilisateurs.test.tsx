import { fireEvent, screen, within } from '@testing-library/react'
import { clearFirst, select } from 'react-select-event'
import { Mock } from 'vitest'

import MesUtilisateurs from './MesUtilisateurs'
import { renderComponent, rolesAvecStructure, structuresFetch } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'

describe('filtrer mes utilisateurs', () => {
  const totalUtilisateur = 11

  it('quand je clique sur le bouton pour filtrer alors les filtres apparaissent', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // WHEN
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    fireEvent.click(filtrer)

    // THEN
    const drawerFiltrer = screen.getByRole('dialog', { name: 'Filtrer' })

    const titre = within(drawerFiltrer).getByRole('heading', { level: 1, name: 'Filtrer' })
    expect(titre).toBeInTheDocument()

    const formulaire = within(drawerFiltrer).getByRole('form', { name: 'Filtrer' })
    expect(formulaire).toHaveAttribute('method', 'dialog')

    const zonesGeographiques = within(drawerFiltrer).getByRole('combobox', { name: 'Par zone géographique' })
    expect(zonesGeographiques).toBeInTheDocument()

    const administrateurDispositif = within(formulaire).getByLabelText('Administrateur dispositif')
    expect(administrateurDispositif).toBeChecked()
    const gestionnaireDepartement = within(formulaire).getByLabelText('Gestionnaire département')
    expect(gestionnaireDepartement).toBeChecked()
    const gestionnaireGroupement = within(formulaire).getByLabelText('Gestionnaire groupement')
    expect(gestionnaireGroupement).toBeChecked()
    const gestionnaireRegion = within(formulaire).getByLabelText('Gestionnaire région')
    expect(gestionnaireRegion).toBeChecked()
    const gestionnaireStructure = within(formulaire).getByLabelText('Gestionnaire structure')
    expect(gestionnaireStructure).toBeChecked()
    const instructeur = within(formulaire).getByLabelText('Instructeur')
    expect(instructeur).toBeChecked()
    const pilotePolitiquePublique = within(formulaire).getByLabelText('Pilote politique publique')
    expect(pilotePolitiquePublique).toBeChecked()
    const supportAnimation = within(formulaire).getByLabelText('Support animation')
    expect(supportAnimation).toBeChecked()

    const boutonReinitialiser = within(formulaire).getByRole('button', { name: 'Réinitialiser les filtres' })
    expect(boutonReinitialiser).toHaveAttribute('type', 'reset')

    const boutonAfficher = within(formulaire).getByRole('button', { name: 'Afficher les utilisateurs' })
    expect(boutonAfficher).toBeEnabled()
    expect(boutonAfficher).toHaveAttribute('type', 'submit')
    expect(boutonAfficher).toHaveAttribute('aria-controls', 'drawer-filtre-utilisateurs')
  })

  it('ayant des filtres déjà actifs quand je clique sur le bouton pour filtrer alors ils apparaissent préremplis', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
      { searchParams: new URLSearchParams('utilisateursActives=on&roles=gestionnaire_groupement,instructeur') }
    )

    // WHEN
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    fireEvent.click(filtrer)
    const filtres = screen.getByRole('dialog', { name: 'Filtrer' })

    // THEN
    const utilisateursActives = within(filtres).getByLabelText('Uniquement les utilisateurs activés')
    expect(utilisateursActives).toBeChecked()
    const administrateurDispositif = within(filtres).getByLabelText('Administrateur dispositif')
    expect(administrateurDispositif).not.toBeChecked()
    const gestionnaireDepartement = within(filtres).getByLabelText('Gestionnaire département')
    expect(gestionnaireDepartement).not.toBeChecked()
    const gestionnaireGroupement = within(filtres).getByLabelText('Gestionnaire groupement')
    expect(gestionnaireGroupement).toBeChecked()
    const gestionnaireRegion = within(filtres).getByLabelText('Gestionnaire région')
    expect(gestionnaireRegion).not.toBeChecked()
    const gestionnaireStructure = within(filtres).getByLabelText('Gestionnaire structure')
    expect(gestionnaireStructure).not.toBeChecked()
    const instructeur = within(filtres).getByLabelText('Instructeur')
    expect(instructeur).toBeChecked()
    const pilotePolitiquePublique = within(filtres).getByLabelText('Pilote politique publique')
    expect(pilotePolitiquePublique).not.toBeChecked()
    const supportAnimation = within(filtres).getByLabelText('Support animation')
    expect(supportAnimation).not.toBeChecked()
  })

  it('quand je clique sur le bouton pour réinitialiser les filtres alors je repars de zéro', () => {
    // GIVEN
    const spiedRouterPush = vi.fn()
    afficherLesFiltres(spiedRouterPush)

    // WHEN
    const boutonReinitialiser = screen.getByRole('button', { name: 'Réinitialiser les filtres' })
    fireEvent.click(boutonReinitialiser)

    // THEN
    expect(spiedRouterPush).toHaveBeenCalledWith('/mes-utilisateurs')
  })

  describe('quand je filtre', () => {
    it('sur les utilisateurs activés alors je n’affiche qu’eux', () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherLesFiltres(spiedRouterPush)
      const filtres = screen.getByRole('dialog', { name: 'Filtrer' })
      const utilisateursActives = within(filtres).getByLabelText('Uniquement les utilisateurs activés')
      fireEvent.click(utilisateursActives)

      // WHEN
      const boutonAfficher = within(filtres).getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?utilisateursActives=on')
    })

    it('sur certains rôles alors je n’affiche qu’eux', () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherLesFiltres(spiedRouterPush)
      const filtres = screen.getByRole('dialog', { name: 'Filtrer' })
      const gestionnaireRegion = within(filtres).getByLabelText('Gestionnaire région')
      fireEvent.click(gestionnaireRegion)
      const gestionnaireDepartement = within(filtres).getByLabelText('Gestionnaire département')
      fireEvent.click(gestionnaireDepartement)

      // WHEN
      const boutonAfficher = within(filtres).getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?roles=administrateur_dispositif%2Cgestionnaire_groupement%2Cgestionnaire_structure%2Cinstructeur%2Cpilote_politique_publique%2Csupport_animation')
    })

    it('sur un département alors je n’affiche qu’eux', async () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherLesFiltres(spiedRouterPush)
      const zoneGeographique = screen.getByLabelText('Par zone géographique')
      await select(zoneGeographique, '(978) Saint-Martin')

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeDepartement=978')
    })

    it('sur une région alors je n’affiche qu’eux', async () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherLesFiltres(spiedRouterPush)
      const zoneGeographique = screen.getByLabelText('Par zone géographique')
      await select(zoneGeographique, "(93) Provence-Alpes-Côte d'Azur")

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeRegion=93')
    })

    it('sur une structure alors je n’affiche que les utilisateurs liés à cette structure', async () => {
      // GIVEN
      vi.stubGlobal('fetch', structuresFetch)
      const spiedRouterPush = vi.fn()
      afficherLesFiltres(spiedRouterPush)
      const filtreParStructure = screen.getByLabelText('Par structure')
      fireEvent.input(filtreParStructure, { target: { value: 'tet' } })
      await select(filtreParStructure, 'TETRIS')

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(filtreParStructure).toBeInTheDocument()
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?structure=14')
    })

    describe('sur une zone géographique et une structure', () => {
      it.each([
        {
          desc: 'sur une région et une structure de cette région',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?codeRegion=93&structure=14',
          zoneGeographique: "(93) Provence-Alpes-Côte d'Azur",
        },
        {
          desc: 'sur un département et une structure de ce département',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?codeDepartement=06&structure=14',
          zoneGeographique: '(06) Alpes-Maritimes',
        },
        {
          desc: 'sur toutes les zones géographiques et une structure',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?structure=14',
          zoneGeographique: 'Toutes les régions',
        },

      ])(
        '$desc, alors je n’affiche que les utilisateurs liés à cette structure',
        async ({ expectedRouterPush, zoneGeographique }) => {
          // GIVEN
          vi.stubGlobal('fetch', structuresFetch)
          const spiedRouterPush = vi.fn()
          afficherLesFiltres(spiedRouterPush)
          await select(screen.getByLabelText('Par zone géographique'), zoneGeographique)
          const filtreParStructure = screen.getByLabelText('Par structure')
          fireEvent.input(filtreParStructure, { target: { value: 'tet' } })
          await select(filtreParStructure, 'TETRIS')

          // WHEN
          const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
          fireEvent.click(boutonAfficher)

          // THEN
          expect(filtreParStructure).toBeInTheDocument()
          expect(spiedRouterPush).toHaveBeenCalledWith(expectedRouterPush)
        }
      )

      it('après avoir effacé la zone géographique précédemment sélectionnée, alors je n’affiche que les utilisateurs liés à cette structure', async () => {
        // GIVEN
        vi.stubGlobal('fetch', structuresFetch)
        const spiedRouterPush = vi.fn()
        afficherLesFiltres(spiedRouterPush)
        const filtreParZoneGeographique = screen.getByLabelText('Par zone géographique')
        await select(filtreParZoneGeographique, '(06) Alpes-Maritimes')
        const filtreParStructure = screen.getByLabelText('Par structure')
        fireEvent.input(filtreParStructure, { target: { value: 'tet' } })
        await select(filtreParStructure, 'TETRIS')

        // WHEN
        const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
        await clearFirst(filtreParZoneGeographique)
        fireEvent.click(boutonAfficher)

        // THEN
        expect(filtreParStructure).toBeInTheDocument()
        expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?structure=14')
      })
    })
  })

  function afficherLesFiltres(spiedRouterPush: Mock): void {
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
      {
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      }
    )

    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    fireEvent.click(filtrer)
  }
})

