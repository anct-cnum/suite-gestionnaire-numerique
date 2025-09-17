import { ReactElement } from 'react'

import { ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import LieuInclusionDetailsServicesHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesHeader'
import LieuInclusionDetailsServicesModalite from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesModalite'
import LieuInclusionDetailsServicesTypeAccompagnement from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypeAccompagnement'
import LieuInclusionDetailsServicesTypePublic from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypePublic'

export default function LieuInclusionDetailsServices(props: Props): ReactElement {
  const { data } = props

  return (
    <div>
      <LieuInclusionDetailsServicesHeader />
      <hr className="fr-hr fr-mt-3w" />
      <LieuInclusionDetailsServicesTypeAccompagnement data={data} />
      <hr className="fr-hr fr-mt-3w" />
      <LieuInclusionDetailsServicesModalite data={data} />
      <hr className="fr-hr fr-mt-3w" />
      <LieuInclusionDetailsServicesTypePublic />
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
}>
