import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { select } from 'react-select-event'

import MesUtilisateurs from './MesUtilisateurs'
import { matchWithoutMarkup, renderComponent, rolesAvecStructure, structuresFetch, stubbedConceal, stubbedServerAction } from '@/components/testHelper'
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
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const titre = await within(drawer).findByRole('heading', { level: 1, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    expect(titre).toBeInTheDocument()

    const champsObligatoires = within(drawer).getByText(
      matchWithoutMarkup('Les champs avec * sont obligatoires.'),
      { selector: 'p' }
    )
    expect(champsObligatoires).toBeInTheDocument()

    const formulaireInvitation = screen.getByRole('form', { name: 'Inviter un utilisateur' })
    expect(formulaireInvitation).toHaveAttribute('method', 'dialog')
    const nom = within(formulaireInvitation).getByRole('textbox', { name: 'Nom *' })
    expect(nom).toBeRequired()
    expect(nom).toHaveAttribute('name', 'nom')
    expect(nom).toHaveAttribute('type', 'text')

    const prenom = within(formulaireInvitation).getByRole('textbox', { name: 'Prénom *' })
    expect(prenom).toBeRequired()
    expect(prenom).toHaveAttribute('name', 'prenom')
    expect(prenom).toHaveAttribute('type', 'text')

    const email = within(formulaireInvitation).getByRole('textbox', { name: 'Adresse électronique * Une invitation lui sera envoyée par e-mail' })
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

    const administrateurDispositif = within(fieldset).getByRole('radio', { checked: false, name: 'Administrateur dispositif' })
    expect(administrateurDispositif).toBeRequired()
    expect(administrateurDispositif).toHaveAttribute('name', 'attributionRole')
    expect(administrateurDispositif).toHaveAttribute('id', 'Administrateur dispositif')

    const gestionnaireRegion = within(fieldset).getByRole('radio', { checked: false, name: 'Gestionnaire région' })
    expect(gestionnaireRegion).toBeRequired()
    expect(gestionnaireRegion).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireRegion).toHaveAttribute('id', 'Gestionnaire région')

    const gestionnaireDepartement = within(fieldset).getByRole('radio', { checked: false, name: 'Gestionnaire département' })
    expect(gestionnaireDepartement).toBeRequired()
    expect(gestionnaireDepartement).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireDepartement).toHaveAttribute('id', 'Gestionnaire département')

    const gestionnaireGroupement = within(fieldset).getByRole('radio', { checked: false, name: 'Gestionnaire groupement' })
    expect(gestionnaireGroupement).toBeRequired()
    expect(gestionnaireGroupement).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireGroupement).toHaveAttribute('id', 'Gestionnaire groupement')

    const gestionnaireStructure = within(fieldset).getByRole('radio', { checked: false, name: 'Gestionnaire structure' })
    expect(gestionnaireStructure).toBeRequired()
    expect(gestionnaireStructure).toHaveAttribute('name', 'attributionRole')
    expect(gestionnaireStructure).toHaveAttribute('id', 'Gestionnaire structure')

    const envoyerInvitation = within(formulaireInvitation).getByRole('button', { name: 'Envoyer l’invitation' })
    expect(envoyerInvitation).toHaveAttribute('type', 'submit')
    expect(envoyerInvitation).toBeEnabled()
  })

  it('en tant qu’utilisateur, quand je clique sur inviter un utilisateur puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherMesUtilisateurs()

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = drawerDuFormulaireDInvitation()
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
    const inviterUnUtilisateurAction = stubbedServerAction(['OK'])
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
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    const titre = await within(drawer).findByRole('heading', { level: 1, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
    expect(titre).toBeInTheDocument()

    const champsObligatoires = within(drawer).getByText(
      matchWithoutMarkup('Les champs avec * sont obligatoires.'),
      { selector: 'p' }
    )
    expect(champsObligatoires).toBeInTheDocument()

    const nom = within(drawer).getByRole('textbox', { name: 'Nom *' })
    expect(nom).toBeRequired()
    expect(nom).toHaveAttribute('name', 'nom')
    expect(nom).toHaveAttribute('type', 'text')

    const prenom = within(drawer).getByRole('textbox', { name: 'Prénom *' })
    expect(prenom).toBeRequired()
    expect(prenom).toHaveAttribute('name', 'prenom')
    expect(prenom).toHaveAttribute('type', 'text')

    const email = within(drawer).getByRole('textbox', { name: 'Adresse électronique * Une invitation lui sera envoyée par e-mail' })
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('name', 'email')
    expect(email).toHaveAttribute('pattern', '^\\S+@\\S+\\.\\S+$')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('aria-describedby', 'text-input-error-desc-error')

    const roleQuestion = within(drawer).getByText(
      matchWithoutMarkup('Rôle attribué à cet utilisateur :'),
      { selector: 'p' }
    )
    expect(roleQuestion).toBeInTheDocument()

    const role = within(drawer).getByText(
      matchWithoutMarkup('Gestionnaire département'),
      { selector: 'p' }
    )
    expect(role).toBeInTheDocument()

    const envoyerInvitation = within(drawer).getByRole('button', { name: 'Envoyer l’invitation' })
    expect(envoyerInvitation).toHaveAttribute('type', 'submit')
    expect(envoyerInvitation).toBeEnabled()
  })

  it('quand je remplis correctement le formulaire et avec une nouvelle adresse électronique, alors le drawer se ferme, une notification s’affiche et le formulaire est réinitialisé', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = stubbedServerAction(['OK'])
    vi.stubGlobal('dsfr', stubbedConceal())
    vi.stubGlobal('fetch', vi.fn(structuresFetch))
    afficherMesUtilisateurs({ inviterUnUtilisateurAction, pathname: '/mes-utilisateurs' })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = drawerDuFormulaireDInvitation()
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
    expect(drawer).not.toBeVisible()
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
    const inviterUnUtilisateurAction = vi.fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['emailExistant'])
      .mockResolvedValueOnce(['OK'])
    vi.stubGlobal('dsfr', stubbedConceal())
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = drawerDuFormulaireDInvitation()
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
    expect(notification.textContent).toBe('Invitation envoyée à martin.tartempion@example.com')
    expect(drawer).not.toBeVisible()
    expect(nom).toHaveValue('')
    expect(prenom).toHaveValue('')
    expect(email).toHaveValue('')
    roleRadios.forEach((roleRadio) => {
      expect(roleRadio).not.toBeChecked()
    })
    Object.values(roleGestionnaireLabelSelectionMapping).forEach((labelChampSelection) => {
      const champSelection = within(drawer).queryByLabelText(`${labelChampSelection} *`)
      expect(champSelection).not.toBeInTheDocument()
    })
  })

  it('quand je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
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
    const inviterUnUtilisateurAction = stubbedServerAction(['emailExistant'])
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = drawerDuFormulaireDInvitation()
    jeTapeSonNom('Tartempion')
    jeTapeSonPrenom('Martin')
    jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnAdministrateur()
    jEnvoieLInvitation()

    // THEN
    const erreurEmailDejaExistant = await within(drawer).findByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(erreurEmailDejaExistant).toBeInTheDocument()
    expect(drawer).toBeVisible()
  })

  it('dans le drawer d’invitation, quand je remplis correctement le formulaire mais que l’invitation ne peut pas se faire, alors le drawer se ferme', async () => {
    // GIVEN
    const inviterUnUtilisateurAction = stubbedServerAction(['utilisateurNePeutPasGererUtilisateurACreer'])
    vi.stubGlobal('dsfr', stubbedConceal())
    afficherMesUtilisateurs({ inviterUnUtilisateurAction })

    // WHEN
    jOuvreLeFormulairePourInviterUnUtilisateur()
    const drawer = drawerDuFormulaireDInvitation()
    const roleRadios = within(drawer).getAllByRole('radio')
    const nom = jeTapeSonNom('Tartempion')
    const prenom = jeTapeSonPrenom('Martin')
    const email = jeTapeSonAdresseElectronique('martin.tartempion@example.com')
    jeSelectionneUnAdministrateur()
    jEnvoieLInvitation()

    // THEN
    const absenceDeMessageDErreur = within(drawer).queryByText('Cet utilisateur dispose déjà d’un compte', { selector: 'p' })
    expect(absenceDeMessageDErreur).not.toBeInTheDocument()
    await waitFor(() => {
      expect(drawer).not.toBeVisible()
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
    fireEvent.click(within(drawerDuFormulaireDInvitation()).getByRole('radio', { name: 'Administrateur dispositif' }))
  }

  function jeSelectionneUnGestionnaireDepartement(): void {
    fireEvent.click(within(drawerDuFormulaireDInvitation()).getByRole('radio', { name: 'Gestionnaire département' }))
  }

  function jeSelectionneUnGestionnaireStructure(): void {
    fireEvent.click(within(drawerDuFormulaireDInvitation()).getByRole('radio', { name: 'Gestionnaire structure' }))
  }

  function jeTapeSaStructure(value: string): HTMLElement {
    return saisirLeTexte('Structure *', value)
  }

  async function jeSelectionneSaStructure(input: HTMLElement, nomStructure: string): Promise<void> {
    await select(input, nomStructure)
  }

  async function jeSelectionneSonDepartement(departement: string): Promise<void> {
    await select(screen.getByLabelText('Département *'), departement)
  }

  function jeSelectionneUnDepartementInexistant(): void {
    saisirLeTexte('Département *', 'departementInexistant')
  }

  function jEnvoieLInvitation(): HTMLElement {
    return presserLeBouton('Envoyer l’invitation')
  }

  function drawerDuFormulaireDInvitation(): HTMLElement {
    return screen.getByRole('dialog', { hidden: false, name: 'Invitez un utilisateur à rejoindre l’espace de gestion' })
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
          ],
        },
      }),
      ...options,
    })
  }

  function saisirLeTexte(name: RegExp | string, value: string): HTMLElement {
    const input = screen.getByLabelText(name)
    fireEvent.change(input, { target: { value } })
    return input
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }
})
