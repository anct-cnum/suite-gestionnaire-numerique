import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { select } from 'react-select-event'

import MesUtilisateurs from './MesUtilisateurs'
import { renderComponent, matchWithoutMarkup, structuresFetch, rolesAvecStructure, stubbedConceal } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('inviter un utilisateur', () => {
  const totalUtilisateur = 11

  it('en tant qu’administrateur, quand je clique sur le bouton inviter, alors le drawer s’ouvre avec tous les rôles sélectionnables', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: true,
          libelle: 'Rhône',
          nom: 'Administrateur dispositif',
          pictogramme: 'maille',
          rolesGerables: [
            'Administrateur dispositif',
            'Gestionnaire département',
            'Gestionnaire groupement',
            'Gestionnaire région',
            'Gestionnaire structure',
            'Instructeur',
            'Pilote politique publique',
            'Support animation',
          ],
        },
      }),
    })
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })

    // WHEN
    fireEvent.click(inviter)

    // THEN
    const drawerInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const titre = await within(drawerInvitation).findByRole('heading', { level: 1, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    expect(titre).toBeInTheDocument()

    const champsObligatoires = within(drawerInvitation).getByText(
      matchWithoutMarkup('Les champs avec * sont obligatoires.'),
      { selector: 'p' }
    )
    expect(champsObligatoires).toBeInTheDocument()

    const formulaireInvitation = screen.getByRole('form', { name: 'Inviter un utilisateur' })
    expect(formulaireInvitation).toHaveAttribute('method', 'dialog')
    const nom = within(formulaireInvitation).getByLabelText('Nom *')
    expect(nom).toBeRequired()
    expect(nom).toHaveAttribute('name', 'nom')
    expect(nom).toHaveAttribute('type', 'text')

    const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
    expect(prenom).toBeRequired()
    expect(prenom).toHaveAttribute('name', 'prenom')
    expect(prenom).toHaveAttribute('type', 'text')

    const email = within(formulaireInvitation).getByLabelText('Adresse électronique *Une invitation lui sera envoyée par e-mail')
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('name', 'email')
    expect(email).toHaveAttribute('pattern', '^\\S+@\\S+\\.\\S+$')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('aria-describedby', 'text-input-error-desc-error')

    const fieldset = within(formulaireInvitation).getByRole('group')
    const roleQuestion = within(fieldset).getByText(
      matchWithoutMarkup('Quel rôle souhaitez-vous lui attribuer ? *'),
      { selector: 'legend' }
    )
    expect(roleQuestion).toBeInTheDocument()

    const administrateurDispositif = within(fieldset).getByLabelText('Administrateur dispositif')
    expect(administrateurDispositif).toBeRequired()
    expect(administrateurDispositif).toHaveAttribute('name', 'attributionRole')
    expect(administrateurDispositif).toHaveAttribute('id', 'Administrateur dispositif')

    const gestionnaireRegion = within(fieldset).getByLabelText('Gestionnaire région')
    expect(gestionnaireRegion).toBeRequired()
    expect(gestionnaireRegion).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireRegion).toHaveAttribute('id', 'Gestionnaire région')

    const gestionnaireDepartement = within(fieldset).getByLabelText('Gestionnaire département')
    expect(gestionnaireDepartement).toBeRequired()
    expect(gestionnaireDepartement).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireDepartement).toHaveAttribute('id', 'Gestionnaire département')

    const gestionnaireGroupement = within(fieldset).getByLabelText('Gestionnaire groupement')
    expect(gestionnaireGroupement).toBeRequired()
    expect(gestionnaireGroupement).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireGroupement).toHaveAttribute('id', 'Gestionnaire groupement')

    const gestionnaireStructure = within(fieldset).getByLabelText('Gestionnaire structure')
    expect(gestionnaireStructure).toBeRequired()
    expect(gestionnaireStructure).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireStructure).toHaveAttribute('id', 'Gestionnaire structure')

    const instructeur = within(fieldset).getByLabelText('Instructeur')
    expect(instructeur).toBeRequired()
    expect(instructeur).toHaveAttribute('name', 'attributionRole')
    expect(instructeur).toHaveAttribute('id', 'Instructeur')

    const pilotePolitiquePublique = within(fieldset).getByLabelText('Pilote politique publique')
    expect(pilotePolitiquePublique).toBeRequired()
    expect(pilotePolitiquePublique).toHaveAttribute('name', 'attributionRole')
    expect(pilotePolitiquePublique).toHaveAttribute('id', 'Pilote politique publique')

    const supportAnimation = within(fieldset).getByLabelText('Support animation')
    expect(supportAnimation).toBeRequired()
    expect(supportAnimation).toHaveAttribute('name', 'attributionRole')
    expect(supportAnimation).toHaveAttribute('id', 'Support animation')

    const envoyerInvitation = within(formulaireInvitation).getByRole('button', { name: 'Envoyer l’invitation' })
    expect(envoyerInvitation).toHaveAttribute('type', 'submit')
    expect(envoyerInvitation).toBeEnabled()
  })

  it('en tant qu’administrateur, quand je clique sur un rôle à inviter, alors le champ d’organisation s’affiche', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: true,
          libelle: 'Rhône',
          nom: 'Administrateur dispositif',
          pictogramme: 'maille',
          rolesGerables: [
            'Administrateur dispositif',
            'Gestionnaire département',
            'Gestionnaire groupement',
            'Gestionnaire région',
            'Gestionnaire structure',
            'Instructeur',
            'Pilote politique publique',
            'Support animation',
          ],
        },
      }),
    })
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
    fireEvent.click(inviter)

    // WHEN
    const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const gestionnaireDepartement = within(formulaireInvitation).getByLabelText('Gestionnaire département')
    fireEvent.click(gestionnaireDepartement)

    // THEN
    const organisation = within(formulaireInvitation).getByLabelText('Département *')
    expect(organisation).toBeRequired()
    expect(organisation).toHaveAttribute('type', 'text')
  })

  it('en tant qu’administrateur, quand je cherche un département qui n’existe pas, alors un libellé me le signifie', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: true,
          libelle: 'Rhône',
          nom: 'Administrateur dispositif',
          pictogramme: 'maille',
          rolesGerables: [
            'Administrateur dispositif',
            'Gestionnaire département',
            'Gestionnaire groupement',
            'Gestionnaire région',
            'Gestionnaire structure',
            'Instructeur',
            'Pilote politique publique',
            'Support animation',
          ],
        },
      }),
    })
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
    fireEvent.click(inviter)
    const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const gestionnaireDepartement = within(formulaireInvitation).getByLabelText('Gestionnaire département')
    fireEvent.click(gestionnaireDepartement)

    // WHEN
    const organisation = within(formulaireInvitation).getByLabelText('Département *')
    fireEvent.change(organisation, { target: { value: 'departementInexistant' } })

    // THEN
    const pasDeResulat = await screen.findByText('Pas de résultat')
    expect(pasDeResulat).toBeInTheDocument()
  })

  it('en tant qu’administrateur, quand je fais une recherche dans le champ de structure, alors je peux y faire une recherche utilisée dans le formulaire', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
    vi.stubGlobal('dsfr', stubbedConceal())
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      inviterUnUtilisateurAction,
      pathname: '/mes-utilisateurs',
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: true,
          libelle: 'Rhône',
          nom: 'Administrateur dispositif',
          pictogramme: 'maille',
          rolesGerables: [
            'Administrateur dispositif',
            'Gestionnaire département',
            'Gestionnaire groupement',
            'Gestionnaire région',
            'Gestionnaire structure',
            'Instructeur',
            'Pilote politique publique',
            'Support animation',
          ],
        },
      }),
    })
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
    fireEvent.click(inviter)
    const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const nom = within(formulaireInvitation).getByLabelText('Nom *')
    fireEvent.change(nom, { target: { value: 'Tartempion' } })
    const prenom = within(formulaireInvitation).getByLabelText('Prénom *')
    fireEvent.change(prenom, { target: { value: 'Martin' } })
    const email = within(formulaireInvitation).getByLabelText(/Adresse électronique/)
    fireEvent.change(email, { target: { value: 'martin.tartempion@example.com' } })
    const gestionnaireStructure = within(formulaireInvitation).getByLabelText('Gestionnaire structure')
    fireEvent.click(gestionnaireStructure)

    // WHEN
    const structure = within(formulaireInvitation).getByLabelText('Structure *')
    fireEvent.change(structure, { target: { value: 'ABC' } })
    await select(structure, 'ABC FORMATION')
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)

    // THEN
    await waitFor(() => {
      expect(inviterUnUtilisateurAction).toHaveBeenCalledWith({
        codeOrganisation: '5001',
        email: 'martin.tartempion@example.com',
        nom: 'Tartempion',
        path: '/mes-utilisateurs',
        prenom: 'Martin',
        role: 'Gestionnaire structure',
      })
    })
    expect(fetch).toHaveBeenCalledWith('/api/structures?search=ABC')
  })

  it('en tant qu’administrateur, quand je fais une recherche de moins de 3 caractères dans le champ de structure, alors il ne se passe rien', async () => {
    // GIVEN
    vi.stubGlobal('fetch', vi.fn(() => ({ json: async (): Promise<ReadonlyArray<{
        nom: string
        uid: string
      }>> => Promise.resolve([]) })))
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: true,
          libelle: 'Rhône',
          nom: 'Administrateur dispositif',
          pictogramme: 'maille',
          rolesGerables: [
            'Administrateur dispositif',
            'Gestionnaire département',
            'Gestionnaire groupement',
            'Gestionnaire région',
            'Gestionnaire structure',
            'Instructeur',
            'Pilote politique publique',
            'Support animation',
          ],
        },
      }),
    })

    // WHEN
    const inviter = screen.getByRole('button', { name: 'Inviter une personne' })
    fireEvent.click(inviter)
    const formulaireInvitation = screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const gestionnaireStructure = within(formulaireInvitation).getByLabelText('Gestionnaire structure')
    fireEvent.click(gestionnaireStructure)
    const structure = screen.getByLabelText('Structure *')
    fireEvent.change(structure, { target: { value: 'AB' } })

    // THEN
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  it('en tant que gestionnaire département, quand je clique sur le bouton inviter, alors le drawer s’ouvre avec tous le rôle gestionnaire département sélectionné', async () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        role: {
          doesItBelongToGroupeAdmin: false,
          libelle: 'Rhône',
          nom: 'Gestionnaire département',
          pictogramme: 'maille',
          rolesGerables: ['Gestionnaire département'],
        },
      }),
    })
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

    const email = within(formulaireInvitation).getByLabelText('Adresse électronique *Une invitation lui sera envoyée par e-mail')
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('name', 'email')
    expect(email).toHaveAttribute('pattern', '^\\S+@\\S+\\.\\S+$')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('aria-describedby', 'text-input-error-desc-error')

    const roleQuestion = within(formulaireInvitation).getByText(
      matchWithoutMarkup('Rôle attribué à cet utilisateur :'),
      { selector: 'p' }
    )
    expect(roleQuestion).toBeInTheDocument()

    const role = within(formulaireInvitation).getByText(
      matchWithoutMarkup('Gestionnaire département'),
      { selector: 'p' }
    )
    expect(role).toBeInTheDocument()

    const envoyerInvitation = within(formulaireInvitation).getByRole('button', { name: 'Envoyer l’invitation' })
    expect(envoyerInvitation).toHaveAttribute('type', 'submit')
    expect(envoyerInvitation).toBeEnabled()
  })

  it('quand je remplis correctement le formulaire et avec un nouveau mail, alors un message de validation s’affiche et le drawer est réinitialisé', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
    vi.stubGlobal('dsfr', stubbedConceal())
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
        inviterUnUtilisateurAction,
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          role: {
            doesItBelongToGroupeAdmin: true,
            libelle: 'Rhône',
            nom: 'Administrateur dispositif',
            pictogramme: 'maille',
            rolesGerables: [
              'Administrateur dispositif',
              'Gestionnaire département',
              'Gestionnaire groupement',
              'Gestionnaire région',
              'Gestionnaire structure',
              'Instructeur',
              'Pilote politique publique',
              'Support animation',
            ],
          },
        }),
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
    const administrateurDispositif = within(formulaireInvitation).getByLabelText('Administrateur dispositif')
    fireEvent.click(administrateurDispositif)
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)

    // THEN
    expect(envoyerInvitation).toBeDisabled()
    const notification = await screen.findByRole('alert')
    expect(notification).toHaveTextContent('Invitation envoyée à martin.tartempion@example.com')
    expect(formulaireInvitation).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    expect(envoyerInvitation).toBeEnabled()
  })

  it('quand je remplis avec un e-mail déjà existant puis avec un e-mail inexistant le formulaire d’invitation, alors un message d’invalidation puis de validation s’affiche et le drawer est réinitialisé', async () => {
    // GIVEN
    const roleGestionnaireLabelSelectionMapping = {
      'Gestionnaire département': 'Département',
      'Gestionnaire groupement': 'Groupement',
      'Gestionnaire région': 'Région',
      'Gestionnaire structure': 'Structure',
    }
    const inviterUnUtilisateurAction = vi.fn()
      .mockResolvedValueOnce(['emailExistant'])
      .mockResolvedValueOnce(['OK'])
    vi.stubGlobal('dsfr', stubbedConceal())
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />, {
        inviterUnUtilisateurAction,
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          role: {
            doesItBelongToGroupeAdmin: true,
            libelle: 'Rhône',
            nom: 'Administrateur dispositif',
            pictogramme: 'maille',
            rolesGerables: [
              'Administrateur dispositif',
              'Gestionnaire département',
              'Gestionnaire groupement',
              'Gestionnaire région',
              'Gestionnaire structure',
              'Instructeur',
              'Pilote politique publique',
              'Support animation',
            ],
          },
        }),
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
    const gestionnaireRole = within(formulaireInvitation).getByLabelText('Gestionnaire département')
    fireEvent.click(gestionnaireRole)
    const departementSelect = within(formulaireInvitation).getByLabelText('Département *')
    expect(departementSelect).toBeInTheDocument()
    await select(departementSelect, 'Ain')
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)
    const messageDErreur = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    fireEvent.click(envoyerInvitation)

    // THEN
    expect(messageDErreur).toBeInTheDocument()
    const absenceMessageDErreur = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceMessageDErreur).not.toBeInTheDocument()
    const notification = await screen.findByRole('alert')
    expect(notification).toHaveTextContent('Invitation envoyée à martin.tartempion@example.com')
    expect(formulaireInvitation).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    Object.values(roleGestionnaireLabelSelectionMapping).forEach((labelChampSelection) => {
      const champSelection = within(formulaireInvitation).queryByLabelText(`${labelChampSelection} *`)
      expect(champSelection).not.toBeInTheDocument()
    })
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire et avec un mail existant, alors il y a un message d’erreur', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['emailExistant']))
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
      {
        inviterUnUtilisateurAction,
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          role: {
            doesItBelongToGroupeAdmin: true,
            libelle: 'Rhône',
            nom: 'Administrateur dispositif',
            pictogramme: 'maille',
            rolesGerables: [
              'Administrateur dispositif',
              'Gestionnaire département',
              'Gestionnaire groupement',
              'Gestionnaire région',
              'Gestionnaire structure',
              'Instructeur',
              'Pilote politique publique',
              'Support animation',
            ],
          },
        }),
      }
    )
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
    const administrateurDispositif = within(formulaireInvitation).getByLabelText('Administrateur dispositif')
    fireEvent.click(administrateurDispositif)
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)

    // THEN
    const erreurEmailDejaExistant = await within(formulaireInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(erreurEmailDejaExistant).toBeInTheDocument()
    expect(formulaireInvitation).toBeVisible()
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire mais que l’invitation ne peut pas se faire, alors le drawer se ferme', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['utilisateurNePeutPasGererUtilisateurACreer']))
    vi.stubGlobal('dsfr', stubbedConceal())
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', totalUtilisateur, rolesAvecStructure)
    renderComponent(
      <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />,
      {
        inviterUnUtilisateurAction,
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          role: {
            doesItBelongToGroupeAdmin: true,
            libelle: 'Rhône',
            nom: 'Administrateur dispositif',
            pictogramme: 'maille',
            rolesGerables: [
              'Administrateur dispositif',
              'Gestionnaire département',
              'Gestionnaire groupement',
              'Gestionnaire région',
              'Gestionnaire structure',
              'Instructeur',
              'Pilote politique publique',
              'Support animation',
            ],
          },
        }),
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
    const administrateurDispositif = within(formulaireInvitation).getByLabelText('Administrateur dispositif')
    fireEvent.click(administrateurDispositif)
    const envoyerInvitation = await within(formulaireInvitation).findByRole('button', { name: 'Envoyer l’invitation' })
    fireEvent.click(envoyerInvitation)

    // THEN
    const absenceDeMessageDErreur = within(formulaireInvitation).queryByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceDeMessageDErreur).not.toBeInTheDocument()
    const formulaireInvitationApresInvitationEnEchec = await screen.findByRole(
      'dialog',
      { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' }
    )
    expect(formulaireInvitationApresInvitationEnEchec).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
  })
})
