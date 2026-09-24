'use client'

import { ChangeEvent, ReactElement, SyntheticEvent, useContext, useState } from 'react'

import SelectionContact from './SelectionContact'
import { ChoixContact, NouveauMembreData } from './types'
import { clientContext } from '../shared/ClientContext'
import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import Search from '../shared/Search/Search'
import Select from '../shared/Select/Select'

export default function EtapeSelectionMembre({
  departements,
  donneesMembre,
  onContinuer,
}: EtapeSelectionMembreProps): ReactElement {
  const { rechercherUneEntrepriseAction } = useContext(clientContext)
  const modeCandidature = departements !== undefined
  const [siret, setSiret] = useState(donneesMembre?.entreprise?.identifiant ?? '')
  const [entreprise, setEntreprise] = useState(donneesMembre?.entreprise ?? null)
  const [codeDepartement, setCodeDepartement] = useState(donneesMembre?.departement?.code ?? '')
  const [erreurRechercheSiret, setErreurRechercheSiret] = useState('')

  // Contact principal
  const [modeContact, setModeContact] = useState(donneesMembre?.contact?.type ?? 'nouveau')
  const [contactExistantId, setContactExistantId] = useState(
    donneesMembre?.contact?.type === 'existant' ? donneesMembre.contact.contactExistantId : null
  )
  const [nouveauContact, setNouveauContact] = useState(
    donneesMembre?.contact?.type === 'nouveau'
      ? donneesMembre.contact.donnees
      : { email: '', fonction: '', nom: '', prenom: '' }
  )

  // Contact secondaire
  const [modeContactSecondaire, setModeContactSecondaire] = useState(
    donneesMembre?.contactSecondaire?.type ?? 'nouveau'
  )
  const [contactSecondaireExistantId, setContactSecondaireExistantId] = useState(
    donneesMembre?.contactSecondaire?.type === 'existant' ? donneesMembre.contactSecondaire.contactExistantId : null
  )
  const [nouveauContactSecondaire, setNouveauContactSecondaire] = useState(
    donneesMembre?.contactSecondaire?.type === 'nouveau'
      ? donneesMembre.contactSecondaire.donnees
      : { email: '', fonction: '', nom: '', prenom: '' }
  )
  const [showContactSecondaire, setShowContactSecondaire] = useState(
    donneesMembre?.contactSecondaire !== null && donneesMembre?.contactSecondaire !== undefined
  )

  const contactsExistants = entreprise?.contactsExistants ?? []

  const isContactValide = modeContact === 'existant' ? contactExistantId !== null : estContactRenseigne(nouveauContact)

  const isContactSecondaireValide =
    !showContactSecondaire ||
    (modeContactSecondaire === 'existant'
      ? contactSecondaireExistantId !== null
      : estContactRenseigne(nouveauContactSecondaire))

  const isFormulairePret =
    entreprise !== null && (!modeCandidature || codeDepartement !== '') && isContactValide && isContactSecondaireValide

  return (
    <div>
      <div className="fr-card fr-mt-4w">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm color-grey fr-mb-3w">
              Les champs avec <span className="color-red">*</span> sont obligatoires
            </p>
            {/* Structure */}
            <div className="fr-mb-4w">
              <h3 className="fr-h5 fr-mb-3w">Structure</h3>
              {modeCandidature ? null : (
                <>
                  <Search
                    labelBouton="Rechercher"
                    placeholder="Renseignez le Numéro SIRET ou RIDET *"
                    rechercher={changerSiret}
                    reinitialiserBouton="Effacer la recherche"
                    reinitialiserLesTermesDeRechercheNomOuEmail={reinitialiserSiret}
                    soumettreLaRecherche={soumettreRechercheSiret}
                    termesDeRechercheNomOuEmail={formaterNumero(siret)}
                  />
                  <p className="color-grey fr-mb-1w">Format attendu : SIRET (14 chiffres) ou RIDET (6 ou 7 chiffres)</p>

                  {erreurRechercheSiret ? (
                    <div className="fr-alert fr-alert--error fr-mt-2w">
                      <p>{erreurRechercheSiret}</p>
                    </div>
                  ) : null}
                </>
              )}

              {entreprise ? (
                <div className="fr-card fr-mt-3w background-blue-france">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title color-blue-france">{entreprise.denomination}</h4>
                      <p className="fr-card__desc">
                        {entreprise.activitePrincipaleLibelle}
                        <br />
                        {entreprise.categorieJuridiqueLibelle}
                        <br />
                        {entreprise.adresse}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Votre gouvernance */}
            {modeCandidature ? (
              <div className="fr-mb-4w">
                <h3 className="fr-h5 fr-mb-3w">Votre gouvernance</h3>
                <Select
                  id="departement"
                  name="departement"
                  onChange={changerDepartement}
                  options={departements}
                  placeholder="Sélectionnez un département"
                  required={true}
                  value={codeDepartement}
                >
                  Département
                </Select>
              </div>
            ) : null}

            {/* Contacts */}
            {entreprise ? renderContacts() : null}
          </div>
        </div>
      </div>

      {/* Boutons alignés avec l'encart */}
      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-12 fr-col-md-6">
          <button className="fr-btn fr-btn--secondary" onClick={abandonner} type="button">
            Abandonner
          </button>
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-grid-row--right" style={{ display: 'flex' }}>
          <button className="fr-btn" disabled={!isFormulairePret} onClick={continuerVersConfirmation} type="button">
            Étape suivante
          </button>
        </div>
      </div>
    </div>
  )

  function renderContacts(): ReactElement {
    return (
      <>
        <SelectionContact
          contactExistantId={contactExistantId}
          contactsExistants={contactsExistants}
          idPrefix="contact"
          mode={modeContact}
          nouveauContact={nouveauContact}
          onChangerEmail={changerChampContact('email')}
          onChangerFonction={changerChampContact('fonction')}
          onChangerNom={changerChampContact('nom')}
          onChangerPrenom={changerChampContact('prenom')}
          onChoisirExistant={choisirContactExistant}
          onChoisirNouveau={choisirNouveauContact}
          titre={modeCandidature ? 'Contact référent de la structure' : 'Contact référent'}
        />

        {showContactSecondaire ? (
          <>
            <div className="fr-grid-row fr-grid-row--middle fr-mb-3w">
              <div className="fr-col-auto">
                <button
                  className="fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-delete-line color-red"
                  onClick={supprimerContactSecondaire}
                  title="Supprimer le contact secondaire"
                  type="button"
                >
                  <span className="fr-sr-only">Supprimer le contact secondaire</span>
                </button>
              </div>
            </div>
            <SelectionContact
              contactExistantId={contactSecondaireExistantId}
              contactsExistants={contactsExistants}
              idPrefix="contact-secondaire"
              mode={modeContactSecondaire}
              nouveauContact={nouveauContactSecondaire}
              onChangerEmail={changerChampContactSecondaire('email')}
              onChangerFonction={changerChampContactSecondaire('fonction')}
              onChangerNom={changerChampContactSecondaire('nom')}
              onChangerPrenom={changerChampContactSecondaire('prenom')}
              onChoisirExistant={choisirContactSecondaireExistant}
              onChoisirNouveau={choisirNouveauContactSecondaire}
              titre="Contact secondaire"
            />
          </>
        ) : (
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
        )}
      </>
    )
  }

  function changerSiret(event: React.ChangeEvent<HTMLInputElement>): void {
    const nouveauSiret = event.target.value.replace(/\D/g, '').slice(0, 14)
    setSiret(nouveauSiret)
    setErreurRechercheSiret('')
    if (nouveauSiret !== siret) {
      setEntreprise(null)
      reinitialiserChoixContacts()
    }

    if (nouveauSiret.length > 7 && nouveauSiret.length < 14) {
      setErreurRechercheSiret('Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)')
    }
  }

  function reinitialiserSiret(): void {
    setSiret('')
    setEntreprise(null)
    setErreurRechercheSiret('')
    reinitialiserChoixContacts()
  }

  function reinitialiserChoixContacts(): void {
    setModeContact('nouveau')
    setContactExistantId(null)
    setNouveauContact({ email: '', fonction: '', nom: '', prenom: '' })
    setModeContactSecondaire('nouveau')
    setContactSecondaireExistantId(null)
    setNouveauContactSecondaire({ email: '', fonction: '', nom: '', prenom: '' })
    setShowContactSecondaire(false)
  }

  function soumettreRechercheSiret(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (siret.length === 14 || (siret.length >= 6 && siret.length <= 7)) {
      void rechercherEntreprise()
    } else if (siret.length > 0) {
      setErreurRechercheSiret(messageErreurSiret(siret))
    }
  }

  function abandonner(): void {
    window.history.back()
  }

  function changerDepartement(option: null | Readonly<{ label: string; value: string }>): void {
    setCodeDepartement(option?.value ?? '')
  }

  // Contact principal
  function choisirContactExistant(id: number): void {
    setModeContact('existant')
    setContactExistantId(id)
  }

  function choisirNouveauContact(): void {
    setModeContact('nouveau')
    setContactExistantId(null)
  }

  function changerChampContact(champ: string): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setNouveauContact((contactActuel) => ({ ...contactActuel, [champ]: event.target.value }))
    }
  }

  // Contact secondaire
  function choisirContactSecondaireExistant(id: number): void {
    setModeContactSecondaire('existant')
    setContactSecondaireExistantId(id)
  }

  function choisirNouveauContactSecondaire(): void {
    setModeContactSecondaire('nouveau')
    setContactSecondaireExistantId(null)
  }

  function changerChampContactSecondaire(champ: string): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setNouveauContactSecondaire((contactActuel) => ({ ...contactActuel, [champ]: event.target.value }))
    }
  }

  function supprimerContactSecondaire(): void {
    setShowContactSecondaire(false)
    setModeContactSecondaire('nouveau')
    setContactSecondaireExistantId(null)
    setNouveauContactSecondaire({ email: '', fonction: '', nom: '', prenom: '' })
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
        setErreurRechercheSiret(result.join(', '))
      } else {
        setEntreprise(result as EntrepriseViewModel)
        reinitialiserChoixContacts()
      }
    } catch {
      setErreurRechercheSiret('Erreur lors de la recherche. Veuillez réessayer.')
    }
  }

  function continuerVersConfirmation(): void {
    if (!isFormulairePret) {
      return
    }

    const departement = departements?.find((dep) => dep.value === codeDepartement)
    onContinuer({
      contact: construireChoixContact(modeContact, contactExistantId, nouveauContact),
      contactSecondaire: showContactSecondaire
        ? construireChoixContact(modeContactSecondaire, contactSecondaireExistantId, nouveauContactSecondaire)
        : null,
      departement: departement ? { code: departement.value, label: departement.label } : null,
      entreprise,
    })
  }
}

