import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import MesUtilisateurs from './MesUtilisateurs'
import { renderComponent, rolesAvecStructure, stubbedConceal } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('mes utilisateurs', () => {
  const totalUtilisateur = 11

  it('quand j’affiche mes utilisateurs, alors s’affiche l’en-tête commune aux deux groupes', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
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

  it('étant du groupe admin quand j’affiche mes utilisateurs alors je peux rechercher un utilisateur, filtrer et exporter la liste', () => {
    // GIVEN
    const spiedRouterPush = vi.fn()
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
    // WHEN
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
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory(
          {
            role: {
              doesItBelongToGroupeAdmin: true,
              libelle: '',
              nom: 'Support animation',
              pictogramme: '',
              rolesGerables: [],
            },
          }
        ),
      }
    )

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gestion de mes utilisateurs' })
    expect(titre).toBeInTheDocument()
    const rechercher = screen.getByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('placeholder', 'Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('type', 'search')
    const boutonRechercher = screen.getByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).toHaveAttribute('type', 'button')
    fireEvent.change(rechercher, { target: { value: 'martin' } })
    fireEvent.click(boutonRechercher)
    expect(spiedRouterPush).toHaveBeenCalledWith(expect.stringContaining('nomOuEmail=martin'))
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    expect(filtrer).toHaveAttribute('type', 'button')
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    expect(exporter).toHaveAttribute('type', 'button')
  })

  it('étant du groupe gestionnaire quand j’affiche mes utilisateurs alors j’ai un autre titre et un sous titre', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(
      <MesUtilisateurs
        mesUtilisateursViewModel={mesUtilisateursViewModel}
      />,
      {
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          role: {
            doesItBelongToGroupeAdmin: false,
            libelle: 'Rhône',
            nom: 'Gestionnaire groupement',
            pictogramme: 'maille',
            rolesGerables: [],
          },
        }),
      }
    )

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Utilisateurs · Rhône' })
    expect(titre).toBeInTheDocument()

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
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    expect(columnsBody).toHaveLength(7)
    expect(within(columnsBody[0]).getByRole('presentation')).toHaveAttribute('alt', '')
    expect(columnsBody[1].textContent).toBe('Martin TartempionPréfecture du Rhône')
    const boutonDrawer = within(columnsBody[1]).getByRole('button', { name: 'Martin Tartempion' })
    expect(boutonDrawer).toHaveAttribute('type', 'button')
    expect(boutonDrawer).toHaveAttribute('aria-controls', 'drawer-details-utilisateur')
    expect(columnsBody[2].textContent).toBe('martin.tartempion@example.net')
    expect(columnsBody[3].textContent).toBe('Administrateur dispositif')
    expect(columnsBody[4].textContent).toBe('05/03/2024')
    expect(columnsBody[5].textContent).toBe('Activé')
  })

  it('sur la ligne d’un utilisateur inactif quand j’affiche mes utilisateurs alors il s’affiche avec ce statut et sa date d’invitation', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    const boutonDrawer = within(columnsBody[1]).getByRole('button', { name: 'Julien Deschamps' })
    expect(boutonDrawer).toHaveAttribute('type', 'button')
    expect(boutonDrawer).toHaveAttribute('aria-controls', 'drawer-renvoyer-invitation')
    expect(columnsBody[4].textContent).toBe('invité le 12/02/2024')
    expect(columnsBody[5].textContent).toBe('En attente')
  })

  it('sur ma ligne quand j’affiche mes utilisateurs alors je ne peux pas me supprimer', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

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
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeEnabled()
  })

  it('quand je clique sur un utilisateur actif alors ses détails s’affichent dans un drawer', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const utilisateurActif = screen.getByRole('button', { name: 'Martin Tartempion' })

    // WHEN
    fireEvent.click(utilisateurActif)

    // THEN
    const drawerDetailsUtilisateur = await screen.findByRole('dialog', { name: 'Martin Tartempion' })
    const prenomEtNom = within(drawerDetailsUtilisateur).getByRole('heading', { level: 1, name: 'Martin Tartempion' })
    expect(prenomEtNom).toBeInTheDocument()
    const roleAttribueLabel = within(drawerDetailsUtilisateur).getByText('Rôle attribué')
    expect(roleAttribueLabel).toBeInTheDocument()
    const roleAttribue = within(drawerDetailsUtilisateur).getByText('Administrateur dispositif')
    expect(roleAttribue).toBeInTheDocument()

    const emailLabel = within(drawerDetailsUtilisateur).getByText('Adresse électronique')
    expect(emailLabel).toBeInTheDocument()
    const email = within(drawerDetailsUtilisateur).getByText('martin.tartempion@example.net')
    expect(email).toBeInTheDocument()

    const telephoneLabel = within(drawerDetailsUtilisateur).getByText('Téléphone professionnel')
    expect(telephoneLabel).toBeInTheDocument()
    const telephone = within(drawerDetailsUtilisateur).getByText('0102030405')
    expect(telephone).toBeInTheDocument()

    const derniereConnexionLabel = within(drawerDetailsUtilisateur).getByText('Dernière connexion')
    expect(derniereConnexionLabel).toBeInTheDocument()
    const derniereConnexion = within(drawerDetailsUtilisateur).getByText('05/03/2024')
    expect(derniereConnexion).toBeInTheDocument()

    const structureLabel = within(drawerDetailsUtilisateur).getByText('Structure ou collectivité')
    expect(structureLabel).toBeInTheDocument()
    const structure = within(drawerDetailsUtilisateur).getByText('Préfecture du Rhône')
    expect(structure).toBeInTheDocument()
  })

  describe('quand je clique sur un utilisateur en attente alors s’affiche le drawer pour renvoyer une invitation', () => {
    it('contenant les informations d’invitation ainsi que le bouton pour réinviter l’utilisateur', async () => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const utilisateurEnAttente = screen.getByRole('button', { name: 'Julien Deschamps' })

      // WHEN
      fireEvent.click(utilisateurEnAttente)

      // THEN
      const drawerRenvoyerInvitation = await screen.findByRole('dialog', { name: 'Invitation envoyée le 12/02/2024' })
      const titre = within(drawerRenvoyerInvitation).getByRole('heading', { level: 1, name: 'Invitation envoyée le 12/02/2024' })
      expect(titre).toBeInTheDocument()

      const emailLabel = within(drawerRenvoyerInvitation).getByText('Adresse électronique')
      expect(emailLabel).toBeInTheDocument()
      const email = within(drawerRenvoyerInvitation).getByText('julien.deschamps@example.com')
      expect(email).toBeInTheDocument()

      const renvoyerCetteInvitation = screen.getByRole('button', { name: 'Renvoyer cette invitation' })
      expect(renvoyerCetteInvitation).toBeEnabled()
      expect(renvoyerCetteInvitation).toHaveAttribute('aria-controls', 'drawer-renvoyer-invitation')
      expect(renvoyerCetteInvitation).toHaveAttribute('type', 'button')
    })

    it('quand je clique sur le bouton "Renvoyer cette invitation" alors le drawer se ferme et il en est notifié', async () => {
      // GIVEN
      const reinviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
      vi.stubGlobal('dsfr', stubbedConceal())
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, { pathname: '/mes-utilisateurs', reinviterUnUtilisateurAction })
      const utilisateurEnAttente = screen.getByRole('button', { name: 'Julien Deschamps' })
      fireEvent.click(utilisateurEnAttente)

      // WHEN
      const renvoyerCetteInvitation = screen.getByRole('button', { name: 'Renvoyer cette invitation' })
      fireEvent.click(renvoyerCetteInvitation)

      // THEN
      await waitFor(() => {
        expect(reinviterUnUtilisateurAction).toHaveBeenCalledWith({ path: '/mes-utilisateurs', uidUtilisateurAReinviter: '123456' })
      })
      const drawerRenvoyerInvitation = screen.queryByRole('dialog', { name: 'Invitation envoyée le 12/02/2024' })
      expect(drawerRenvoyerInvitation).not.toBeInTheDocument()
      const notification = screen.getByRole('alert')
      expect(notification).toHaveTextContent('Invitation envoyée à julien.deschamps@example.com')
    })

    it('si l’invitation a été envoyée ajourd’hui alors le titre affiché est "Invitation envoyée aujourd’hui"', async() => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurEnAttenteDAujourdhuiReadModel], '7396c91e-b9f2-4f9d-8547-87u7654rt678r5', totalUtilisateur, rolesAvecStructure)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const utilisateurEnAttente = screen.getByRole('button', { name: 'Sebastien Palat' })

      // WHEN
      fireEvent.click(utilisateurEnAttente)

      // THEN
      const drawerRenvoyerInvitation = await screen.findByRole('dialog', { name: 'Invitation envoyée aujourd’hui' })
      const titre = within(drawerRenvoyerInvitation).getByRole('heading', { level: 1, name: 'Invitation envoyée aujourd’hui' })
      expect(titre).toBeInTheDocument()
    })

    it('si l’invitation a été envoyée hier alors le titre affiché est "Invitation envoyée hier"', async() => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurEnAttenteDHierReadModel], '7396c91e-b9f2-4f9d-8547-8765t54rf6', totalUtilisateur, rolesAvecStructure)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const utilisateurEnAttente = screen.getByRole('button', { name: 'Stephane Raymond' })

      // WHEN
      fireEvent.click(utilisateurEnAttente)

      // THEN
      const drawerRenvoyerInvitation = await screen.findByRole('dialog', { name: 'Invitation envoyée hier' })
      const titre = within(drawerRenvoyerInvitation).getByRole('heading', { level: 1, name: 'Invitation envoyée hier' })
      expect(titre).toBeInTheDocument()
    })
  })

  it('quand je clique sur un utilisateur sans téléphone alors ses détails s’affichent sans le téléphone dans un drawer', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifSansTelephoneVideReadModel], '7396c91e-b9f2-4f9d-8547-5e9b876877669d', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const utilisateurSansTelephone = screen.getByRole('button', { name: 'Paul Provost' })

    // WHEN
    fireEvent.click(utilisateurSansTelephone)

    // THEN
    const drawerDetailsUtilisateur = await screen.findByRole('dialog', { name: 'Paul Provost' })
    const prenomEtNom = within(drawerDetailsUtilisateur).getByRole('heading', { level: 1, name: 'Paul Provost' })
    expect(prenomEtNom).toBeInTheDocument()
    const roleAttribueLabel = within(drawerDetailsUtilisateur).getByText('Rôle attribué')
    expect(roleAttribueLabel).toBeInTheDocument()
    const roleAttribue = within(drawerDetailsUtilisateur).getByText('Administrateur dispositif')
    expect(roleAttribue).toBeInTheDocument()

    const emailLabel = within(drawerDetailsUtilisateur).getByText('Adresse électronique')
    expect(emailLabel).toBeInTheDocument()
    const email = within(drawerDetailsUtilisateur).getByText('paul.provost@example.net')
    expect(email).toBeInTheDocument()

    const telephoneLabel = within(drawerDetailsUtilisateur).getByText('Téléphone professionnel')
    expect(telephoneLabel).toBeInTheDocument()
    const telephone = within(drawerDetailsUtilisateur).getByText('Non renseigné')
    expect(telephone).toBeInTheDocument()

    const derniereConnexionLabel = within(drawerDetailsUtilisateur).getByText('Dernière connexion')
    expect(derniereConnexionLabel).toBeInTheDocument()
    const derniereConnexion = within(drawerDetailsUtilisateur).getByText('05/03/2024')
    expect(derniereConnexion).toBeInTheDocument()

    const structureLabel = within(drawerDetailsUtilisateur).getByText('Structure ou collectivité')
    expect(structureLabel).toBeInTheDocument()
    const structureOuCollectivite = within(drawerDetailsUtilisateur).getByText('Préfecture du Rhône')
    expect(structureOuCollectivite).toBeInTheDocument()
  })

  describe('quand j’escompte supprimer un utilisateur', () => {
    it('je clique sur le bouton de suppression, une modale de confirmation apparaît', () => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const { rowsBody } = getByTable()
      const columnsBody = within(rowsBody[0]).getAllByRole('cell')
      const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })

      // WHEN
      fireEvent.click(supprimer)

      // THEN
      const supprimerUnUtilisateurModal = screen.getByRole('dialog')
      expect(supprimerUnUtilisateurModal).toBeVisible()

      const titre = within(supprimerUnUtilisateurModal)
        .getByRole('heading', { level: 1, name: 'Retirer Julien Deschamps de mon équipe d’utilisateurs ?' })
      expect(titre).toBeInTheDocument()

      const annuler = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Annuler' })
      expect(annuler).toHaveAttribute('type', 'button')
      expect(annuler).toHaveAttribute('aria-controls', 'supprimer-un-utilisateur')

      const confirmer = within(supprimerUnUtilisateurModal).getByRole('button', { name: 'Confirmer' })
      expect(confirmer).toHaveAttribute('type', 'button')
    })

    it('je confirme la suppression', async () => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)
      const supprimerUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, { pathname: '/mes-utilisateurs', supprimerUnUtilisateurAction })
      const { rowsBody } = getByTable()
      const columnsBody = within(rowsBody[1]).getAllByRole('cell')
      const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
      fireEvent.click(supprimer)
      const supprimerUnUtilisateurModal = screen.getByRole('dialog', { name: 'Retirer Julien Deschamps de mon équipe d’utilisateurs ?' })
      const confirmer = await within(supprimerUnUtilisateurModal).findByRole('button', { name: 'Confirmer' })

      // WHEN
      fireEvent.click(confirmer)

      // THEN
      const supprimerUnUtilisateurModalApresSuppression = await screen.findByRole('dialog')
      expect(supprimerUnUtilisateurModalApresSuppression).not.toBeVisible()
      expect(supprimerUnUtilisateurAction).toHaveBeenCalledWith({ path: '/mes-utilisateurs', uidUtilisateurASupprimer: '123456' })
    })
  })

  it('quand j’affiche mes utilisateurs alors s’affiche la pagination', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    expect(navigation).toBeInTheDocument()
  })

  it('quand j’affiche au plus 10 utilisateurs alors la pagination ne s’affiche pas', () => {
    // GIVEN
    const totalUtilisateur = 10
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', totalUtilisateur, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.queryByRole('navigation', { name: 'Pagination' })
    expect(navigation).not.toBeInTheDocument()
  })
})

