import { fireEvent, screen, within } from '@testing-library/react'
import * as navigation from 'next/navigation'

import MesUtilisateurs from './MesUtilisateurs'
import * as inviterAction from '@/app/api/actions/inviterUnUtilisateurAction'
import * as supprimerAction from '@/app/api/actions/supprimerUnUtilisateurAction'
import { renderComponent, clientContextProviderDefaultValue, spiedNextNavigation, matchWithoutMarkup } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'

describe('mes utilisateurs', () => {
  const totalUtilisateur = 11

  it('quand j’affiche mes utilisateurs alors s’affiche l’en-tête', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

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

  it('faisant partie du groupe admin quand j’affiche mes utilisateurs alors je peux rechercher un utilisateur, filtrer et exporter la liste', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      ...clientContextProviderDefaultValue,
      sessionUtilisateurViewModel: {
        ...clientContextProviderDefaultValue.sessionUtilisateurViewModel,
        role: {
          groupe: 'admin',
          libelle: '',
          nom: 'Support animation',
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

  it('faisant partie du groupe gestionnaire quand j’affiche mes utilisateurs alors j’ai juste un sous titre', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

    // WHEN
    renderComponent(
      <MesUtilisateurs
        mesUtilisateursViewModel={mesUtilisateursViewModel}
      />,
      {
        ...clientContextProviderDefaultValue,
        sessionUtilisateurViewModel: {
          ...clientContextProviderDefaultValue.sessionUtilisateurViewModel,
          role: {
            groupe: 'gestionnaire',
            libelle: 'Rhône',
            nom: 'Gestionnaire groupement',
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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeEnabled()
  })

  it('quand je clique sur un utilisateur alors ses détails s’affichent dans un drawer', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const rowPremierUtilisateur = screen.getByRole('button', { name: 'Martin Tartempion' })

    // WHEN
    fireEvent.click(rowPremierUtilisateur)

    // THEN
    const drawerDetailsUtilisateur = await screen.findByRole('dialog', { name: 'Martin Tartempion' })
    const prenomEtNom = within(drawerDetailsUtilisateur).getByRole('heading', { level: 1, name: 'Martin Tartempion' })
    expect(prenomEtNom).toBeInTheDocument()
    const roleAttribueLabel = within(drawerDetailsUtilisateur).getByText('Rôle attribué')
    expect(roleAttribueLabel).toBeInTheDocument()
    const roleAttribue = within(drawerDetailsUtilisateur).getByText('Administrateur dispositif')
    expect(roleAttribue).toBeInTheDocument()

    const emailLabel = within(drawerDetailsUtilisateur).getByText('Adresse éléctronique')
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

  it('quand je clique sur un utilisateur sans téléphone alors ses détails s’affichent sans le téléphone dans un drawer', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const rowDeuxiemeUtilisateur = screen.getByRole('button', { name: 'Julien Deschamps' })

    // WHEN
    fireEvent.click(rowDeuxiemeUtilisateur)

    // THEN
    const drawerDetailsUtilisateur = await screen.findByRole('dialog', { name: 'Julien Deschamps' })
    const prenomEtNom = within(drawerDetailsUtilisateur).getByRole('heading', { level: 1, name: 'Julien Deschamps' })
    expect(prenomEtNom).toBeInTheDocument()
    const roleAttribueLabel = within(drawerDetailsUtilisateur).getByText('Rôle attribué')
    expect(roleAttribueLabel).toBeInTheDocument()
    const roleAttribue = within(drawerDetailsUtilisateur).getByText('Gestionnaire structure')
    expect(roleAttribue).toBeInTheDocument()

    const emailLabel = within(drawerDetailsUtilisateur).getByText('Adresse éléctronique')
    expect(emailLabel).toBeInTheDocument()
    const email = within(drawerDetailsUtilisateur).getByText('julien.deschamps@example.com')
    expect(email).toBeInTheDocument()

    const telephoneLabel = within(drawerDetailsUtilisateur).getByText('Téléphone professionnel')
    expect(telephoneLabel).toBeInTheDocument()
    const telephone = within(drawerDetailsUtilisateur).getByText('Non renseigné')
    expect(telephone).toBeInTheDocument()

    const derniereConnexionLabel = within(drawerDetailsUtilisateur).getByText('Dernière connexion')
    expect(derniereConnexionLabel).toBeInTheDocument()
    const derniereConnexion = within(drawerDetailsUtilisateur).getByText('invité le 12/02/2024')
    expect(derniereConnexion).toBeInTheDocument()

    const structureLabel = within(drawerDetailsUtilisateur).getByText('Structure ou collectivité')
    expect(structureLabel).toBeInTheDocument()
    const structure = within(drawerDetailsUtilisateur).getByText('Hub du Rhône')
    expect(structure).toBeInTheDocument()
  })

  describe('quand j’escompte supprimer un utilisateur', () => {
    it('je clique sur le bouton de suppression, une modale de confirmation apparaît', () => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
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
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
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
      vi.spyOn(supprimerAction, 'supprimerUnUtilisateurAction').mockResolvedValueOnce('OK')
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    expect(navigation).toBeInTheDocument()
  })

  it('quand j’affiche au plus 10 utilisateurs alors la pagination ne s’affiche pas', () => {
    // GIVEN
    const totalUtilisateur = 10
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.queryByRole('navigation', { name: 'Pagination' })
    expect(navigation).not.toBeInTheDocument()
  })

  it('quand je clique sur le bouton pour filtrer alors les filtres apparaissent', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
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
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
      { ...clientContextProviderDefaultValue, searchParams: new URLSearchParams('utilisateursActives=on&roles=gestionnaire_groupement,instructeur') }
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
    vi.spyOn(navigation, 'useRouter').mockReturnValueOnce(spiedNextNavigation.useRouter)
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
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
      vi.spyOn(navigation, 'useRouter').mockReturnValueOnce(spiedNextNavigation.useRouter)
      afficherLesFiltres()
      const filtres = screen.getByRole('dialog', { name: 'Filtrer' })
      const utilisateursActives = within(filtres).getByLabelText('Uniquement les utilisateurs activés')
      fireEvent.click(utilisateursActives)

      // WHEN
      const boutonAfficher = within(filtres).getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?utilisateursActives=on')
    })

    it('sur certains rôles alors je n’affiche qu’eux', () => {
      // GIVEN
      vi.spyOn(navigation, 'useRouter').mockReturnValueOnce(spiedNextNavigation.useRouter)
      afficherLesFiltres()
      const filtres = screen.getByRole('dialog', { name: 'Filtrer' })
      const gestionnaireRegion = within(filtres).getByLabelText('Gestionnaire région')
      fireEvent.click(gestionnaireRegion)
      const gestionnaireDepartement = within(filtres).getByLabelText('Gestionnaire département')
      fireEvent.click(gestionnaireDepartement)

      // WHEN
      const boutonAfficher = within(filtres).getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?roles=administrateur_dispositif%2Cgestionnaire_groupement%2Cgestionnaire_structure%2Cinstructeur%2Cpilote_politique_publique%2Csupport_animation')
    })

    it('sur un département alors je n’affiche qu’eux', () => {
      // GIVEN
      vi.spyOn(navigation, 'useRouter').mockReturnValueOnce(spiedNextNavigation.useRouter)
      const container = afficherLesFiltres()

      // @ts-expect-error
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      container.querySelector<HTMLInputElement>('input[type="hidden"]').value = '00_978'

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeDepartement=978')
    })

    it('sur une région alors je n’affiche qu’eux', () => {
      // GIVEN
      vi.spyOn(navigation, 'useRouter').mockReturnValueOnce(spiedNextNavigation.useRouter)
      const container = afficherLesFiltres()
      // @ts-expect-error
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      container.querySelector<HTMLInputElement>('input[type="hidden"]').value = '93_00'

      // WHEN
      const boutonAfficher = screen.getByRole('button', { name: 'Afficher les utilisateurs' })
      fireEvent.click(boutonAfficher)

      // THEN
      expect(spiedNextNavigation.useRouter.push).toHaveBeenCalledWith('http://example.com/mes-utilisateurs?codeRegion=93')
    })

    function afficherLesFiltres() {
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
      const { container } = renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

      const filtrer = screen.getByRole('button', { name: 'Filtrer' })
      fireEvent.click(filtrer)

      return container
    }
  })

  describe('quand j’invite un utilisateur', () => {
    it('quand je clique sur le bouton inviter, alors le drawer s’ouvre', async () => {
      // GIVEN
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const inviter = screen.getByRole('button', { name: 'Inviter une personne' })

      // WHEN
      fireEvent.click(inviter)

      // THEN
      const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
      const titre = await within(formulaireInvitation).findByRole('heading', { level: 1, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
      expect(titre).toBeInTheDocument()

      const champsObligatoires = within(formulaireInvitation).getByText(
        matchWithoutMarkup('Les champs avec * sont obligatoires.'),
        { selector: 'p' }
      )
      expect(champsObligatoires).toBeInTheDocument()

      const nom = within(formulaireInvitation).getByLabelText('Nom *')
      expect(nom).toBeRequired()
      expect(nom).toHaveAttribute('name', 'nom')
      expect(nom).toHaveAttribute('type', 'text')

      const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
      expect(prenom).toBeRequired()
      expect(prenom).toHaveAttribute('name', 'prenom')
      expect(prenom).toHaveAttribute('type', 'text')

      const email = within(formulaireInvitation).getByLabelText('Adresse électronique *')
      expect(email).toBeRequired()
      expect(email).toHaveAttribute('name', 'email')
      expect(email).toHaveAttribute('pattern', '.+@.+\\..{2,}')
      expect(email).toHaveAttribute('type', 'email')

      const roleQuestion = within(formulaireInvitation).getByText(
        matchWithoutMarkup('Quel rôle souhaitez-vous lui attribuer ? *'),
        { selector: 'legend' }
      )
      expect(roleQuestion).toBeInTheDocument()

      const gestionnaireRegion = within(formulaireInvitation).getByLabelText('Gestionnaire région')
      expect(gestionnaireRegion).toBeRequired()
      expect(gestionnaireRegion).toHaveAttribute('name', 'attributionRole')
      expect(gestionnaireRegion).toHaveAttribute('id', 'Gestionnaire région')

      const gestionnaireDepartement = within(formulaireInvitation).getByLabelText('Gestionnaire département')
      expect(gestionnaireDepartement).toBeRequired()
      expect(gestionnaireDepartement).toHaveAttribute('name', 'attributionRole')
      expect(gestionnaireDepartement).toHaveAttribute('id', 'Gestionnaire département')

      const gestionnaireGroupement = within(formulaireInvitation).getByLabelText('Gestionnaire groupement')
      expect(gestionnaireGroupement).toBeRequired()
      expect(gestionnaireGroupement).toHaveAttribute('name', 'attributionRole')
      expect(gestionnaireGroupement).toHaveAttribute('id', 'Gestionnaire groupement')

      const gestionnaireStructure = within(formulaireInvitation).getByLabelText('Gestionnaire structure')
      expect(gestionnaireStructure).toBeRequired()
      expect(gestionnaireStructure).toHaveAttribute('name', 'attributionRole')
      expect(gestionnaireStructure).toHaveAttribute('id', 'Gestionnaire structure')

      const structure = within(formulaireInvitation).getByLabelText('Structure *')
      expect(structure).toBeRequired()
      expect(structure).toHaveAttribute('name', 'structure')
      expect(structure).toHaveAttribute('type', 'text')

      const envoyerInvitation = within(formulaireInvitation).getByRole('button', { name: 'Envoyer l’invitation' })
      expect(envoyerInvitation).toHaveAttribute('type', 'submit')
    })

    it('dans le drawer d’invitation, quand je remplis correctement le formulaire et avec un nouveau mail, alors un message de validation s’affiche', async () => {
      // GIVEN
      vi.spyOn(inviterAction, 'inviterUnUtilisateurAction')
        .mockResolvedValueOnce('emailExistant')
        .mockResolvedValueOnce('OK')
      const windowDsfr = window.dsfr
      window.dsfr = () => {
        return {
          modal: {
            conceal: vi.fn(),
          },
        }
      }
      const setBandeauInformations = vi.fn()
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
      renderComponent(
        <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
        {
          ...clientContextProviderDefaultValue,
          setBandeauInformations,
        }
      )
      const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
      fireEvent.click(inviter)
      const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
      const roleRadios = within(formulaireInvitation).getAllByRole('radio')

      // WHEN
      const nom = within(formulaireInvitation).getByLabelText('Nom *')
      fireEvent.change(nom, { target: { value: 'Tartempion' } })
      const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
      fireEvent.change(prenom, { target: { value: 'Martin' } })
      const email = within(formulaireInvitation).getByLabelText(/Adresse électronique/)
      fireEvent.change(email, { target: { value: 'martin.tartempion@example.com' } })
      const structure = within(formulaireInvitation).getByLabelText('Structure *')
      fireEvent.change(structure, { target: { value: 'La Poste' } })
      const gestionnaireRegion = within(formulaireInvitation).getByLabelText('Gestionnaire région')
      fireEvent.click(gestionnaireRegion)
      const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
      fireEvent.click(envoyerInvitation)
      const messageDErreur = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
      fireEvent.click(envoyerInvitation)

      // THEN
      expect(messageDErreur).toBeInTheDocument()
      const absenceMessageDErreur = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
      expect(absenceMessageDErreur).not.toBeInTheDocument()
      expect(setBandeauInformations).toHaveBeenCalledWith({
        description: 'martin.tartempion@example.com',
        titre: 'Invitation envoyée à ',
      })
      expect(formulaireInvitation).not.toHaveAttribute('open', '')
      expect(nom).toHaveValue('')
      expect(prenom).toHaveValue('')
      expect(email).toHaveValue('')
      expect(structure).toHaveValue('')
      roleRadios.forEach((roleRadio) => {
        expect(roleRadio).not.toBeChecked()
      })
      window.dsfr = windowDsfr
    })

    it('dans le drawer d’invitation, quand je remplis correctement le formulaire et avec un mail existant, alors il y a un message d’erreur', async () => {
      // GIVEN
      vi.spyOn(inviterAction, 'inviterUnUtilisateurAction').mockResolvedValueOnce('emailExistant')
      const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
      renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
      const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
      fireEvent.click(inviter)
      const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })

      // WHEN
      const nom = within(formulaireInvitation).getByLabelText('Nom *')
      fireEvent.change(nom, { target: { value: 'Tartempion' } })
      const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
      fireEvent.change(prenom, { target: { value: 'Martin' } })
      const email = within(formulaireInvitation).getByLabelText(/Adresse électronique/)
      fireEvent.change(email, { target: { value: 'martin.tartempion@example.com' } })
      const structure = within(formulaireInvitation).getByLabelText('Structure *')
      fireEvent.change(structure, { target: { value: 'La Poste' } })
      const gestionnaireRegion = within(formulaireInvitation).getByLabelText('Gestionnaire région')
      fireEvent.click(gestionnaireRegion)
      const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
      fireEvent.click(envoyerInvitation)

      // THEN
      const erreurEmailDejaExistant = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
      expect(erreurEmailDejaExistant).toBeInTheDocument()
      expect(formulaireInvitation).toHaveAttribute('open', '')
    })
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire mais que l’invitation ne peut pas se faire, alors le drawer se ferme', async () => {
    // GIVEN
    vi.spyOn(inviterAction, 'inviterUnUtilisateurAction').mockResolvedValueOnce('KO')
    const windowDsfr = window.dsfr
    window.dsfr = () => {
      return {
        modal: {
          conceal: vi.fn(),
        },
      }
    }
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', totalUtilisateur)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
    fireEvent.click(inviter)
    const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const roleRadios = within(formulaireInvitation).getAllByRole('radio')

    // WHEN
    const nom = within(formulaireInvitation).getByLabelText('Nom *')
    fireEvent.change(nom, { target: { value: 'Tartempion' } })
    const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
    fireEvent.change(prenom, { target: { value: 'Martin' } })
    const email = within(formulaireInvitation).getByLabelText(/Adresse électronique/)
    fireEvent.change(email, { target: { value: 'martin.tartempion@example.com' } })
    const structure = within(formulaireInvitation).getByLabelText('Structure *')
    fireEvent.change(structure, { target: { value: 'La Poste' } })
    const gestionnaireRegion = within(formulaireInvitation).getByLabelText('Gestionnaire région')
    fireEvent.click(gestionnaireRegion)
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)

    // THEN
    const absenceDeMessageDErreur = within(formulaireInvitation).queryByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceDeMessageDErreur).not.toBeInTheDocument()
    const formulaireInvitationApresInvitationEnEchec = await screen.findByRole(
      'dialog',
      { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' }
    )
    expect(formulaireInvitationApresInvitationEnEchec).not.toHaveAttribute('open', '')
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    expect(structure).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    window.dsfr = windowDsfr
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

const mesUtilisateursReadModel = [
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
      organisation: 'Préfecture du Rhône',
    },
    structureId: null,
    telephone: '0102030405',
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
      organisation: 'Hub du Rhône',
    },
    structureId: 1,
    telephone: '',
    uid: '123456',
  },
]
