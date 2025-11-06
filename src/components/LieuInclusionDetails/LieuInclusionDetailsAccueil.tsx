import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import LieuInclusionDetailsAccueilDescription from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilDescription'
import LieuInclusionDetailsAccueilHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilHeader'
import LieuInclusionDetailsAccueilInformationsPratique from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilInformationsPratique'

export default function LieuInclusionDetailsAccueil(props: Props): ReactElement {
  const { data, peutModifier } = props

  return (
    <div>
      <LieuInclusionDetailsAccueilHeader />
      <hr className="fr-hr" />
      <div id="lieu-detail-description">
        <LieuInclusionDetailsAccueilDescription
          data={data}
          peutModifier={peutModifier}
        />
      </div>
      <hr
        className="fr-hr fr-mx-4w"
        style={{ marginTop: '2px' }}
      />
      <div id="lieu-information-pratique">
        <LieuInclusionDetailsAccueilInformationsPratique
          data={data}
          peutModifier={peutModifier}
        />
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
  peutModifier: boolean
}>

