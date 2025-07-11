'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { ContactPrincipal, NouveauMembreData } from './types'
import { clientContext } from '../shared/ClientContext'
import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import Search from '../shared/Search/Search'
import TextInput from '../shared/TextInput/TextInput'

// eslint-disable-next-line complexity
export default function EtapeSelectionMembre({ donneesMembre, onContinuer }: EtapeSelectionMembreProps): ReactElement {
  const { rechercherUneEntrepriseAction } = useContext(clientContext)
  const [siret, setSiret] = useState(donneesMembre?.entreprise?.identifiant ?? '')
  const [entreprise, setEntreprise] = useState<EntrepriseViewModel | null>(donneesMembre?.entreprise ?? null)
  const [erreurRechercheSiret, setErreurRechercheSiret] = useState('')
  const [contact, setContact] = useState<ContactPrincipal>(donneesMembre?.contact ?? { email: '', fonction: '', nom: '', prenom: '' })
  const [contactSecondaire, setContactSecondaire] = useState<ContactPrincipal>(donneesMembre?.contactSecondaire ?? { email: '', fonction: '', nom: '', prenom: '' })
  const [showContactSecondaire, setShowContactSecondaire] = useState(
    donneesMembre?.contactSecondaire !== null && donneesMembre?.contactSecondaire !== undefined
  )

  const isContactSecondaireValide = !showContactSecondaire || 
    contactSecondaire.nom.trim() !== '' &&
    contactSecondaire.prenom.trim() !== '' &&
    contactSecondaire.email.trim() !== '' &&
    contactSecondaire.fonction.trim() !== ''

  const isFormulairePret = entreprise !== null && 
    contact.nom.trim() !== '' && 
    contact.prenom.trim() !== '' && 
    contact.email.trim() !== '' && 
    contact.fonction.trim() !== '' &&
    isContactSecondaireValide

  return (
    <div>
      <div className="fr-card fr-mt-4w">   
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm color-grey fr-mb-3w">
              Les champs avec 
              {' '}
              <span className="color-red">
                *
              </span>
              {' '}
              sont obligatoires
            </p>
            {/* Structure */}
            <div className="fr-mb-4w">
              <h3 className="fr-h5 fr-mb-3w">
                Structure
              </h3>              
              <Search
                labelBouton="Rechercher"
                placeholder="Renseignez le Numéro SIRET ou RIDET *"
                rechercher={changerSiret}
                reinitialiserBouton="Effacer la recherche"
                reinitialiserLesTermesDeRechercheNomOuEmail={reinitialiserSiret}
                soumettreLaRecherche={soumettreRechercheSiret}
                termesDeRechercheNomOuEmail={formaterNumero(siret)}
              />
              <p className="color-grey fr-mb-1w">
                Format attendu : SIRET (14 chiffres) ou RIDET (6 ou 7 chiffres)
              </p>

              {erreurRechercheSiret ? 
                <div className="fr-alert fr-alert--error fr-mt-2w">
                  <p>
                    {erreurRechercheSiret}
                  </p>
                </div> : null}

              {entreprise ? 
                <div className="fr-card fr-mt-3w background-blue-france">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title color-blue-france">
                        {entreprise.denomination}
                      </h4>
                      <p className="fr-card__desc">
                        {entreprise.activitePrincipale}
                        <br />
                        {entreprise.categorieJuridiqueLibelle}
                        <br />
                        {entreprise.adresse}
                      </p>
                    </div>
                  </div>
                </div>
                : null}
            </div>

            {/* Contact référent */}
            {entreprise ? 
              <div className="fr-mb-4w">
                <h3 className="fr-h5 fr-mb-3w">
                  Contact référent
                </h3>
                
                <div className="fr-grid-row fr-grid-row--gutters">
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="nom"
                      name="nom"
                      onChange={changerNomContact}
                      required={true}
                      value={contact.nom}
                    >
                      Nom
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="prenom"
                      name="prenom"
                      onChange={changerPrenomContact}
                      required={true}
                      value={contact.prenom}
                    >
                      Prénom
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                </div>
                
                <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="email"
                      name="email"
                      onChange={changerEmailContact}
                      required={true}
                      type="email"
                      value={contact.email}
                    >
                      Adresse électronique
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="fonction"
                      name="fonction"
                      onChange={changerFonctionContact}
                      required={true}
                      value={contact.fonction}
                    >
                      Fonction
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                </div>
              </div>
              :  null}

            {/* Bouton pour ajouter un contact secondaire */}
            {entreprise && !showContactSecondaire ? 
              <div className="fr-mb-4w">
                <button
                  className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
                  onClick={() => {
                    setShowContactSecondaire(true)
                  }}
                  type="button"
                >
                  Ajouter un contact secondaire (facultatif)
                </button>
              </div>
              : null}

            {/* Contact secondaire */}
            {entreprise && showContactSecondaire ? 
              <div className="fr-mb-4w">
                <div className="fr-grid-row fr-grid-row--middle fr-mb-3w">
                  <div className="fr-col">
                    <h3 className="fr-h5 fr-mb-0">
                      Contact secondaire
                    </h3>
                  </div>
                  <div className="fr-col-auto">
                    <button
                      className="fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-delete-line color-red"
                      onClick={supprimerContactSecondaire}
                      title="Supprimer le contact secondaire"
                      type="button"
                    >
                      <span className="fr-sr-only">
                        Supprimer le contact secondaire
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="fr-grid-row fr-grid-row--gutters">
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="nom-secondaire"
                      name="nom-secondaire"
                      onChange={changerNomContactSecondaire}
                      required={true}
                      value={contactSecondaire.nom}
                    >
                      Nom
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="prenom-secondaire"
                      name="prenom-secondaire"
                      onChange={changerPrenomContactSecondaire}
                      required={true}
                      value={contactSecondaire.prenom}
                    >
                      Prénom
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                </div>
                
                <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="email-secondaire"
                      name="email-secondaire"
                      onChange={changerEmailContactSecondaire}
                      required={true}
                      type="email"
                      value={contactSecondaire.email}
                    >
                      Adresse électronique
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                  <div className="fr-col-12 fr-col-md-6">
                    <TextInput
                      id="fonction-secondaire"
                      name="fonction-secondaire"
                      onChange={changerFonctionContactSecondaire}
                      required={true}
                      value={contactSecondaire.fonction}
                    >
                      Fonction
                      {' '}
                      <span className="color-red">
                        *
                      </span>
                    </TextInput>
                  </div>
                </div>
              </div>
              :  null}
          </div>
        </div>
      </div>

      {/* Boutons alignés avec l'encart */}
      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-12 fr-col-md-6">
          <button
            className="fr-btn fr-btn--secondary"
            onClick={abandonner}
            type="button"
          >
            Abandonner
          </button>
        </div>
        <div
          className="fr-col-12 fr-col-md-6 fr-grid-row--right"
          style={{ display: 'flex' }}
        >
          <button
            className="fr-btn"
            disabled={!isFormulairePret}
            onClick={continuerVersConfirmation}
            type="button"
          >
            Étape suivante
          </button>
        </div>
      </div>
    </div>
  )

  function changerSiret(event: React.ChangeEvent<HTMLInputElement>): void {
    // Récupère seulement les chiffres et limite à 14 caractères
    const nouveauSiret = event.target.value.replace(/\D/g, '').slice(0, 14)
    setSiret(nouveauSiret)
    setErreurRechercheSiret('')
    if (nouveauSiret !== siret) {
      setEntreprise(null)
    }
    
    // Validation indicative pendant la saisie
    if (nouveauSiret.length > 0 && nouveauSiret.length < 6) {
      // Pas encore assez de chiffres, on n'affiche pas d'erreur
    } else if (nouveauSiret.length > 7 && nouveauSiret.length < 14) {
      setErreurRechercheSiret('Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)')
    }
  }

  function reinitialiserSiret(): void {
    setSiret('')
    setEntreprise(null)
    setErreurRechercheSiret('')
  }

  function soumettreRechercheSiret(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    // SIRET = 14 chiffres, RIDET = 6 ou 7 chiffres
    if (siret.length === 14 || siret.length >= 6 && siret.length <= 7) {
      void rechercherEntreprise()
    } else if (siret.length > 0) {
      // Affichage d'un message d'erreur pour les saisies invalides
      if (siret.length < 6) {
        setErreurRechercheSiret('Le numéro saisi est trop court. Saisissez un SIRET (14 chiffres) ou un RIDET (6-7 chiffres)')
      } else if (siret.length > 7 && siret.length < 14) {
        setErreurRechercheSiret('Le numéro saisi ne correspond ni à un SIRET (14 chiffres) ni à un RIDET (6-7 chiffres)')
      } else if (siret.length > 14) {
        setErreurRechercheSiret('Le numéro saisi est trop long. Maximum 14 chiffres pour un SIRET')
      }
    }
  }

  function abandonner(): void {
    // Fonction pour abandonner et retourner à la page précédente
    window.history.back()
  }

  function formaterNumero(numeroBrut: string): string {
    // RIDET (7 chiffres ou moins) : pas de formatage
    if (numeroBrut.length <= 7) {
      return numeroBrut
    }
    // SIRET (14 chiffres) : formatage 123 456 789 01234
    if (numeroBrut.length <= 9) {
      return `${numeroBrut.slice(0, 3)} ${numeroBrut.slice(3, 6)} ${numeroBrut.slice(6)}`
    }
    return `${numeroBrut.slice(0, 3)} ${numeroBrut.slice(3, 6)} ${numeroBrut.slice(6, 9)} ${numeroBrut.slice(9)}`
  }

  function changerNomContact(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContact(contactActuel => ({ ...contactActuel, nom: target.value }))
  }

  function changerPrenomContact(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContact(contactActuel => ({ ...contactActuel, prenom: target.value }))
  }

  function changerEmailContact(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContact(contactActuel => ({ ...contactActuel, email: target.value }))
  }

  function changerFonctionContact(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContact(contactActuel => ({ ...contactActuel, fonction: target.value }))
  }

  function changerNomContactSecondaire(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContactSecondaire(contactActuel => ({ ...contactActuel, nom: target.value }))
  }

  function changerPrenomContactSecondaire(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContactSecondaire(contactActuel => ({ ...contactActuel, prenom: target.value }))
  }

  function changerEmailContactSecondaire(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContactSecondaire(contactActuel => ({ ...contactActuel, email: target.value }))
  }

  function changerFonctionContactSecondaire(event: FormEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement
    setContactSecondaire(contactActuel => ({ ...contactActuel, fonction: target.value }))
  }

  function supprimerContactSecondaire(): void {
    setShowContactSecondaire(false)
    setContactSecondaire({ email: '', fonction: '', nom: '', prenom: '' })
  }

  async function rechercherEntreprise(): Promise<void> {
    const isRidet = siret.length <= 7
    
    if (!isRidet && siret.length !== 14) {
      setErreurRechercheSiret('Le SIRET doit contenir exactement 14 chiffres')
      return
    }
    
    if (isRidet && (siret.length < 6 || siret.length > 7)) {
      setErreurRechercheSiret('Le RIDET doit contenir 6 ou 7 chiffres')
      return
    }

    setErreurRechercheSiret('')

    try {
      const result = await rechercherUneEntrepriseAction({ siret })
      
      if (Array.isArray(result)) {
        // Erreur : result contient des messages d'erreur
        setErreurRechercheSiret(result.join(', '))
      } else {
        // Succès : result contient les données de l'entreprise
        setEntreprise(result as EntrepriseViewModel)
      }
    } catch {
      setErreurRechercheSiret('Erreur lors de la recherche. Veuillez réessayer.')
    }
  }

  function continuerVersConfirmation(): void {
    if (isFormulairePret) {
      onContinuer({ 
        contact, 
        contactSecondaire: showContactSecondaire ? contactSecondaire : null,
        entreprise, 
      })
    }
  }
}

type EtapeSelectionMembreProps = Readonly<{
  donneesMembre?: NouveauMembreData
  onContinuer(data: NouveauMembreData): void
}>