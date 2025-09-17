import { ReactElement } from 'react'

export default function LieuInclusionDetailsAccueilHeader(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--middle fr-p-4w">
      <div className="fr-col">
        <div className="fr-mb-1w">
          <span
            aria-hidden="true"
            className="fr-icon-map-pin-2-line fr-icon--xl fr-mr-1w fr-text-label--blue-france "
          />
        </div>
        <h2 className="fr-h4 fr-mb-1w fr-text-label--blue-france">
          Lieu accueillant du public
        </h2>
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Renseignez ici des informations supplémentaires
          permettant d&apos;ajouter du contexte sur le lieu et de faciliter l&apos;accès au public.
        </p>
      </div>
    </div>
  )
}