function construireChoixContact(
  mode: 'existant' | 'nouveau',
  existantId: null | number,
  nouveau: Readonly<{ email: string; fonction: string; nom: string; prenom: string }>
): ChoixContact {
  if (mode === 'existant' && existantId !== null) {
    return { contactExistantId: existantId, type: 'existant' }
  }
  return { donnees: nouveau, type: 'nouveau' }
}

function estContactRenseigne(
  contact: Readonly<{ email: string; fonction: string; nom: string; prenom: string }>
): boolean {
  return (
    contact.nom.trim() !== '' &&
    contact.prenom.trim() !== '' &&
    contact.email.trim() !== '' &&
    contact.fonction.trim() !== ''
  )
}

function formaterNumero(numeroBrut: string): string {
  if (numeroBrut.length <= 7) {
    return numeroBrut
  }
  if (numeroBrut.length <= 9) {
    return `${numeroBrut.slice(0, 3)} ${numeroBrut.slice(3, 6)} ${numeroBrut.slice(6)}`
  }
  return `${numeroBrut.slice(0, 3)} ${numeroBrut.slice(3, 6)} ${numeroBrut.slice(6, 9)} ${numeroBrut.slice(9)}`
}

function messageErreurSiret(siret: string): string {
  if (siret.length < 6) {
    return 'Le numéro saisi est trop court. Saisissez un SIRET (14 chiffres) ou un RIDET (6-7 chiffres)'
  }
  if (siret.length > 7 && siret.length < 14) {
    return 'Le numéro saisi ne correspond ni à un SIRET (14 chiffres) ni à un RIDET (6-7 chiffres)'
  }
  if (siret.length > 14) {
    return 'Le numéro saisi est trop long. Maximum 14 chiffres pour un SIRET'
  }
  return 'Format invalide'
}

type EtapeSelectionMembreProps = Readonly<{
  departements?: ReadonlyArray<
    Readonly<{
      label: string
      value: string
    }>
  >
  donneesMembre?: NouveauMembreData
  onContinuer(data: NouveauMembreData): void
}>
