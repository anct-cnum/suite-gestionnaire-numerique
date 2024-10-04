import { fireEvent, screen, within } from '@testing-library/react'
import * as navigation from 'next/navigation'

import MesUtilisateurs from './MesUtilisateurs'
import * as supprimerAction from '@/app/api/actions/supprimerUnUtilisateurAction'
import { TypologieRole } from '@/domain/Role'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { renderComponent, infosSessionUtilisateurContext, spiedNextNavigation } from '@/testHelper'
import { MesUtilisateursReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'

describe('mes utilisateurs', () => {
  const pageCourante = 0
  const totalUtilisateur = 11

  it('quand j’affiche mes utilisateurs alors s’affiche l’en-tête', () => {
    // GIVEN
    spyOnSearchParams(1)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gestion de mes utilisateurs' })
    expect(titre).toBeInTheDocument()

    const InviterUnePersonne = screen.getByRole('button', { name: 'Inviter une personne' })
    expect(InviterUnePersonne).toHaveAttribute('type', 'button')

    const { columnsHead } = getByTable()
    expect(columnsHead).toHaveLength(7)
    expect(columnsHead[0].textContent).toBe(' ')
    expect(columnsHead[1].textContent).toBe('Utilisateur')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Adresse électronique')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Rôle')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')
    expect(columnsHead[4].textContent).toBe('Dernière connexion')
    expect(columnsHead[4]).toHaveAttribute('scope', 'col')
    expect(columnsHead[5].textContent).toBe('Statut')
    expect(columnsHead[5]).toHaveAttribute('scope', 'col')
    expect(columnsHead[6].textContent).toBe('Action')
    expect(columnsHead[6]).toHaveAttribute('scope', 'col')
  })

  it.each([
    {
      role: 'Administrateur dispositif' as TypologieRole,
    },
    {
      role: 'Instructeur' as TypologieRole,
    },
    {
      role: 'Pilote politique publique' as TypologieRole,
    },
    {
      role: 'Support animation' as TypologieRole,
    },
  ])('faisant partie du groupe admin quand j’affiche mes utilisateurs alors je peux rechercher un utilisateur, filtrer et exporter la liste', ({ role }) => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      ...infosSessionUtilisateurContext,
      session: {
        ...infosSessionUtilisateurContext.session,
        role: {
          groupe: 'admin',
          libelle: '',
          nom: role,
          pictogramme: '',
        },
      },
    })

    // THEN
    const rechercher = screen.getByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('placeholder', 'Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('type', 'search')
    const boutonRechercher = screen.getByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).toHaveAttribute('type', 'button')

    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    expect(filtrer).toHaveAttribute('type', 'button')
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    expect(exporter).toHaveAttribute('type', 'button')
  })

  it.each([
    {
      role: 'Gestionnaire département' as TypologieRole,
    },
    {
      role: 'Gestionnaire région' as TypologieRole,
    },
    {
      role: 'Gestionnaire structure' as TypologieRole,
    },
    {
      role: 'Gestionnaire groupement' as TypologieRole,
    },
  ])('faisant partie du groupe gestionnaire quand j’affiche mes utilisateurs alors j’ai juste un sous titre', ({ role }) => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(
      <MesUtilisateurs
        mesUtilisateursViewModel={mesUtilisateursViewModel}
      />,
      {
        ...infosSessionUtilisateurContext,
        session: {
          ...infosSessionUtilisateurContext.session,
          role: {
            groupe: 'gestionnaire',
            libelle: 'Rhône',
            nom: role,
            pictogramme: 'maille',
          },
        },
      }
    )

    // THEN
    const rechercher = screen.queryByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).not.toBeInTheDocument()
    const boutonRechercher = screen.queryByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).not.toBeInTheDocument()

    const filtrer = screen.queryByRole('button', { name: 'Filtrer' })
    expect(filtrer).not.toBeInTheDocument()
    const exporter = screen.queryByRole('button', { name: 'Exporter' })
    expect(exporter).not.toBeInTheDocument()

    const sousTitre = screen.getByText('Gérez l’accès à l’espace de gestion', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
  })

  it('sur la ligne d’un utilisateur actif quand j’affiche mes utilisateurs alors il s’affiche avec ses informations', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    expect(columnsBody).toHaveLength(7)
    expect(within(columnsBody[0]).getByRole('presentation')).toHaveAttribute('alt', '')
    expect(columnsBody[1].textContent).toBe('Martin TartempionPréfecture du Rhône')
    expect(columnsBody[2].textContent).toBe('martin.tartempion@example.net')
    expect(columnsBody[3].textContent).toBe('Administrateur dispositif')
    expect(columnsBody[4].textContent).toBe('05/03/2024')
    expect(columnsBody[5].textContent).toBe('Activé')
  })

  it('sur la ligne d’un utilisateur inactif quand j’affiche mes utilisateurs alors il s’affiche avec ce statut et sa date d’invitation', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    expect(columnsBody[4].textContent).toBe('invité le 12/02/2024')
    expect(columnsBody[5].textContent).toBe('En attente')
  })

  it('sur ma ligne quand j’affiche mes utilisateurs alors je ne peux pas me supprimer', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeDisabled()
  })

  it('sur la ligne d’un utilisateur quand j’affiche mes utilisateurs alors je peux le supprimer', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeEnabled()
  })

  describe('quand j’escompte supprimer un utilisateur', () => {
    it('je clique sur le bouton de suppression, une modale de confirmation apparaît', () => {
      // GIVEN
      spyOnSearchParams(2)
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const { rowsBody } = getByTable()
      const columnsBody = within(rowsBody[1]).getAllByRole('cell')
      const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })

      // WHEN
      fireEvent.click(supprimer)

      // THEN
      const supprimerUnUtilisateurModal = screen.getByRole('dialog')
      expect(supprimerUnUtilisateurModal).toBeVisible()

      const titre = within(supprimerUnUtilisateurModal)
        .getByRole('heading', { level: 1, name: 'Retirer Julien Deschamps de mon équipe d’utilisateurs ?' })
      expect(titre).toBeInTheDocument()

      const fermer = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Fermer' })
      expect(fermer).toHaveAttribute('type', 'button')
      expect(fermer).toHaveAttribute('aria-controls', 'supprimer-un-utilisateur')

      const annuler = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Annuler' })
      expect(annuler).toHaveAttribute('type', 'button')
      expect(annuler).toHaveAttribute('aria-controls', 'supprimer-un-utilisateur')

      const confirmer = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Confirmer' })
      expect(confirmer).toHaveAttribute('type', 'button')
    })

    it('je me ravise : je ferme la modale', () => {
      // GIVEN
      spyOnSearchParams(3)
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const { rowsBody } = getByTable()
      const columnsBody = within(rowsBody[1]).getAllByRole('cell')
      const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
      fireEvent.click(supprimer)
      const supprimerUnUtilisateurModal = screen.getByRole('dialog')
      const fermer = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Fermer' })

      // WHEN
      fireEvent.click(fermer)

      // THEN
      expect(supprimerUnUtilisateurModal).not.toBeVisible()
    })

    it('je confirme la suppression', async () => {
      // GIVEN
      spyOnSearchParams(3)
      vi.spyOn(supprimerAction, 'supprimerUnUtilisateurAction').mockResolvedValueOnce('OK')
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
      vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const { rowsBody } = getByTable()
      const columnsBody = within(rowsBody[1]).getAllByRole('cell')
      const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
      fireEvent.click(supprimer)
      const supprimerUnUtilisateurModal = screen.getByRole('dialog')
      const confirmer = await within(supprimerUnUtilisateurModal).findByRole('button', { name: 'Confirmer' })

      // WHEN
      fireEvent.click(confirmer)

      // THEN
      const supprimerUnUtilisateurModalApresSuppression = await screen.findByRole('dialog')
      expect(supprimerUnUtilisateurModalApresSuppression).not.toBeVisible()
      expect(supprimerAction.supprimerUnUtilisateurAction).toHaveBeenCalledWith('123456')
      expect(window.location.reload).toHaveBeenCalledOnce()
    })
  })

  it('quand j’affiche mes utilisateurs alors s’affiche la pagination', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    expect(navigation).toBeInTheDocument()
  })

  it('quand je clique sur le bouton pour filtrer alors les filtres apparaissent', () => {
    // GIVEN
    spyOnSearchParams(2)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
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

    const boutonReinitialiser = within(formulaire).getByRole('button', { name: 'Réinitialiser les filtres' })
    expect(boutonReinitialiser).toHaveAttribute('type', 'reset')

    const boutonAfficher = within(formulaire).getByRole('button', { name: 'Afficher les utilisateurs' })
    expect(boutonAfficher).toBeEnabled()
    expect(boutonAfficher).toHaveAttribute('type', 'submit')
    expect(boutonAfficher).toHaveAttribute('aria-controls', 'drawer-modifier-mon-compte')
  })

  it('ayant des filtres déjà actifs quand je clique sur le bouton pour filtrer alors ils apparaissent préremplis', () => {
    // GIVEN
    spyOnSearchParams(2, new URLSearchParams('utilisateursActives=on'))
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // WHEN
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    fireEvent.click(filtrer)

    // THEN
    const utilisateursActives = screen.getByLabelText('Uniquement les utilisateurs activés')
    expect(utilisateursActives).toBeChecked()
  })

  it('quand je clique sur le bouton pour réinitialiser les filtres alors je repars de zéro', () => {
    // GIVEN
    spyOnSearchParams(2)
    vi.spyOn(navigation, 'useRouter')
      .mockReturnValueOnce(spiedNextNavigation.useRouter)
      .mockReturnValueOnce(spiedNextNavigation.useRouter)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    fireEvent.click(filtrer)

    // WHEN
    const boutonReinitialiser = screen.getByRole('button', { name: 'Réinitialiser les filtres' })
    fireEvent.click(boutonReinitialiser)

    // THEN
    expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('/mes-utilisateurs')
  })

  describe('quand je filtre', () => {
    it('sur les utilisateurs activés alors je n’affiche qu’eux', () => {
      // GIVEN
      spyOnSearchParams(3)
      vi.spyOn(navigation, 'useRouter')
        .mockReturnValueOnce(spiedNextNavigation.useRouter)
        .mockReturnValueOnce(spiedNextNavigation.useRouter)
      afficherLesFiltres()
      const utilisateursActives = screen.getByLabelText('Uniquement les utilisateurs activés')
      fireEvent.click(utilisateursActives)

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('http://localhost:3000/mes-utilisateurs?utilisateursActives=on')
    })

    function afficherLesFiltres() {
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

      const filtrer = screen.getByRole('button', { name: 'Filtrer' })
      fireEvent.click(filtrer)
    }
  })
})

