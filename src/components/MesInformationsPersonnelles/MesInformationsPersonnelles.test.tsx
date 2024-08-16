import { fireEvent, render, screen, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import MesInformationsPersonnelles from './MesInformationsPersonnelles'
import { matchWithoutMarkup } from '../../testHelper'
import { TypologieRole } from '@/domain/Role'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

describe('mes informations personnelles : en tant qu’utilisateur authentifié', () => {
  it('quand j’affiche mes informations personnelles alors elles s’affichent', () => {
    // GIVEN
    const mesInformationsPersonnellesViewModel =
      mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)

    // WHEN
    render(<MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />)

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
    const boutonSupprimerMonCompte = screen.getByRole('button', { name: 'Supprimer mon compte' })
    expect(boutonSupprimerMonCompte).toHaveAttribute('type', 'button')
  })

  it.each([
    {
      role: 'Administrateur dispositif' as TypologieRole,
    },
    {
      role: 'Gestionnaire département' as TypologieRole,
    },
    {
      role: 'Gestionnaire région' as TypologieRole,
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
  ])('étant un $role quand j’affiche mes informations personnelles alors l’encart "structure" ne s’affiche pas', ({ role }) => {
    // GIVEN
    const mesInformationsPersonnellesViewModel = mesInformationsPersonnellesPresenter({
      ...mesInformationsPersonnellesReadModel,
      role,
    })

    // WHEN
    render(<MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />)

    // THEN
    const maStructure = screen.queryByRole('region', { name: 'Ma structure' })
    expect(maStructure).not.toBeInTheDocument()
  })

  it.each([
    {
      role: 'Gestionnaire structure' as TypologieRole,
    },
    {
      role: 'Gestionnaire groupement' as TypologieRole,
    },
  ])('étant un $role quand j’affiche mes informations personnelles alors l’encart "structure" s’affiche', ({ role }) => {
    // GIVEN
    const mesInformationsPersonnellesViewModel = mesInformationsPersonnellesPresenter({
      ...mesInformationsPersonnellesReadModel,
      role,
    })

    // WHEN
    render(<MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />)

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
    const numeroDeSiretLabel = within(maStructure).getByText(matchWithoutMarkup('Numéro de SIRET'))
    expect(numeroDeSiretLabel).toBeInTheDocument()
    const abreviationSiret = within(numeroDeSiretLabel).getByText('SIRET', { selector: 'abbr' })
    expect(abreviationSiret).toHaveAttribute('title', 'Système d’Identification du Répertoire des ÉTablissements')
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
      const mesInformationsPersonnellesViewModel =
        mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
      render(
        <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
      )
      const supprimerMonCompteButton = screen.getByRole('button', { name: 'Supprimer mon compte' })

      // WHEN
      fireEvent.click(supprimerMonCompteButton)

      // THEN
      const supprimerMonCompteModal = screen.getByRole('dialog')
      expect(supprimerMonCompteModal).toBeVisible()

      const titre = within(supprimerMonCompteModal).getByRole('heading', { level: 1, name: 'Supprimer mon compte' })
      expect(titre).toBeInTheDocument()

      const avertissement = within(supprimerMonCompteModal)
        .getByText('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')
      expect(avertissement).toBeInTheDocument()

      const saisie = within(supprimerMonCompteModal)
        .getByLabelText('Saisissez « julien.deschamps@example.com » dans le champ ci-dessous')
      expect(saisie).toBeRequired()
      expect(saisie).toHaveAttribute('type', 'email')
      expect(saisie).toHaveAttribute('pattern', '.+@.+\\..{2,}')
      expect(saisie).toHaveAttribute('aria-describedby', 'supprimer-mon-compte-email-message-validation')

      const fermer = within(supprimerMonCompteModal).getByRole('button', { name: 'Fermer' })
      expect(fermer).toHaveAttribute('type', 'button')
      expect(fermer).toHaveAttribute('aria-controls', 'supprimer-mon-compte')

      const annuler = within(supprimerMonCompteModal).getByRole('button', { name: 'Annuler' })
      expect(annuler).toHaveAttribute('type', 'button')
      expect(annuler).toHaveAttribute('aria-controls', 'supprimer-mon-compte')

      const confirmer = within(supprimerMonCompteModal).getByRole('button', { name: 'Confirmer la suppression' })
      expect(confirmer).toHaveAttribute('type', 'submit')
      expect(confirmer).toHaveAttribute('formMethod', 'dialog')
      expect(confirmer).toBeDisabled()
    })

    it('je peux y renoncer en fermant la modale', () => {
      // GIVEN
      const mesInformationsPersonnellesViewModel =
        mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
      render(
        <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
      )
      fireEvent.click(supprimerMonCompteButton())
      const supprimerMonCompteModal = screen.getByRole('dialog')
      const fermer = within(supprimerMonCompteModal).getByRole('button', { name: 'Fermer' })

      // WHEN
      fireEvent.click(fermer)

      // THEN
      expect(supprimerMonCompteModal).not.toBeVisible()
    })

    describe('je ne peux supprimer mon compte, le bouton étant désactivé si', () => {
      it('je saisis une adresse email invalide', () => {
        // GIVEN
        const mesInformationsPersonnellesViewModel =
          mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
        render(
          <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
        )
        fireEvent.click(supprimerMonCompteButton())

        // WHEN
        fireEvent.input(saisirEmail(), { target: { value: 'julien.deschamps@' } })

        // THEN
        expect(confirmerSuppressionCompteButton()).toBeDisabled()
      })

      it('je saisis une adresse email valide mais qui n’est pas la mienne', () => {
        // GIVEN
        const mesInformationsPersonnellesViewModel =
          mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
        render(
          <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
        )
        fireEvent.click(supprimerMonCompteButton())

        // WHEN
        fireEvent.input(saisirEmail(), { target: { value: 'deschamps.julien@example.com' } })

        // THEN
        expect(confirmerSuppressionCompteButton()).toBeDisabled()
        const messageEmailKo = screen.getByText('L’adresse électronique saisie n’est pas reliée au compte utilisateur')
        expect(messageEmailKo).toBeInTheDocument()
      })
    })

    describe('je peux supprimer mon compte, le bouton de confirmation s’activant si', () => {
      it(
        'une fois que j’ai saisi mon adresse email (même avec des espaces en trop en début ou en fin de saisie)',
        () => {
          // GIVEN
          const mesInformationsPersonnellesViewModel =
            mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
          render(
            <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
          )
          fireEvent.click(supprimerMonCompteButton())

          // WHEN
          fireEvent.input(saisirEmail(), { target: { value: '  julien.deschamps@example.com  ' } })

          // THEN
          expect(confirmerSuppressionCompteButton()).not.toBeDisabled()
          const messageEmailOk = screen.getByText('L’adresse électronique saisie est valide')
          expect(messageEmailOk).toBeInTheDocument()
        }
      )

      it(
        `quand je confirme la suppression en cliquant sur le bouton devenu ainsi actif,
        il s’inactive et change de contenu, m’informant que la suppression est en cours,
        puis je suis déconnecté`,
        () => {
          // GIVEN
          const mesInformationsPersonnellesViewModel =
            mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)
          render(
            <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
          )
          fireEvent.click(supprimerMonCompteButton())
          fireEvent.input(saisirEmail(), { target: { value: 'julien.deschamps@example.com' } })
          vi.spyOn(nextAuth, 'signOut').mockResolvedValueOnce({ url: '' })

          // WHEN
          fireEvent.click(confirmerSuppressionCompteButton())

          // THEN
          const boutonConfirmationDesactive = screen.getByRole('button', { name: 'Suppression en cours' })
          expect(boutonConfirmationDesactive).toBeDisabled()
          expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: '/connexion' })
        }
      )
    })

    function supprimerMonCompteButton(): HTMLElement {
      return screen.getByRole('button', { name: 'Supprimer mon compte' })
    }

    function confirmerSuppressionCompteButton(): HTMLElement {
      return screen.getByRole('button', { name: 'Confirmer la suppression' })
    }

    function saisirEmail(): HTMLElement {
      return screen.getByLabelText('Saisissez « julien.deschamps@example.com » dans le champ ci-dessous')
    }
  })
})

const mesInformationsPersonnellesReadModel = {
  contactEmail: 'manon.verminac@example.com',
  contactFonction: 'Chargée de mission',
  contactNom: 'Verninac',
  contactPrenom: 'Manon',
  informationsPersonnellesEmail: 'julien.deschamps@example.com',
  informationsPersonnellesNom: 'Deschamps',
  informationsPersonnellesPrenom: 'Julien',
  informationsPersonnellesTelephone: '0405060708',
  role: 'Administrateur dispositif' as TypologieRole,
  structureAdresse: '201 bis rue de la plaine, 69000 Lyon',
  structureNumeroDeSiret: '62520260000023',
  structureRaisonSociale: 'Préfecture du Rhône',
  structureTypeDeStructure: 'Administration',
}
