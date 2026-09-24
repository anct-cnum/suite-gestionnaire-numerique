'use client'

import { ReactElement, useState } from 'react'

import { ChoixContact, NouveauMembreData } from './types'
import { ContactExistant } from '../shared/Membre/EntrepriseType'

export default function EtapeConfirmationMembre({
  data,
  labelBoutonConfirmer = 'Ajouter cette structure',
  onConfirmer,
  onRetour,
}: EtapeConfirmationMembreProps): ReactElement {
  const [isAjoutEnCours, setIsAjoutEnCours] = useState(false)

  return (
    <div>
      <div className="fr-card ">
        <div className="fr-card__body fr-mt-2w">
          <div className="fr-card__content">
            {/* Structure */}
            <div className="fr-mb-4w">
              <h3 className="fr-h5 fr-mb-3w">Structure</h3>
              {data.entreprise ? (
                <dl aria-label="Structure" className="fr-grid-row fr-grid-row--gutters" role="list">
                  <div className="fr-col-12">
                    <dt className="color-grey">Dénomination</dt>
                    <dd className="font-weight-500">{data.entreprise.denomination}</dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">SIRET/RIDET</dt>
                    <dd className="font-weight-500">{data.entreprise.identifiant}</dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">Activité principale</dt>
                    <dd className="font-weight-500">{data.entreprise.activitePrincipaleLibelle}</dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">Forme juridique</dt>
                    <dd className="font-weight-500">{data.entreprise.categorieJuridiqueLibelle}</dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">Adresse</dt>
                    <dd className="font-weight-500">{data.entreprise.adresse}</dd>
                  </div>
                </dl>
              ) : null}
            </div>

            {/* Votre gouvernance */}
            {data.departement ? (
              <div className="fr-mb-4w">
                <h3 className="fr-h5 fr-mb-3w">Votre gouvernance</h3>
                <dl aria-label="Votre gouvernance" className="fr-grid-row fr-grid-row--gutters" role="list">
                  <div className="fr-col-12">
                    <dt className="color-grey">Département</dt>
                    <dd className="font-weight-500">{data.departement.label}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {/* Contact référent */}
            {data.contact ? afficherContact('Contact référent', data.contact) : null}

            {/* Contact secondaire */}
            {data.contactSecondaire !== null ? afficherContact('Contact secondaire', data.contactSecondaire) : null}
          </div>
        </div>
      </div>

      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-12 fr-col-md-6">
          <button className="fr-btn fr-btn--secondary" disabled={isAjoutEnCours} onClick={onRetour} type="button">
            Modifier
          </button>
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-grid-row--right" style={{ display: 'flex' }}>
          <button
            className="fr-btn"
            disabled={isAjoutEnCours}
            onClick={() => {
              void confirmerAjout()
            }}
            type="button"
          >
            {isAjoutEnCours ? 'Ajout en cours...' : labelBoutonConfirmer}
          </button>
        </div>
      </div>
    </div>
  )

  function resoudreContact(
    choix: ChoixContact
  ): Readonly<{ email: string; fonction: string; nom: string; prenom: string }> | undefined {
    if (choix.type === 'nouveau') {
      return choix.donnees
    }
    const contactsExistants = data.entreprise?.contactsExistants ?? []
    return contactsExistants.find((ce: ContactExistant) => ce.id === choix.contactExistantId)
  }

  function afficherContact(titre: string, choix: ChoixContact): null | ReactElement {
    const contactResolu = resoudreContact(choix)
    if (!contactResolu) {
      return null
    }
    return (
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-3w">{titre}</h3>
        <dl aria-label={titre} className="fr-grid-row fr-grid-row--gutters" role="list">
          <div className="fr-col-6">
            <dt className="color-grey">Nom</dt>
            <dd className="font-weight-500">{contactResolu.nom}</dd>
          </div>
          <div className="fr-col-6">
            <dt className="color-grey">Prénom</dt>
            <dd className="font-weight-500">{contactResolu.prenom}</dd>
          </div>
          <div className="fr-col-6">
            <dt className="color-grey">Adresse électronique</dt>
            <dd className="font-weight-500">{contactResolu.email}</dd>
          </div>
          <div className="fr-col-6">
            <dt className="color-grey">Fonction</dt>
            <dd className="font-weight-500">{contactResolu.fonction}</dd>
          </div>
        </dl>
      </div>
    )
  }

  async function confirmerAjout(): Promise<void> {
    setIsAjoutEnCours(true)
    try {
      await onConfirmer()
    } finally {
      setIsAjoutEnCours(false)
    }
  }
}

type EtapeConfirmationMembreProps = Readonly<{
  data: NouveauMembreData
  labelBoutonConfirmer?: string
  onConfirmer(): Promise<void>
  onRetour(): void
}>
