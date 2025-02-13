import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import MesUtilisateurs from './MesUtilisateurs'
import { renderComponent, matchWithoutMarkup, structuresFetch, rolesAvecStructure, stubbedConceal, presserLeBouton, saisirLeTexte, selectionnerLElement } from '@/components/testHelper'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('inviter un utilisateur', () => {
  it('en tant qu’administrateur, quand je clique sur le bouton inviter, alors le drawer s’ouvre avec tous les rôles sélectionnables', async () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()

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

  it('en tant qu’utilisateur, quand je clique sur inviter un utilisateur puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = jOuvreLeFormulaireDInvitation()
    const fermer = jeFermeLeFormulairePourInviterUnUtilisateur()

    // THEN
    expect(fermer).toHaveAttribute('aria-controls', 'drawer-invitation')
    expect(drawer).not.toBeVisible()
  })

  it('en tant qu’administrateur, quand je clique sur un rôle à inviter, alors le champ d’organisation s’affiche', () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    jeSelectionneUnGestionnaireDepartement()

    // THEN
    const organisation = screen.getByLabelText('Département *')
    expect(organisation).toBeRequired()
    expect(organisation).toHaveAttribute('type', 'text')
  })

  it('en tant qu’administrateur, quand je cherche un département qui n’existe pas, alors un libellé me le signifie', async () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    jeSelectionneUnGestionnaireDepartement()
    jeSelectionneUnDepartementInexistant()

    // THEN
    const pasDeResulat = await screen.findByText('Pas de résultat')
    expect(pasDeResulat).toBeInTheDocument()
  })

  it('en tant qu’administrateur, quand je fais une recherche dans le champ de structure, alors je peux y faire une recherche utilisée dans le formulaire', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
    vi.stubGlobal('dsfr', stubbedConceal())
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    afficherMesUtilisateurs({
      inviterUnUtilisateurAction,
      pathname: '/mes-utilisateurs',
    })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    jeTapeSonNom('Tartempion')
    jeTapeSonPrenom('Martin')
    jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnGestionnaireStructure()
    const structure = jeTapeSaStructure('ABC')
    await jeSelectionneSaStructure(structure, 'ABC FORMATION')
    jEnvoieLInvitation()

    // THEN
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/structures?search=ABC')
    })
  })

  it('en tant qu’administrateur, quand je fais une recherche de moins de 3 caractères dans le champ de structure, alors il ne se passe rien', async () => {
    // GIVEN
    vi.stubGlobal('fetch', vi.fn(() => ({ json: async (): Promise<ReadonlyArray<{
      nom: string
      uid: string
    }>> => Promise.resolve([]) })))
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    jeSelectionneUnGestionnaireStructure()
    jeTapeSaStructure('AB')

    // THEN
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  it('en tant que gestionnaire département, quand je clique sur le bouton inviter, alors le drawer s’ouvre avec le rôle gestionnaire département sélectionné', async () => {
    // GIVEN
    afficherMesUtilisateurs({
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

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()

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

  it('quand je remplis correctement le formulaire et avec une nouvelle adresse électronique, alors le drawer se ferme, une notification s’affiche et le formulaire est réinitialisé', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['OK']))
    vi.stubGlobal('dsfr', stubbedConceal())
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    afficherMesUtilisateurs({ inviterUnUtilisateurAction, pathname: '/mes-utilisateurs' })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawerInvitation = jOuvreLeFormulaireDInvitation()
    const roleRadios = screen.getAllByRole('radio')
    const nom = jeTapeSonNom('Tartempion')
    const prenom = jeTapeSonPrenom('Martin')
    const email = jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnGestionnaireStructure()
    const structure = jeTapeSaStructure('ABC')
    await jeSelectionneSaStructure(structure, 'ABC FORMATION')
    const envoyerInvitation = jEnvoieLInvitation()

    // THEN
    expect(envoyerInvitation).toHaveAccessibleName('Envois en cours...')
    expect(envoyerInvitation).toBeDisabled()
    expect(inviterUnUtilisateurAction).toHaveBeenCalledWith({
      codeOrganisation: '5001',
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      path: '/mes-utilisateurs',
      prenom: 'Martin',
      role: 'Gestionnaire structure',
    })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Invitation envoyée à martin.tartempion@example.com')
    expect(drawerInvitation).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    expect(envoyerInvitation).toHaveAccessibleName('Envoyer l’invitation')
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
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawerInvitation = jOuvreLeFormulaireDInvitation()
    const roleRadios = screen.getAllByRole('radio')
    const nom = jeTapeSonNom('Tartempion')
    const prenom = jeTapeSonPrenom('Martin')
    const email = jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnGestionnaireDepartement()
    await jeSelectionneSonDepartement('Ain')
    jEnvoieLInvitation()
    const messageDErreur = await screen.findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    jEnvoieLInvitation()

    // THEN
    expect(messageDErreur).toHaveAttribute('id', 'text-input-error-desc-error')
    const absenceMessageDErreur = await screen.findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceMessageDErreur).not.toBeInTheDocument()
    const notification = await screen.findByRole('alert')
    expect(notification).toHaveTextContent('Invitation envoyée à martin.tartempion@example.com')
    expect(drawerInvitation).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    Object.values(roleGestionnaireLabelSelectionMapping).forEach((labelChampSelection) => {
      const champSelection = within(drawerInvitation).queryByLabelText(`${labelChampSelection} *`)
      expect(champSelection).not.toBeInTheDocument()
    })
  })

  it('quand je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    vi.stubGlobal('dsfr', stubbedConceal())
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    jeTapeSonNom('Tartempion')
    jeTapeSonPrenom('Martin')
    jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnAdministrateur()
    jEnvoieLInvitation()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire et avec un mail existant, alors il y a un message d’erreur', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['emailExistant']))
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawerInvitation = jOuvreLeFormulaireDInvitation()
    jeTapeSonNom('Tartempion')
    jeTapeSonPrenom('Martin')
    jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnAdministrateur()
    jEnvoieLInvitation()

    // THEN
    const erreurEmailDejaExistant = await within(drawerInvitation).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(erreurEmailDejaExistant).toBeInTheDocument()
    expect(drawerInvitation).toBeVisible()
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire mais que l’invitation ne peut pas se faire, alors le drawer se ferme', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = vi.fn(async () => Promise.resolve(['utilisateurNePeutPasGererUtilisateurACreer']))
    vi.stubGlobal('dsfr', stubbedConceal())
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawerInvitation = jOuvreLeFormulaireDInvitation()
    const roleRadios = within(drawerInvitation).getAllByRole('radio')
    const nom = jeTapeSonNom('Tartempion')
    const prenom = jeTapeSonPrenom('Martin')
    const email = jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnAdministrateur()
    jEnvoieLInvitation()

    // THEN
    const absenceDeMessageDErreur = within(drawerInvitation).queryByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceDeMessageDErreur).not.toBeInTheDocument()
    await waitFor(() => {
      expect(drawerInvitation).not.toBeVisible()
    })
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
  })

  function jOuvreLeFormulairePourInviterUnUtilisateur(): void {
    presserLeBouton('Inviter une personne')
  }

  function jeFermeLeFormulairePourInviterUnUtilisateur(): HTMLElement {
    return presserLeBouton('Fermer l’invitation')
  }

  function jeTapeSonNom(value: string): HTMLElement {
    return saisirLeTexte('Nom *', value)
  }

  function jeTapeSonPrenom(value: string): HTMLElement {
    return saisirLeTexte('Prénom *', value)
  }

  function jeTapeSonAdresseElectronique(value: string): HTMLElement {
    return saisirLeTexte(/Adresse électronique/, value)
  }

  function jeSelectionneUnAdministrateur(): void {
    fireEvent.click(within(jOuvreLeFormulaireDInvitation()).getByLabelText('Administrateur dispositif'))
  }

  function jeSelectionneUnGestionnaireDepartement(): void {
    fireEvent.click(within(jOuvreLeFormulaireDInvitation()).getByLabelText('Gestionnaire département'))
  }

  function jeSelectionneUnGestionnaireStructure(): void {
    fireEvent.click(within(jOuvreLeFormulaireDInvitation()).getByLabelText('Gestionnaire structure'))
  }

  function jeTapeSaStructure(value: string): HTMLElement {
    return saisirLeTexte('Structure *', value)
  }

  async function jeSelectionneSaStructure(input: HTMLElement, nomStructure: string): Promise<void> {
    await selectionnerLElement(input, nomStructure)
  }

  async function jeSelectionneSonDepartement(departement: string): Promise<void> {
    await selectionnerLElement(screen.getByLabelText('Département *'), departement)
  }

  function jeSelectionneUnDepartementInexistant(): void {
    saisirLeTexte('Département *', 'departementInexistant')
  }

  function jEnvoieLInvitation(): HTMLElement {
    return presserLeBouton('Envoyer l’invitation')
  }

  function jOuvreLeFormulaireDInvitation(): HTMLElement {
    return screen.getByRole('dialog', { name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
  }

  function afficherMesUtilisateurs(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const mesUtilisateursViewModel = mesUtilisateursPresenter([], 'fooId', 11, rolesAvecStructure, epochTime)
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
      ...options,
    })
  }
})
