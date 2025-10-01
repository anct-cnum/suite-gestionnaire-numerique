import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import LieuInclusionDetailsAccueilDescription from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilDescription'
import LieuInclusionDetailsAccueilHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilHeader'
import LieuInclusionDetailsAccueilInformationsPratique from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilInformationsPratique'

export default function LieuInclusionDetailsAccueil(props: Props): ReactElement {
  const { data } = props

  return (
    <div>
      <LieuInclusionDetailsAccueilHeader />
      <hr className="fr-hr" />
      <div id="lieu-detail-description">
        <LieuInclusionDetailsAccueilDescription data={data} />
      </div>
      <hr className="fr-hr" />
      <div id="lieu-information-pratique">
        <LieuInclusionDetailsAccueilInformationsPratique data={data} />
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>

