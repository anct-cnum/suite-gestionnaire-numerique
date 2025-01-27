import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import MesUtilisateurs from './MesUtilisateurs'
import { presserLeBouton, saisirLeTexte, renderComponent, rolesAvecStructure } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('mes utilisateurs', () => {
  it('quand j’affiche mes utilisateurs, alors s’affiche l’en-tête commune aux deux groupes', () => {
    // WHEN
    afficherMesUtilisateurs()

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
    // WHEN
    afficherMesUtilisateurs()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gestion de mes utilisateurs' })
    expect(titre).toBeInTheDocument()
    const rechercher = screen.getByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('placeholder', 'Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('type', 'search')
    const boutonRechercher = screen.getByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).toHaveAttribute('type', 'submit')
    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    expect(filtrer).toHaveAttribute('type', 'button')
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    expect(exporter).toHaveAttribute('type', 'button')
  })

  it('étant du groupe admin quand je recherche un utilisateur par son nom alors il s’affiche dans la liste', () => {
    // GIVEN
    const spiedRouterPush = vi.fn()
    afficherMesUtilisateurs(
      [utilisateurActifReadModel, utilisateurEnAttenteReadModel],
      {
        router: {
          push: spiedRouterPush,
        } as unknown as AppRouterInstance,
      }
    )

    // WHEN
    jeTapeUnNom('martin')
    jeRecherche()

    // THEN
    expect(spiedRouterPush).toHaveBeenCalledWith(expect.stringContaining('prenomOuNomOuEmail=martin'))
  })

  it('étant du groupe admin quand je réinitialise la recherche par nom ou adresse électronique alors les données affichées sont réinitialisées', () => {
    // GIVEN
    const spiedRouterPush = vi.fn()
    afficherMesUtilisateurs(
      [utilisateurActifReadModel, utilisateurEnAttenteReadModel],
      {
        router: {
          push: spiedRouterPush,
        } as unknown as AppRouterInstance,
      }
    )

    // WHEN
    jeTapeUnNom('martin')
    jeRecherche()
    jeReinitialiseLaRecherche()

    // THEN
    expect(spiedRouterPush).toHaveBeenCalledWith(expect.not.stringContaining('prenomOuNomOuEmail='))
  })

  it('étant du groupe admin quand le champ de recherche est vide alors l’icône de réinitialisation n’est pas affichée', () => {
    // WHEN
    afficherMesUtilisateurs()

    // THEN
    const rechercher = screen.getByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveValue('')
    const boutonReinitialiser = screen.queryByRole('button', { name: 'Reinitialiser' })
    expect(boutonReinitialiser).not.toBeInTheDocument()
  })

  it('étant du groupe gestionnaire quand j’affiche mes utilisateurs alors j’ai un autre titre et un sous titre', () => {
    // WHEN
    afficherMesUtilisateurs(
      [utilisateurActifReadModel, utilisateurEnAttenteReadModel],
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
    // WHEN
    afficherMesUtilisateurs([utilisateurActifReadModel, utilisateurEnAttenteReadModel])

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
    // WHEN
    afficherMesUtilisateurs([utilisateurEnAttenteReadModel])

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
    // WHEN
    afficherMesUtilisateurs()

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeDisabled()
  })

  it('sur la ligne d’un utilisateur quand j’affiche mes utilisateurs alors je peux le supprimer', () => {
    // WHEN
    afficherMesUtilisateurs()

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeEnabled()
  })

  it('quand je clique sur un utilisateur actif alors ses détails s’affichent dans un drawer', async () => {
    // GIVEN
    afficherMesUtilisateurs([utilisateurActifReadModel, utilisateurEnAttenteReadModel])

    // WHEN
    jOuvreLesDetailsDunUtilisateur('Martin Tartempion')

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

  it('quand je clique sur un utilisateur actif puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherMesUtilisateurs([utilisateurActifReadModel, utilisateurEnAttenteReadModel])

    // WHEN
    jOuvreLesDetailsDunUtilisateur('Martin Tartempion')
    const drawer = screen.getByRole('dialog', { name: 'Martin Tartempion' })
    jeFermeLesDetailsDunUtilisateur()

    // THEN
    expect(drawer).not.toBeVisible()
  })

  describe('quand je clique sur un utilisateur en attente alors s’affiche le drawer pour renvoyer une invitation', () => {
    it('contenant les informations d’invitation ainsi que le bouton pour réinviter l’utilisateur', async () => {
      // GIVEN
      afficherMesUtilisateurs([utilisateurActifReadModel, utilisateurEnAttenteReadModel])

      // WHEN
      jOuvreLesDetailsDunUtilisateur('Julien Deschamps')

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

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherMesUtilisateurs([utilisateurActifReadModel, utilisateurEnAttenteReadModel])

      // WHEN
      jOuvreLaReinvitation('Julien Deschamps')
      const drawer = screen.getByRole('dialog', { name: 'Invitation envoyée le 12/02/2024' })
      jeFermeLaReinvitation()

      // THEN
      expect(drawer).not.toBeVisible()
    })

    it('quand je clique sur le bouton "Renvoyer cette invitation" alors le drawer se ferme et il en est notifié', async () => {
      // GIVEN
      const reinviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherMesUtilisateurs([utilisateurEnAttenteReadModel], { pathname: '/mes-utilisateurs', reinviterUnUtilisateurAction })

      // WHEN
      jOuvreLesDetailsDunUtilisateur('Julien Deschamps')
      const drawer = screen.getByRole('dialog', { name: 'Invitation envoyée le 12/02/2024' })
      jeRenvoieLInvitation()

      // THEN
      await waitFor(() => {
        expect(reinviterUnUtilisateurAction).toHaveBeenCalledWith({ path: '/mes-utilisateurs', uidUtilisateurAReinviter: '123456' })
      })
      expect(drawer).not.toBeVisible()
      const notification = screen.getByRole('alert')
      expect(notification).toHaveTextContent('Invitation envoyée à julien.deschamps@example.com')
    })

    it('si l’invitation a été envoyée ajourd’hui alors le titre affiché est "Invitation envoyée aujourd’hui"', async () => {
      // GIVEN
      afficherMesUtilisateurs([utilisateurEnAttenteDAujourdhuiReadModel])

      // WHEN
      jOuvreLaReinvitation('Sebastien Palat')

      // THEN
      const drawerRenvoyerInvitation = await screen.findByRole('dialog', { name: 'Invitation envoyée aujourd’hui' })
      const titre = within(drawerRenvoyerInvitation).getByRole('heading', { level: 1, name: 'Invitation envoyée aujourd’hui' })
      expect(titre).toBeInTheDocument()
    })

    it('si l’invitation a été envoyée hier alors le titre affiché est "Invitation envoyée hier"', async () => {
      // GIVEN
      afficherMesUtilisateurs([utilisateurEnAttenteDHierReadModel])

      // WHEN
      jOuvreLaReinvitation('Stephane Raymond')

      // THEN
      const drawerRenvoyerInvitation = await screen.findByRole('dialog', { name: 'Invitation envoyée hier' })
      const titre = within(drawerRenvoyerInvitation).getByRole('heading', { level: 1, name: 'Invitation envoyée hier' })
      expect(titre).toBeInTheDocument()
    })
  })

  it('quand je clique sur un utilisateur sans téléphone alors ses détails s’affichent sans le téléphone dans un drawer', async () => {
    // GIVEN
    afficherMesUtilisateurs([utilisateurActifSansTelephoneVideReadModel])

    // WHEN
    jOuvreLesDetailsDunUtilisateur('Paul Provost')

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
      afficherMesUtilisateurs([utilisateurEnAttenteReadModel])

      // WHEN
      jOuvreLaSuppressionDUnUtilisateur()

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
      const supprimerUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherMesUtilisateurs(
        [utilisateurEnAttenteReadModel],
        { pathname: '/mes-utilisateurs', supprimerUnUtilisateurAction }
      )

      // WHEN
      jOuvreLaSuppressionDUnUtilisateur()
      jeSupprimeUnUtilisateur()

      // THEN
      const supprimerUnUtilisateurModalApresSuppression = await screen.findByRole('dialog')
      expect(supprimerUnUtilisateurModalApresSuppression).not.toBeVisible()
      expect(supprimerUnUtilisateurAction).toHaveBeenCalledWith({ path: '/mes-utilisateurs', uidUtilisateurASupprimer: '123456' })
    })

    it('je ferme la suppression', () => {
      // GIVEN
      afficherMesUtilisateurs([utilisateurEnAttenteReadModel])

      // WHEN
      jOuvreLaSuppressionDUnUtilisateur()
      const supprimerMonCompteModal = screen.getByRole('dialog', { name: 'Retirer Julien Deschamps de mon équipe d’utilisateurs ?' })
      jeFermeLaSuppressionDUnUtilisateur()

      // THEN
      expect(supprimerMonCompteModal).not.toBeVisible()
    })
  })

  it('quand j’affiche mes utilisateurs alors s’affiche la pagination', () => {
    // WHEN
    afficherMesUtilisateurs()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    expect(navigation).toBeInTheDocument()
  })

  it('quand j’affiche au plus 10 utilisateurs alors la pagination ne s’affiche pas', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([utilisateurActifReadModel, utilisateurEnAttenteReadModel], 'fooId', 10, rolesAvecStructure)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.queryByRole('navigation', { name: 'Pagination' })
    expect(navigation).not.toBeInTheDocument()
  })

  function jOuvreLesDetailsDunUtilisateur(name: string): void {
    presserLeBouton(name)
  }

  function jeFermeLesDetailsDunUtilisateur(): void {
    presserLeBouton('Fermer les détails')
  }

  function jOuvreLaReinvitation(name: string): void {
    presserLeBouton(name)
  }

  function jeRenvoieLInvitation(): void {
    presserLeBouton('Renvoyer cette invitation')
  }

  function jeFermeLaReinvitation(): void {
    presserLeBouton('Fermer la réinvitation')
  }

  function jOuvreLaSuppressionDUnUtilisateur(): void {
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    fireEvent.click(supprimer)
  }

  function jeSupprimeUnUtilisateur(): void {
    presserLeBouton('Confirmer')
  }

  function jeFermeLaSuppressionDUnUtilisateur(): void {
    presserLeBouton('Fermer')
  }

  function jeTapeUnNom(value: string): void {
    saisirLeTexte('Rechercher par nom ou adresse électronique', value)
  }

  function jeRecherche(): void {
    presserLeBouton('Rechercher')
  }

  function jeReinitialiseLaRecherche(): void {
    presserLeBouton('Reinitialiser')
  }
})

function afficherMesUtilisateurs(
  mesUtilisateursReadModel = [utilisateurActifReadModel, utilisateurEnAttenteReadModel],
  options?: Partial<Parameters<typeof renderComponent>[1]>
): void {
  const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, 'fooId', 11, rolesAvecStructure)
  renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, options)
}

function getByTable(): { columnsHead: ReadonlyArray<HTMLElement>; rowsBody: ReadonlyArray<HTMLElement> } {
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
