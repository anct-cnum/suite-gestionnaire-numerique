import { screen, within } from '@testing-library/react'
import { clearFirst } from 'react-select-event'

import MesUtilisateurs from './MesUtilisateurs'
import { cocherLaCase, presserLeBouton, saisirLeTexte, renderComponent, rolesAvecStructure, structuresFetch, selectionnerLElement } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { epochTime } from '@/shared/testHelper'

describe('filtrer mes utilisateurs', () => {
  it('quand je clique sur le bouton pour filtrer alors les filtres apparaissent', () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourFiltrer()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Filtrer' })

    const titre = within(drawer).getByRole('heading', { level: 1, name: 'Filtrer' })
    expect(titre).toBeInTheDocument()

    const formulaire = within(drawer).getByRole('form', { name: 'Filtrer' })
    expect(formulaire).toHaveAttribute('method', 'dialog')

    const utilisateursActives = within(drawer).getByRole('checkbox', { checked: false, name: 'Uniquement les utilisateurs activés' })
    expect(utilisateursActives).toHaveAttribute('name', 'utilisateursActives')

    const zonesGeographiques = within(drawer).getByRole('combobox', { name: 'Par zone géographique' })
    expect(zonesGeographiques).toBeInTheDocument()

    const structure = within(drawer).getByRole('combobox', { name: 'Par structure' })
    expect(structure).toBeInTheDocument()

    const administrateurDispositif = within(formulaire).getByRole('checkbox', { checked: true, name: 'Administrateur dispositif' })
    expect(administrateurDispositif).toHaveAttribute('name', 'roles')
    const gestionnaireDepartement = within(formulaire).getByRole('checkbox', { checked: true, name: 'Gestionnaire département' })
    expect(gestionnaireDepartement).toHaveAttribute('name', 'roles')
    const gestionnaireGroupement = within(formulaire).getByRole('checkbox', { checked: true, name: 'Gestionnaire groupement' })
    expect(gestionnaireGroupement).toHaveAttribute('name', 'roles')
    const gestionnaireRegion = within(formulaire).getByRole('checkbox', { checked: true, name: 'Gestionnaire région' })
    expect(gestionnaireRegion).toHaveAttribute('name', 'roles')
    const gestionnaireStructure = within(formulaire).getByRole('checkbox', { checked: true, name: 'Gestionnaire structure' })
    expect(gestionnaireStructure).toHaveAttribute('name', 'roles')
    const instructeur = within(formulaire).getByRole('checkbox', { checked: true, name: 'Instructeur' })
    expect(instructeur).toHaveAttribute('name', 'roles')
    const pilotePolitiquePublique = within(formulaire).getByRole('checkbox', { checked: true, name: 'Pilote politique publique' })
    expect(pilotePolitiquePublique).toHaveAttribute('name', 'roles')
    const supportAnimation = within(formulaire).getByRole('checkbox', { checked: true, name: 'Support animation' })
    expect(supportAnimation).toHaveAttribute('name', 'roles')

    const boutonReinitialiser = within(formulaire).getByRole('button', { name: 'Réinitialiser les filtres' })
    expect(boutonReinitialiser).toHaveAttribute('type', 'reset')

    const boutonAfficher = within(formulaire).getByRole('button', { name: 'Afficher les utilisateurs' })
    expect(boutonAfficher).toBeEnabled()
    expect(boutonAfficher).toHaveAttribute('type', 'submit')
    expect(boutonAfficher).toHaveAttribute('aria-controls', 'drawer-filtre-utilisateurs')
  })

  it('quand je clique sur filtrer puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourFiltrer()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Filtrer' })
    const fermer = jeFermeLeFormulairePourFiltrer()

    // THEN
    expect(fermer).toHaveAttribute('aria-controls', 'drawer-filtre-utilisateurs')
    expect(drawer).not.toBeVisible()
  })

  it('ayant des filtres déjà actifs quand je clique sur le bouton pour filtrer alors ils apparaissent préremplis', () => {
    // GIVEN
    afficherMesUtilisateurs({ searchParams: new URLSearchParams('utilisateursActives=on&roles=gestionnaire_groupement,instructeur&codeDepartement=978') })

    // WHEN
    jOuvreLeFormulairePourFiltrer()

    // THEN
    const formulaire = screen.getByRole('form', { name: 'Filtrer' })
    expect(formulaire).toHaveFormValues({
      roles: [
        'gestionnaire_groupement',
        'instructeur',
      ],
      utilisateursActives: true,
      zoneGeographique: '00_978',
    })
  })

  it('quand je clique sur le bouton pour réinitialiser les filtres alors je repars de zéro', () => {
    // GIVEN
    const spiedRouterPush = vi.fn()
    afficherMesUtilisateurs({
      router: {
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
        push: spiedRouterPush,
        refresh: vi.fn(),
        replace: vi.fn(),
      },
    })

    // WHEN
    jOuvreLeFormulairePourFiltrer()
    const champRechercher = jeTapeMaRecherche('martin')
    jeReinitialiseLesFiltres()

    // THEN
    expect(spiedRouterPush).toHaveBeenCalledWith('/mes-utilisateurs')
    expect(champRechercher).toHaveValue('')
  })

  it('quand il n’y a aucun résultat après un filtrage alors une phrase s’affiche pour informer l’utilisateur et le drawer se ferme', () => {
    // WHEN
    afficherMesUtilisateurs({ searchParams: new URLSearchParams('roles=instructeur') }, 0)

    // THEN
    const phraseInformative = screen.getByText('Aucun utilisateur ne correspond aux filtres sélectionnés.', { selector: 'p' })
    expect(phraseInformative).toBeInTheDocument()
  })

  describe('quand je filtre', () => {
    it('sur les utilisateurs activés alors je n’affiche qu’eux', () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherMesUtilisateurs({
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      })

      // WHEN
      jOuvreLeFormulairePourFiltrer()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Filtrer' })
      jeSelectionneUniquementLesUtilisateursActives()
      jeFiltreLesUtilisateurs()

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?utilisateursActives=on')
      expect(drawer).not.toBeVisible()
    })

    it('sur certains rôles alors je n’affiche qu’eux', () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherMesUtilisateurs({
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      })

      // WHEN
      jOuvreLeFormulairePourFiltrer()
      jeSelectionneGestionnaireRegion()
      jeSelectionneGestionnaireDepartement()
      jeFiltreLesUtilisateurs()

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?roles=administrateur_dispositif%2Cgestionnaire_groupement%2Cgestionnaire_structure%2Cinstructeur%2Cpilote_politique_publique%2Csupport_animation')
    })

    it('sur un département alors je n’affiche qu’eux', async () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherMesUtilisateurs({
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      })

      // WHEN
      jOuvreLeFormulairePourFiltrer()
      await jeSelectionneUneZoneGeographique('(978) Saint-Martin')
      jeFiltreLesUtilisateurs()

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeDepartement=978')
    })

    it('sur une région alors je n’affiche qu’eux', async () => {
      // GIVEN
      const spiedRouterPush = vi.fn()
      afficherMesUtilisateurs({
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      })

      // WHEN
      jOuvreLeFormulairePourFiltrer()
      await jeSelectionneUneZoneGeographique("(93) Provence-Alpes-Côte d'Azur")
      jeFiltreLesUtilisateurs()

      // THEN
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeRegion=93')
    })

    it('sur une structure alors je n’affiche que les utilisateurs liés à cette structure', async () => {
      // GIVEN
      vi.stubGlobal('fetch', vi.fn(structuresFetch))
      const spiedRouterPush = vi.fn()
      afficherMesUtilisateurs({
        router: {
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
          push: spiedRouterPush,
          refresh: vi.fn(),
          replace: vi.fn(),
        },
      })

      // WHEN
      jOuvreLeFormulairePourFiltrer()
      const structure = jeTapeUneStructure('tet')
      await jeSelectionneUneStructure(structure, 'TETRIS — GRASSE')
      jeFiltreLesUtilisateurs()

      // THEN
      expect(fetch).toHaveBeenCalledWith('/api/structures?search=tet')
      expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?structure=14')
    })

    describe('sur une zone géographique et une structure', () => {
      it.each([
        {
          desc: 'sur une région et une structure de cette région',
          expectedFetchInput: '/api/structures?search=tet&region=93',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?codeRegion=93&structure=14',
          zoneGeographique: "(93) Provence-Alpes-Côte d'Azur",
        },
        {
          desc: 'sur un département et une structure de ce département',
          expectedFetchInput: '/api/structures?search=tet&departement=06',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?codeDepartement=06&structure=14',
          zoneGeographique: '(06) Alpes-Maritimes',
        },
        {
          desc: 'sur toutes les zones géographiques et une structure',
          expectedFetchInput: '/api/structures?search=tet',
          expectedRouterPush: 'http://example.com/mes-utilisateurs?structure=14',
          zoneGeographique: 'Toutes les régions',
        },

      ])(
        '$desc, alors je n’affiche que les utilisateurs liés à cette structure',
        async ({ expectedFetchInput, expectedRouterPush, zoneGeographique }) => {
          // GIVEN
          vi.stubGlobal('fetch', vi.fn(structuresFetch))
          const spiedRouterPush = vi.fn()
          afficherMesUtilisateurs({
            router: {
              back: vi.fn(),
              forward: vi.fn(),
              prefetch: vi.fn(),
              push: spiedRouterPush,
              refresh: vi.fn(),
              replace: vi.fn(),
            },
          })

          // WHEN
          jOuvreLeFormulairePourFiltrer()
          await jeSelectionneUneZoneGeographique(zoneGeographique)
          const structure = jeTapeUneStructure('tet')
          await jeSelectionneUneStructure(structure, 'TETRIS — GRASSE')
          jeFiltreLesUtilisateurs()

          // THEN
          expect(fetch).toHaveBeenCalledWith(expectedFetchInput)
          expect(spiedRouterPush).toHaveBeenCalledWith(expectedRouterPush)
        }
      )

      it('après avoir effacé la zone géographique précédemment sélectionnée, alors je n’affiche que les utilisateurs liés à cette structure', async () => {
        // GIVEN
        vi.stubGlobal('fetch', structuresFetch)
        const spiedRouterPush = vi.fn()
        afficherMesUtilisateurs({
          router: {
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: spiedRouterPush,
            refresh: vi.fn(),
            replace: vi.fn(),
          },
        })

        // WHEN
        jOuvreLeFormulairePourFiltrer()
        await jeSelectionneUneZoneGeographique('(06) Alpes-Maritimes')
        const structure = jeTapeUneStructure('tet')
        await jeSelectionneUneStructure(structure, 'TETRIS — GRASSE')
        await clearFirst(screen.getByLabelText('Par zone géographique'))
        jeFiltreLesUtilisateurs()

        // THEN
        expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?structure=14')
      })

      it('après avoir sélectionné une zone géographique différente, alors je ne filtre plus les utilisateurs liés à cette structure', async () => {
        // GIVEN
        vi.stubGlobal('fetch', structuresFetch)
        const spiedRouterPush = vi.fn()
        afficherMesUtilisateurs({
          router: {
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: spiedRouterPush,
            refresh: vi.fn(),
            replace: vi.fn(),
          },
        })

        // WHEN
        jOuvreLeFormulairePourFiltrer()
        await jeSelectionneUneZoneGeographique('(06) Alpes-Maritimes')
        const structure = jeTapeUneStructure('tet')
        await jeSelectionneUneStructure(structure, 'TETRIS — GRASSE')
        await jeSelectionneUneZoneGeographique('(27) Bourgogne-Franche-Comté')
        jeFiltreLesUtilisateurs()

        // THEN
        expect(spiedRouterPush).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeRegion=27')
      })
    })
  })

  function jeSelectionneUniquementLesUtilisateursActives(): void {
    cocherLaCase('Uniquement les utilisateurs activés')
  }

  function jeTapeMaRecherche(value: string): HTMLElement {
    return saisirLeTexte('Rechercher par nom ou adresse électronique', value)
  }

  async function jeSelectionneUneZoneGeographique(zoneGeographique: string): Promise<void> {
    await selectionnerLElement(screen.getByLabelText('Par zone géographique'), zoneGeographique)
  }

  function jeTapeUneStructure(value: string): HTMLElement {
    return saisirLeTexte('Par structure', value)
  }

  async function jeSelectionneUneStructure(input: HTMLElement, nomStructure: string): Promise<void> {
    await selectionnerLElement(input, nomStructure)
  }

  function jeSelectionneGestionnaireRegion(): void {
    cocherLaCase('Gestionnaire région')
  }

  function jeSelectionneGestionnaireDepartement(): void {
    cocherLaCase('Gestionnaire département')
  }

  function jeReinitialiseLesFiltres(): void {
    presserLeBouton('Réinitialiser les filtres')
  }

  function jeFiltreLesUtilisateurs(): void {
    presserLeBouton('Afficher les utilisateurs')
  }

  function jOuvreLeFormulairePourFiltrer(): void {
    presserLeBouton('Filtrer')
  }

  function jeFermeLeFormulairePourFiltrer(): HTMLElement {
    return presserLeBouton('Fermer les filtres')
  }

  function afficherMesUtilisateurs(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    totalUtilisateur = 11
  ): void {
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure, epochTime)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, options)
  }
})
