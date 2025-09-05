'use client'
import { ReactElement } from 'react'

import { InformationsPersonnellesData } from './AidantDetails'

export default function InformationsPersonnellesCard({
  data,
  onEdit,
}: Readonly<InfosPersoProps>): ReactElement {
  const { email, nom, prenom, telephone } = data
  return (
    <section
      aria-labelledby="infos-title"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-card__body">
        {/* En-tête : titre + action Modifier */}
        <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col">
            <h2
              className="fr-h5 fr-mb-0"
              id="infos-title"
            >
              Informations personnelles
            </h2>
          </div>
          <div
            className="fr-col-auto"
            style={{ display: 'none' }}
          >
            <button
              className="fr-link fr-link--icon-right fr-icon-pencil-line"
              onClick={onEdit}
              type="button"
            >
              Modifier
            </button>
          </div>
        </div>

        <hr className="fr-hr fr-my-2w" />

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Nom
            </p>
            <p className="fr-text--bold fr-mb-3w">
              {nom}
            </p>

            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Téléphone professionnel
            </p>
            <p className="fr-text--bold fr-mb-0">
              {telephone ?? '—'}
            </p>
          </div>

          <div className="fr-col-12 fr-col-md-6">
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Prénom
            </p>
            <p className="fr-text--bold fr-mb-3w">
              {prenom}
            </p>

            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Adresse électronique
            </p>
            <p className="fr-text--bold fr-mb-0">
              {email ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

type InfosPersoProps = {
  readonly data: InformationsPersonnellesData
  onEdit?(): void
}
