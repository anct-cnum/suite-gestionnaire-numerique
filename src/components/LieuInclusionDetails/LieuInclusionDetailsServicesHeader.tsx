import { ReactElement } from 'react'

import SectionIcon from '@/components/LieuInclusionDetails/SectionIcon'

export default function LieuInclusionDetailsServicesHeader(): ReactElement {
  return (
    <div className="fr-p-4w">
      <div className="fr-mb-3w">
        <SectionIcon iconClass="fr-icon-heart-pulse-line" />
      </div>
      <h2 className="fr-h4 fr-mb-1w fr-text-label--blue-france">
        Services d&apos;inclusion numérique
      </h2>
      <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
        Renseignez des informations sur les services
        d&apos;inclusion numérique proposés dans ce lieu afin d&apos;orienter les bénéficiaires.
      </p>
    </div>
  )
}
