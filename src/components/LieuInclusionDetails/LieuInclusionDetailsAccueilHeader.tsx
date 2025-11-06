import { ReactElement } from 'react'

import SectionIcon from '@/components/LieuInclusionDetails/SectionIcon'

export default function LieuInclusionDetailsAccueilHeader(): ReactElement {
  return (
    <div className="fr-p-4w">
      <div className="fr-mb-3w">
        <SectionIcon iconClass="fr-icon-map-pin-2-line" />
      </div>
      <h2 className="fr-h4 fr-mb-1w fr-text-label--blue-france">
        Lieu accueillant du public
      </h2>
      <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
        Renseignez ici des informations supplémentaires
        permettant d&apos;ajouter du contexte sur le lieu et de faciliter l&apos;accès au public.
      </p>
    </div>
  )
}
