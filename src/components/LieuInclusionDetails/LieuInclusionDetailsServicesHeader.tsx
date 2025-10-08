import { ReactElement } from 'react'

export default function LieuInclusionDetailsServicesHeader(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--middle fr-px-4w fr-pb-2w">
      <div className="fr-col">
        <div className="fr-mb-1w">
          <span
            aria-hidden="true"
            className="fr-icon-heart-pulse-line fr-icon--xl fr-mr-1w fr-text-label--blue-france "
            style={{
              backgroundColor: 'var(--blue-france-975-75)',
              borderRadius: '0.5rem',
              height: '0.5rem',
              padding: '0.5rem',
              width: '0.5rem',
            }}
          />
        </div>
        <h2 className="fr-h4 fr-mb-1w fr-text-label--blue-france">
          Services d&apos;inclusion numérique
        </h2>
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Renseignez des informations sur les services
          d&apos;inclusion numérique proposés dans ce lieu afin d&apos;orienter les bénéficiaires.
        </p>
      </div>
    </div>
  )
}
