import { fireEvent, screen, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import MesInformationsPersonnelles from './MesInformationsPersonnelles'
import { matchWithoutMarkup, renderComponent, stubbedConceal } from '@/components/testHelper'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'
import { mesInformationsPersonnellesReadModelFactory } from '@/use-cases/testHelper'

describe('mes informations personnelles : en tant qu’utilisateur authentifié', () => {
  it('quand j’affiche mes informations personnelles alors elles s’affichent', () => {
    // WHEN
    afficherMesInformationsPersonnelles()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Mes informations' })
    expect(titre).toBeInTheDocument()

    const sousTitre = screen.getByText('Retrouvez ici, les informations de votre compte.', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()

    const mesInformationsPersonnelles = screen.getByRole('region', { name: 'Mes informations personnelles' })
    const titreInfosPersos = within(mesInformationsPersonnelles).getByRole('heading', { level: 2, name: 'Mes informations personnelles' })
    expect(titreInfosPersos).toBeInTheDocument()
    const modifierMesInfosPersos = within(mesInformationsPersonnelles).getByRole('button', { name: 'Modifier' })
    expect(modifierMesInfosPersos).toHaveAttribute('type', 'button')
    const nomLabel = within(mesInformationsPersonnelles).getByText('Nom')
    expect(nomLabel).toBeInTheDocument()
    const nom = within(mesInformationsPersonnelles).getByText('Deschamps')
    expect(nom).toBeInTheDocument()
    const prenomLabel = within(mesInformationsPersonnelles).getByText('Prénom')
    expect(prenomLabel).toBeInTheDocument()
    const prenom = within(mesInformationsPersonnelles).getByText('Julien')
    expect(prenom).toBeInTheDocument()
    const emailLabel = within(mesInformationsPersonnelles).getByText('Adresse électronique')
    expect(emailLabel).toBeInTheDocument()
    const email = within(mesInformationsPersonnelles).getByText('julien.deschamps@example.com')
    expect(email).toBeInTheDocument()
    const telephoneLabel = within(mesInformationsPersonnelles).getByText('Téléphone professionnel')
    expect(telephoneLabel).toBeInTheDocument()
    const telephone = within(mesInformationsPersonnelles).getByText('04 05 06 07 08')
    expect(telephone).toBeInTheDocument()

    const monRole = screen.getByRole('region', { name: 'Mon rôle' })
    const titreMonRole = within(monRole).getByRole('heading', { level: 2, name: 'Mon rôle' })
    expect(titreMonRole).toBeInTheDocument()
    const sousTitreMonRole = screen.getByText(matchWithoutMarkup('Le rôle qui vous est attribué donne accès à des fonctionnalités et des droits spécifiques. Contacter le support pour le modifier.'), { selector: 'p' })
    const lienContacterLeSupport = within(sousTitreMonRole).getByRole('link', { name: 'Contacter le support' })
    expect(lienContacterLeSupport).toHaveAttribute('href', 'https://aide.conseiller-numerique.gouv.fr/fr/')
    expect(lienContacterLeSupport).toHaveAttribute('target', '_blank')
    expect(lienContacterLeSupport).toHaveAttribute('rel', 'external noopener noreferrer')
    const role = screen.getByText('Administrateur dispositif', { selector: 'p' })
    expect(role).toBeInTheDocument()

    const supprimerMonCompte = screen.getByRole('region', { name: 'Supprimer mon compte' })
    const titreSupprimerMonCompte = within(supprimerMonCompte).getByRole('heading', { level: 2, name: 'Supprimer mon compte' })
    expect(titreSupprimerMonCompte).toBeInTheDocument()
    const sousTitreSupprimerMonCompte = screen.getByText('En supprimant votre compte, vous n’aurez plus la possibilité d’accéder à cette plateforme.', { selector: 'p' })
    expect(sousTitreSupprimerMonCompte).toBeInTheDocument()
    const boutonSupprimerMonCompte = within(supprimerMonCompte).getByRole('button', { name: 'Supprimer mon compte' })
    expect(boutonSupprimerMonCompte).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche mes informations personnelles mais avec un téléphone non renseigné alors il s’affiche cette notion', () => {
    // WHEN
    afficherMesInformationsPersonnelles(mesInformationsPersonnellesReadModelFactory({ telephone: '' }))

    // THEN
    const mesInformationsPersonnelles = screen.getByRole('region', { name: 'Mes informations personnelles' })
    const telephone = within(mesInformationsPersonnelles).getByText('Non renseigné')
    expect(telephone).toBeInTheDocument()
  })

  it.each([
    'Administrateur dispositif',
    'Gestionnaire département',
    'Gestionnaire région',
    'Instructeur',
    'Pilote politique publique',
    'Support animation',
  ])('étant un %s quand j’affiche mes informations personnelles alors l’encart "structure" ne s’affiche pas', (role) => {
    // WHEN
    afficherMesInformationsPersonnelles(mesInformationsPersonnellesReadModelFactory({ role }))

    // THEN
    const maStructure = screen.queryByRole('region', { name: 'Ma structure' })
    expect(maStructure).not.toBeInTheDocument()
  })

  it.each([
    'Gestionnaire structure',
    'Gestionnaire groupement',
  ])('étant un %s quand j’affiche mes informations personnelles alors l’encart "structure" s’affiche', (role) => {
    // WHEN
    afficherMesInformationsPersonnelles(mesInformationsPersonnellesReadModelFactory({
      role,
      structure: {
        adresse: '201 bis rue de la plaine, 69000 Lyon',
        contact: {
          email: 'manon.verminac@example.com',
          fonction: 'Chargée de mission',
          nom: 'Verninac',
          prenom: 'Manon',
        },
        numeroDeSiret: '62520260000023',
        raisonSociale: 'Préfecture du Rhône',
        typeDeStructure: 'Administration',
      },
    }))

    // THEN
    const maStructure = screen.getByRole('region', { name: 'Ma structure' })
    const titreMaStructure = within(maStructure).getByRole('heading', { level: 2, name: 'Ma structure' })
    expect(titreMaStructure).toBeInTheDocument()
    const raisonSocialeLabel = within(maStructure).getByText('Raison sociale')
    expect(raisonSocialeLabel).toBeInTheDocument()
    const raisonSociale = within(maStructure).getByText('Préfecture du Rhône')
    expect(raisonSociale).toBeInTheDocument()
    const typeDeStructureLabel = within(maStructure).getByText('Type de structure')
    expect(typeDeStructureLabel).toBeInTheDocument()
    const typeDeStructure = within(maStructure).getByText('Administration')
    expect(typeDeStructure).toBeInTheDocument()
    const numeroDeSiretLabel = within(maStructure).getByText(matchWithoutMarkup('Numéro de SIRET/RIDET'))
    expect(numeroDeSiretLabel).toBeInTheDocument()
    const abreviationSiret = within(numeroDeSiretLabel).getByText('SIRET', { selector: 'abbr' })
    expect(abreviationSiret).toHaveAttribute('title', 'Système d’Identification du Répertoire des ÉTablissements')
    const abreviationRidet = within(numeroDeSiretLabel).getByText('RIDET', { selector: 'abbr' })
    expect(abreviationRidet).toHaveAttribute('title', 'Répertoire d’Identification des Entreprises et des ÉTablissements')
    const numeroDeSiret = within(maStructure).getByText('62520260000023')
    expect(numeroDeSiret).toBeInTheDocument()
    const adresseLabel = within(maStructure).getByText('Adresse')
    expect(adresseLabel).toBeInTheDocument()
    const adresse = within(maStructure).getByText('201 bis rue de la plaine, 69000 Lyon')
    expect(adresse).toBeInTheDocument()

    const contactStructure = within(maStructure).getByRole('heading', { level: 3, name: 'Contact principal de la structure' })
    expect(contactStructure).toBeInTheDocument()
    const nomDuContactLabel = within(maStructure).getByText('Nom')
    expect(nomDuContactLabel).toBeInTheDocument()
    const nomDuContact = within(maStructure).getByText('Verninac')
    expect(nomDuContact).toBeInTheDocument()
    const prenomDuContactLabel = within(maStructure).getByText('Prénom')
    expect(prenomDuContactLabel).toBeInTheDocument()
    const prenomDuContact = within(maStructure).getByText('Manon')
    expect(prenomDuContact).toBeInTheDocument()
    const fonctionDuContactLabel = within(maStructure).getByText('Fonction dans la structure')
    expect(fonctionDuContactLabel).toBeInTheDocument()
    const fonctionDuContact = within(maStructure).getByText('Chargée de mission')
    expect(fonctionDuContact).toBeInTheDocument()
    const emailDuContactLabel = within(maStructure).getByText('Adresse électronique')
    expect(emailDuContactLabel).toBeInTheDocument()
    const emailDuContact = within(maStructure).getByText('manon.verminac@example.com')
    expect(emailDuContact).toBeInTheDocument()
  })

  describe('quand je clique sur la suppression de compte alors la modale s’ouvre', () => {
    it('me présentant les instructions à suivre afin de supprimer mon compte', () => {
      // GIVEN
      afficherMesInformationsPersonnelles()

      // WHEN
      fireEvent.click(supprimerMonCompte())

      // THEN
      const modal = supprimerMonCompteModal()
      expect(modal).toBeVisible()

      const titre = within(modal).getByRole('heading', { level: 1, name: 'Supprimer mon compte' })
      expect(titre).toBeInTheDocument()

      const avertissement = within(modal)
        .getByText('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')
      expect(avertissement).toBeInTheDocument()

      const formulaire = within(modal).getByRole('form', { name: 'Supprimer' })
      const saisie = within(formulaire).getByLabelText('Saisissez « julien.deschamps@example.com » dans le champ ci-dessous')
      expect(saisie).toBeRequired()
      expect(saisie).toHaveAttribute('type', 'email')
      expect(saisie).toHaveAttribute('pattern', '.+@.+\\..{2,}')
      expect(saisie).toHaveAttribute('aria-describedby', 'supprimer-mon-compte-email-message-validation')

      const annuler = within(formulaire).getByRole('button', { name: 'Annuler' })
      expect(annuler).toHaveAttribute('type', 'reset')
      expect(annuler).toHaveAttribute('aria-controls', 'supprimer-mon-compte')

      const confirmer = within(formulaire).getByRole('button', { name: 'Confirmer la suppression' })
      expect(confirmer).toHaveAttribute('type', 'submit')
      expect(confirmer).toHaveAttribute('formMethod', 'dialog')
      expect(confirmer).toBeDisabled()
    })

    it('et que j’appuie sur annuler alors la modale se ferme', () => {
      // GIVEN
      afficherMesInformationsPersonnelles()
      fireEvent.click(supprimerMonCompte())

      // WHEN
      fireEvent.click(annulerLaSuppressionDeMonCompte())

      // THEN
      const supprimerMonCompteModal = screen.queryByRole('dialog', { name: 'Supprimer mon compte' })
      expect(supprimerMonCompteModal).not.toBeInTheDocument()
    })

    describe('je ne peux supprimer mon compte, le bouton étant désactivé si', () => {
      it('je saisis une adresse électronique invalide', () => {
        // GIVEN
        afficherMesInformationsPersonnelles()
        fireEvent.click(supprimerMonCompte())

        // WHEN
        fireEvent.input(saisirEmail(), { target: { value: 'julien.deschamps@' } })

        // THEN
        const messageEmailKo = screen.queryByText('L’adresse électronique saisie n’est pas reliée au compte utilisateur', { selector: 'p' })
        expect(messageEmailKo).not.toBeInTheDocument()
        expect(confirmerSuppressionCompte()).toBeDisabled()
      })

      it('je saisis une adresse électronique valide mais qui n’est pas la mienne', () => {
        // GIVEN
        afficherMesInformationsPersonnelles()
        fireEvent.click(supprimerMonCompte())

        // WHEN
        fireEvent.input(saisirEmail(), { target: { value: 'deschamps.julien@example.com' } })

        // THEN
        const messageEmailKo = screen.getByText('L’adresse électronique saisie n’est pas reliée au compte utilisateur', { selector: 'p' })
        expect(messageEmailKo).toBeInTheDocument()
        expect(confirmerSuppressionCompte()).toBeDisabled()
      })
    })

    it('et que j’appuie sur annuler alors qu’il y a un message en erreur ou pas, alors le formulaire est réinitialisé', () => {
      // GIVEN
      afficherMesInformationsPersonnelles()
      fireEvent.click(supprimerMonCompte())
      fireEvent.input(saisirEmail(), { target: { value: 'deschamps.julien@example.com' } })
      fireEvent.click(annulerLaSuppressionDeMonCompte())

      // WHEN
      fireEvent.click(supprimerMonCompte())

      // THEN
      const email = within(formulaire()).getByLabelText('Saisissez « julien.deschamps@example.com » dans le champ ci-dessous')
      expect(email).toHaveValue('')
      const messageEmailKo = screen.queryByText('L’adresse électronique saisie n’est pas reliée au compte utilisateur', { selector: 'p' })
      expect(messageEmailKo).not.toBeInTheDocument()
      expect(confirmerSuppressionCompte()).toBeDisabled()
    })

    describe('je peux supprimer mon compte, le bouton de confirmation s’activant si', () => {
      it('une fois que j’ai saisi mon adresse électronique (même avec des espaces en trop en début ou en fin de saisie)', () => {
        // GIVEN
        afficherMesInformationsPersonnelles()
        fireEvent.click(supprimerMonCompte())

        // WHEN
        fireEvent.input(saisirEmail(), { target: { value: '  julien.deschamps@example.com  ' } })

        // THEN
        expect(confirmerSuppressionCompte()).not.toBeDisabled()
        const messageEmailOk = screen.getByText('L’adresse électronique saisie est valide')
        expect(messageEmailOk).toBeInTheDocument()
      })

      it('quand je confirme la suppression en cliquant sur le bouton devenu ainsi actif, il s’inactive et change de contenu, m’informant que la suppression est en cours, puis je suis déconnecté', async () => {
        // GIVEN
        const supprimerMonCompteAction = vi.fn(async () => Promise.resolve(['OK']))
        vi.spyOn(nextAuth, 'signOut').mockResolvedValueOnce({ url: '' })
        const mesInformationsPersonnellesViewModel =
          mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModelFactory())
        renderComponent(
          <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />,
          { supprimerMonCompteAction }
        )
        fireEvent.click(supprimerMonCompte())
        fireEvent.input(saisirEmail(), { target: { value: 'julien.deschamps@example.com' } })

        // WHEN
        fireEvent.click(confirmerSuppressionCompte())

        // THEN
        const boutonConfirmationDesactive = await screen.findByRole('button', { name: 'Suppression en cours' })
        expect(boutonConfirmationDesactive).toBeDisabled()
        expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: '/connexion' })
        expect(supprimerMonCompteAction).toHaveBeenCalledWith()
      })
    })

    function supprimerMonCompte(): HTMLElement {
      return screen.getByRole('button', { name: 'Supprimer mon compte' })
    }

    function supprimerMonCompteModal(): HTMLElement {
      return screen.getByRole('dialog', { name: 'Supprimer mon compte' })
    }
    function formulaire(): HTMLElement {
      return screen.getByRole('form', { name: 'Supprimer' })
    }

    function saisirEmail(): HTMLElement {
      return screen.getByLabelText('Saisissez « julien.deschamps@example.com » dans le champ ci-dessous')
    }

    function confirmerSuppressionCompte(): HTMLElement {
      return screen.getByRole('button', { name: 'Confirmer la suppression' })
    }

    function annulerLaSuppressionDeMonCompte(): HTMLElement {
      return screen.getByRole('button', { name: 'Annuler' })
    }
  })

  describe('quand je clique sur modifier mes informations personnelles', () => {
    it('alors je vois le formulaire de modification prérempli', () => {
      // GIVEN
      afficherMesInformationsPersonnelles()

      // WHEN
      ouvrirDrawer()

      // THEN
      const modifierMesInfosPersosDrawer = screen.getByRole('dialog', { name: 'Mes informations personnelles' })
      expect(modifierMesInfosPersosDrawer).toBeVisible()

      const titre = within(modifierMesInfosPersosDrawer).getByRole('heading', { level: 1, name: 'Mes informations personnelles' })
      expect(titre).toHaveAttribute('id', 'drawer-modifier-mon-compte-titre')

      const champsObligatoires = within(modifierMesInfosPersosDrawer).getByText(matchWithoutMarkup('Les champs avec * sont obligatoires.'), { selector: 'p' })
      expect(champsObligatoires).toBeInTheDocument()

      const formulaire = within(modifierMesInfosPersosDrawer).getByRole('form', { name: 'Modifier' })
      expect(formulaire).toHaveAttribute('method', 'dialog')
      const nom = within(formulaire).getByLabelText('Nom *')
      expect(nom).toBeRequired()
      expect(nom).toHaveAttribute('name', 'nom')
      expect(nom).toHaveAttribute('type', 'text')
      expect(nom).toHaveValue('Deschamps')
      const prenom = within(formulaire).getByLabelText('Prénom *')
      expect(prenom).toBeRequired()
      expect(prenom).toHaveAttribute('name', 'prenom')
      expect(prenom).toHaveAttribute('type', 'text')
      expect(prenom).toHaveValue('Julien')
      const email = within(formulaire).getByLabelText('Adresse électronique * Seuls les gestionnaires verront votre adresse électronique.')
      expect(email).toBeRequired()
      expect(email).toHaveAttribute('name', 'email')
      expect(email).toHaveAttribute('pattern', '.+@.+\\..{2,}')
      expect(email).toHaveAttribute('type', 'email')
      expect(email).toHaveValue('julien.deschamps@example.com')
      const telephone = within(formulaire).getByLabelText('Téléphone professionnel Seuls les gestionnaires verront votre numéro de téléphone. Formats attendus : 0122334455 ou +33122334455')
      expect(telephone).toHaveAttribute('name', 'telephone')
      expect(telephone).toHaveAttribute('pattern', '^(\\+[\\d]{11,12}|[\\d]{10})$')
      expect(telephone).toHaveAttribute('type', 'tel')
      expect(telephone).not.toBeRequired()
      expect(telephone).toHaveValue('0405060708')

      const annuler = within(formulaire).getByRole('button', { name: 'Annuler' })
      expect(annuler).toHaveAttribute('type', 'reset')
      expect(annuler).toHaveAttribute('aria-controls', 'drawer-modifier-mon-compte')

      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
      expect(enregistrer).toHaveAttribute('type', 'submit')
    })

    it('alors le téléphone n’est pas rempli s’il est non renseigné', () => {
      // GIVEN
      afficherMesInformationsPersonnelles(mesInformationsPersonnellesReadModelFactory({ telephone: '' }))

      // WHEN
      ouvrirDrawer()

      // THEN
      const telephone = screen.getByLabelText('Téléphone professionnel Seuls les gestionnaires verront votre numéro de téléphone. Formats attendus : 0122334455 ou +33122334455')
      expect(telephone).toHaveValue('')
    })

    it('et que j’appuie sur annuler alors la modale se ferme', () => {
      // GIVEN
      afficherMesInformationsPersonnelles()
      ouvrirDrawer()

      // WHEN
      const annuler = screen.getByRole('button', { name: 'Annuler' })
      fireEvent.click(annuler)

      // THEN
      const modifierMesInfosPersosDrawer = screen.queryByRole('dialog', { name: 'Mes informations personnelles' })
      expect(modifierMesInfosPersosDrawer).not.toBeInTheDocument()
    })

    it('quand je modifie mes informations personnelles alors elles sont modifiées et le drawer est fermé', async () => {
      // GIVEN
      const modifierMesInformationsPersonnellesAction = vi.fn(async () => Promise.resolve(['OK']))
      vi.stubGlobal('dsfr', stubbedConceal())

      const mesInformationsPersonnellesViewModel =
        mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModelFactory())
      renderComponent(
        <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />,
        { modifierMesInformationsPersonnellesAction, pathname: '/mes-informations-personnelles' }
      )
      ouvrirDrawer()
      const nom = screen.getByLabelText('Nom *')
      fireEvent.change(nom, { target: { value: 'Tartempion' } })
      const prenom = screen.getByLabelText('Prénom *')
      fireEvent.change(prenom, { target: { value: 'Martin' } })
      const email = screen.getByLabelText(/Adresse électronique/)
      fireEvent.change(email, { target: { value: 'martin.tartempion@example.com' } })
      const telephone = screen.getByLabelText(/Téléphone professionnel/)
      fireEvent.change(telephone, { target: { value: '0102030405' } })

      // WHEN
      const enregistrer = screen.getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(enregistrer)

      // THEN
      const boutonModificationDesactive = screen.getByRole('button', { name: 'Modification en cours' })
      expect(boutonModificationDesactive).toBeDisabled()
      expect(modifierMesInformationsPersonnellesAction).toHaveBeenCalledWith({ emailDeContact: 'martin.tartempion@example.com', nom: 'Tartempion', path: '/mes-informations-personnelles', prenom: 'Martin', telephone: '0102030405' })
      const boutonModificationActive = await screen.findByRole('button', { name: 'Modification en cours' })
      expect(boutonModificationActive).toBeEnabled()
      const modifierMesInfosPersosDrawer = screen.queryByRole('dialog', { name: 'Mes informations personnelles' })
      expect(modifierMesInfosPersosDrawer).not.toBeInTheDocument()
    })

    function ouvrirDrawer(): void {
      const mesInformationsPersonnelles = screen.getByRole('region', { name: 'Mes informations personnelles' })
      const modifierMesInfosPersos = within(mesInformationsPersonnelles).getByRole('button', { name: 'Modifier' })
      fireEvent.click(modifierMesInfosPersos)
    }
  })
})

function afficherMesInformationsPersonnelles(
  mesInformationsPersonnellesReadModel = mesInformationsPersonnellesReadModelFactory()
): void {
  const mesInformationsPersonnellesViewModel =
    mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
  renderComponent(
    <MesInformationsPersonnelles
      mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel}
    />,
    { pathname: '/mes-informations-personnelles' }
  )
}