function getByTable(): { columnsHead: ReadonlyArray<HTMLElement>, rowsBody: ReadonlyArray<HTMLElement> } {
  const mesUtilisateurs = screen.getByRole('table', { name: 'Mes utilisateurs' })
  const rowsGroup = within(mesUtilisateurs).getAllByRole('rowgroup')

  const head = rowsGroup[0]
  const rowHead = within(head).getByRole('row')
  const columnsHead = within(rowHead).getAllByRole('columnheader')

  const body = rowsGroup[1]
  const rowsBody = within(body).getAllByRole('row')

  return { columnsHead, rowsBody }
}

const utilisateurActifReadModel = utilisateurReadModelFactory({
  derniereConnexion: new Date('2024-03-05'),
  inviteLe: new Date('2024-03-01'),
  isSuperAdmin: true,
  role: {
    categorie: 'anct',
    doesItBelongToGroupeAdmin: true,
    nom: 'Administrateur dispositif',
    organisation: 'Préfecture du Rhône',
    rolesGerables: [],
  },
  uid: 'fooId',
})

const utilisateurEnAttenteReadModel = utilisateurReadModelFactory({
  email: 'julien.deschamps@example.com',
  inviteLe: new Date('2024-02-12'),
  isActive: false,
  nom: 'Deschamps',
  prenom: 'Julien',
  uid: '123456',
})

const utilisateurEnAttenteDAujourdhuiReadModel = utilisateurReadModelFactory({
  email: 'sebastien.palat@example.net',
  inviteLe: new Date(),
  isActive: false,
  nom: 'Palat',
  prenom: 'Sebastien',
})

const date = new Date()
const utilisateurEnAttenteDHierReadModel = utilisateurReadModelFactory({
  email: 'stephane.raymond@example.net',
  inviteLe: new Date(date.setDate(date.getDate() - 1)),
  isActive: false,
  nom: 'Raymond',
  prenom: 'Stephane',
})

const utilisateurActifSansTelephoneVideReadModel = utilisateurReadModelFactory({
  derniereConnexion: new Date('2024-03-05'),
  email: 'paul.provost@example.net',
  nom: 'Provost',
  prenom: 'Paul',
  role: {
    categorie: 'anct',
    doesItBelongToGroupeAdmin: true,
    nom: 'Administrateur dispositif',
    organisation: 'Préfecture du Rhône',
    rolesGerables: [],
  },
  telephone: '',
})
