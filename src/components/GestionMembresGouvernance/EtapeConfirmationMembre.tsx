/* eslint-disable no-negated-condition */
'use client'

import { ReactElement, useState } from 'react'

import { NouveauMembreData } from './types'

export default function EtapeConfirmationMembre({ 
  data, 
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
              <h3 className="fr-h5 fr-mb-3w">
                Structure
              </h3>
              {data.entreprise ? 
                <dl
                  aria-label="Structure"
                  className="fr-grid-row fr-grid-row--gutters"
                  role="list"
                >
                  <div className="fr-col-12">
                    <dt className="color-grey">
                      Dénomination
                    </dt>
                    <dd className="font-weight-500">
                      {data.entreprise.denomination}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      SIRET/RIDET
                    </dt>
                    <dd className="font-weight-500">
                      {data.entreprise.identifiant}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Activité principale
                    </dt>
                    <dd className="font-weight-500">
                      {data.entreprise.activitePrincipale}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Forme juridique
                    </dt>
                    <dd className="font-weight-500">
                      {data.entreprise.categorieJuridiqueLibelle}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Adresse
                    </dt>
                    <dd className="font-weight-500">
                      {data.entreprise.adresse}
                    </dd>
                  </div>
                </dl> : null}
            </div>

            {/* Contact référent */}
            <div className="fr-mb-4w">
              <h3 className="fr-h5 fr-mb-3w">
                Contact référent
              </h3>
              {data.contact ?
                <dl
                  aria-label="Contact référent"
                  className="fr-grid-row fr-grid-row--gutters"
                  role="list"
                >
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Nom
                    </dt>
                    <dd className="font-weight-500">
                      {data.contact.nom}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Prénom
                    </dt>
                    <dd className="font-weight-500">
                      {data.contact.prenom}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Adresse électronique
                    </dt>
                    <dd className="font-weight-500">
                      {data.contact.email}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Fonction
                    </dt>
                    <dd className="font-weight-500">
                      {data.contact.fonction}
                    </dd>
                  </div>
                </dl> : null}
            </div>

            {/* Contact secondaire */}
            {data.contactSecondaire !== null ?
              <div className="fr-mb-4w">
                <h3 className="fr-h5 fr-mb-3w">
                  Contact secondaire
                </h3>
                <dl
                  aria-label="Contact secondaire"
                  className="fr-grid-row fr-grid-row--gutters"
                  role="list"
                >
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Nom
                    </dt>
                    <dd className="font-weight-500">
                      {data.contactSecondaire.nom}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Prénom
                    </dt>
                    <dd className="font-weight-500">
                      {data.contactSecondaire.prenom}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Adresse électronique
                    </dt>
                    <dd className="font-weight-500">
                      {data.contactSecondaire.email}
                    </dd>
                  </div>
                  <div className="fr-col-6">
                    <dt className="color-grey">
                      Fonction
                    </dt>
                    <dd className="font-weight-500">
                      {data.contactSecondaire.fonction}
                    </dd>
                  </div>
                </dl>
              </div> : null}
          </div>
        </div>
      </div>

      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-12 fr-col-md-6">
          <button
            className="fr-btn fr-btn--secondary"
            disabled={isAjoutEnCours}
            onClick={onRetour}
            type="button"
          >
            Modifier
          </button>
        </div>
        <div
          className="fr-col-12 fr-col-md-6 fr-grid-row--right"
          style={{ display: 'flex' }}
        >
          <button
            className="fr-btn"
            disabled={isAjoutEnCours}
            onClick={confirmerAjout}
            type="button"
          >
            {isAjoutEnCours ? 'Ajout en cours...' : 'Ajouter cette structure'}
          </button>
        </div>
      </div>
    </div>
  )

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
  onConfirmer(): Promise<void>
  onRetour(): void
}>