function getByTable() {
  const mesUtilisateurs = screen.getByRole('table', { name: 'Mes utilisateurs' })
  const rowsGroup = within(mesUtilisateurs).getAllByRole('rowgroup')

  const head = rowsGroup[0]
  const rowHead = within(head).getByRole('row')
  const columnsHead = within(rowHead).getAllByRole('columnheader')

  const body = rowsGroup[1]
  const rowsBody = within(body).getAllByRole('row')

  return { columnsHead, rowsBody }
}

function spyOnSearchParams(nombreDeSpy: number, spy: URLSearchParams = spiedNextNavigation.useSearchParams) {
  for (let index = 0; index < nombreDeSpy; index++) {
    // @ts-expect-error
    vi.spyOn(navigation, 'useSearchParams').mockReturnValueOnce(spy)
  }
}

const mesUtilisateursReadModel: ReadonlyArray<MesUtilisateursReadModel> = [
  {
    departementCode: null,
    derniereConnexion: new Date('2024-03-05'),
    email: 'martin.tartempion@example.net',
    groupementId: null,
    inviteLe: new Date('2024-03-01'),
    isActive: true,
    isSuperAdmin: true,
    nom: 'Tartempion',
    prenom: 'Martin',
    regionCode: null,
    role: {
      categorie: 'anct',
      groupe: 'admin',
      nom: 'Administrateur dispositif',
      territoireOuStructure: 'Préfecture du Rhône',
    },
    structureId: null,
    uid: '7396c91e-b9f2-4f9d-8547-5e9b3332725b',
  },
  {
    departementCode: null,
    derniereConnexion: new Date(0),
    email: 'julien.deschamps@example.com',
    groupementId: null,
    inviteLe: new Date('2024-02-12'),
    isActive: false,
    isSuperAdmin: false,
    nom: 'Deschamps',
    prenom: 'Julien',
    regionCode: null,
    role: {
      categorie: 'structure',
      groupe: 'gestionnaire',
      nom: 'Gestionnaire structure',
      territoireOuStructure: 'Hub du Rhône',
    },
    structureId: 1,
    uid: '123456',
  },
]
