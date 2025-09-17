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
      <hr className="fr-hr fr-mt-3w" />
      <LieuInclusionDetailsAccueilDescription data={data} />
      <hr className="fr-hr fr-mt-3w" />
      <LieuInclusionDetailsAccueilInformationsPratique data={data} />
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>

