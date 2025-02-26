import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, presserLeBouton, renderComponent } from '../testHelper'
import GestionMembres from './GestionMembres'
import { membresPresenter } from '@/presenters/membresPresenter'
import { membresReadModelFactory } from '@/use-cases/testHelper'

describe('membres gouvernance', () => {
  it('quand j’affiche les membres de la gouvernance, alors s’affiche le bouton pour ajouter un membre', () => {
    // WHEN
    afficherMembres()

    // THEN
    const ajouterUnMembre = screen.getByRole('button', { name: 'Ajouter un membre' })
    expect(ajouterUnMembre).toHaveAttribute('type', 'button')
  })

  describe('quand j’ouvre le formulaire pour ajouter un membre', () => {
    it('alors s’affiche la sélection de candidats et de membres suggérés rangés par ordre alphabétique', () => {
      // GIVEN
      afficherMembres()

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      expect(drawer).toBeVisible()

      const titre = within(drawer).getByRole('heading', { level: 1, name: 'Ajouter un membre à la gouvernance' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(drawer).getByText('Sélectionnez une collectivité ou une structure parmi la liste des volontaires.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()

      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter un membre à la gouvernance' })
      expect(formulaire).toHaveAttribute('method', 'dialog')
      const fieldset = within(formulaire).getByRole('group', { name: 'Sélectionner un membre' })
      const candidatOuSuggere = within(fieldset).getByRole('combobox', { name: 'Membre candidat ou suggéré' })
      const selectionnerUnMembre = within(candidatOuSuggere).getByRole('option', { name: 'Sélectionner un membre', selected: true })
      expect(selectionnerUnMembre).toBeInTheDocument()
      const croixRouge = within(candidatOuSuggere).getByRole('option', { name: 'Croix Rouge Française' })
      expect(croixRouge).toBeInTheDocument()
      const laPoste = within(candidatOuSuggere).getByRole('option', { name: "La Voie du Num'" })
      expect(laPoste).toBeInTheDocument()

      const information = within(fieldset).getByText(matchWithoutMarkup('Vous ne trouvez pas une collectivité/structure dans la liste ? Afin de récupérer leurs informations de contact, invitez les collectivités et structures qui n’ont pas encore manifesté leur souhait de participer à compléter le formulaire disponible via ce lien : https://inclusion-numerique.anct.gouv.fr/gouvernance'), { selector: 'p' })
      expect(information).toBeInTheDocument()
      const lien = within(fieldset).getByRole('link', { name: 'https://inclusion-numerique.anct.gouv.fr/gouvernance' })
      expect(lien).toHaveAttribute('href', 'https://inclusion-numerique.anct.gouv.fr/gouvernance')
      expect(lien).toOpenInNewTab('Invitez les collectivités et structures')

      const bouton = within(formulaire).getByRole('button', { name: 'Ajouter' })
      expect(bouton).toBeDisabled()
      expect(bouton).toHaveAttribute('type', 'submit')
    })

    it('puis que je clique sur fermer alors la modale se ferme', () => {
      // GIVEN
      afficherMembres()

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      jeFermeLeFormulairePourAjouterUnMembre()

      // THEN
      expect(drawer).not.toBeVisible()
    })

    it('puis que je sélectionne un membre alors ses informations s’affichent en entier', () => {
      // GIVEN
      afficherMembres()

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      jeSelectionneUnCandidat('structure-79227291600034-69')

      // THEN
      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter un membre à la gouvernance' })
      const information = within(formulaire).queryByText(matchWithoutMarkup('Vous ne trouvez pas une collectivité/structure dans la liste ? Afin de récupérer leurs informations de contact, invitez les collectivités et structures qui n’ont pas encore manifesté leur souhait de participer à compléter le formulaire disponible via ce lien : https://inclusion-numerique.anct.gouv.fr/gouvernance'), { selector: 'p' })
      expect(information).not.toBeInTheDocument()

      const informationsMembre = within(formulaire).getAllByRole('group')[1]
      const statut = within(informationsMembre).getByText('candidat', { selector: 'p' })
      expect(statut).toBeInTheDocument()
      const siretLabel = within(informationsMembre).getByText(matchWithoutMarkup('Numéro SIRET/RIDET'))
      expect(siretLabel).toBeInTheDocument()
      const abreviationSiret = within(siretLabel).getByText('SIRET', { selector: 'abbr' })
      expect(abreviationSiret).toHaveAttribute('title', 'Système d’Identification du Répertoire des ÉTablissements')
      const abreviationRidet = within(siretLabel).getByText('RIDET', { selector: 'abbr' })
      expect(abreviationRidet).toHaveAttribute('title', 'Répertoire d’Identification des Entreprises et des ÉTablissements')
      const siretValue = within(informationsMembre).getByRole('link', { name: '79227291600034' })
      expect(siretValue).toHaveAttribute('href', 'https://annuaire-entreprises.data.gouv.fr/etablissement/79227291600034')
      expect(siretValue).toOpenInNewTab('Fiche Emmaüs Connect')
      const typologieLabel = within(informationsMembre).getByText('Typologie')
      expect(typologieLabel).toBeInTheDocument()
      const typologieValue = within(informationsMembre).getByText('Association')
      expect(typologieValue).toBeInTheDocument()
      const adresseLabel = within(informationsMembre).getByText('Adresse')
      expect(adresseLabel).toBeInTheDocument()
      const adresseValue = within(informationsMembre).getByText('71 rue Archereau, 75019 PARIS')
      expect(adresseValue).toBeInTheDocument()
      const contactLabel = within(informationsMembre).getByText('Contact référent')
      expect(contactLabel).toBeInTheDocument()
      const contactValue = within(informationsMembre).getByText('Ninon Poulin, Médiatrice ninon.poulin@example.net')
      expect(contactValue).toBeInTheDocument()

      const bouton = within(formulaire).getByRole('button', { name: 'Ajouter' })
      expect(bouton).toBeEnabled()
    })

    it('puis que je sélectionne un membre alors ses informations s’affichent sans la typologie qui est optionnelle', () => {
      // GIVEN
      afficherMembres()

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      jeSelectionneUnCandidat('structure-77978721700057-69')

      // THEN
      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter un membre à la gouvernance' })
      const informationsMembre = within(formulaire).getAllByRole('group')[1]
      const donneesNonFournies = within(informationsMembre).getAllByText('Donnée non fournie')
      expect(donneesNonFournies).toHaveLength(1)
    })

    it('que je sélectionne un membre puis que je le désélectionne alors les informations de base s’affichent', () => {
      // GIVEN
      afficherMembres()

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      jeSelectionneUnCandidat('structure-99229991601034')
      jeSelectionneUnCandidat('')

      // THEN
      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter un membre à la gouvernance' })
      const information = within(formulaire).getByText(matchWithoutMarkup('Vous ne trouvez pas une collectivité/structure dans la liste ? Afin de récupérer leurs informations de contact, invitez les collectivités et structures qui n’ont pas encore manifesté leur souhait de participer à compléter le formulaire disponible via ce lien : https://inclusion-numerique.anct.gouv.fr/gouvernance'), { selector: 'p' })
      expect(information).toBeInTheDocument()
      const bouton = within(formulaire).getByRole('button', { name: 'Ajouter' })
      expect(bouton).toBeDisabled()
    })

    it('puis que je sélectionne un membre et je le valide, alors le drawer se ferme, le formulaire est réinitialisé, une notification s’affiche et les membres sont mis à jour', async () => {
      // GIVEN
      const accepterUnMembreAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherMembres({ accepterUnMembreAction, pathname: '/membres/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un membre à la gouvernance' })
      const selectionnerUnMembre = screen.getByRole<HTMLOptionElement>('option', { name: 'Sélectionner un membre' })

      jeSelectionneUnCandidat('structure-79227291600034-69')
      const ajouter = jAjouteUnMembre()

      // THEN
      expect(ajouter).toHaveAccessibleName('Ajout en cours...')
      expect(ajouter).toBeDisabled()
      expect(accepterUnMembreAction).toHaveBeenCalledWith({
        path: '/membres/11',
        uidGouvernance: '69',
        uidMembrePotentiel: 'structure-79227291600034-69',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Membre ajouté')
      expect(drawer).not.toBeVisible()
      expect(selectionnerUnMembre.selected).toBe(true)
      expect(ajouter).toHaveAccessibleName('Ajouter')
      expect(ajouter).toBeDisabled()
    })

    it('quand je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const accepterUnMembreAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
      afficherMembres({ accepterUnMembreAction })

      // WHEN
      jOuvreLeFormulairePourAjouterUnMembre()
      jeSelectionneUnCandidat('structure-79227291600034-69')
      jAjouteUnMembre()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })
  })

  function jOuvreLeFormulairePourAjouterUnMembre(): void {
    presserLeBouton('Ajouter un membre')
  }

  function jeFermeLeFormulairePourAjouterUnMembre(): void {
    presserLeBouton('Fermer l’ajout d’un membre')
  }

  function jeSelectionneUnCandidat(value: string): void {
    fireEvent.change(screen.getByRole('combobox', { name: 'Membre candidat ou suggéré' }), { target: { value } })
  }

  function jAjouteUnMembre(): HTMLElement {
    return presserLeBouton('Ajouter')
  }
})

function afficherMembres(
  options: Partial<Parameters<typeof renderComponent>[1]> = {},
  membresReadModel = membresReadModelFactory()
): void {
  const membresViewModel = membresPresenter(membresReadModel)
  renderComponent(
    <GestionMembres membresViewModel={membresViewModel} />,
    options
  )
}
