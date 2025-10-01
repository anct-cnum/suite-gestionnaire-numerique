import { ReactElement } from 'react'

import { LieuAccueilPublicData, ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import LieuInclusionDetailsServicesHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesHeader'
import LieuInclusionDetailsServicesModalite from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesModalite'
import LieuInclusionDetailsServicesTypeAccompagnement from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypeAccompagnement'
import LieuInclusionDetailsServicesTypePublic from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypePublic'

export default function LieuInclusionDetailsServices(props: Props): ReactElement {
  const { data, lieuAccueilPublic } = props

  return (
    <div>
      <LieuInclusionDetailsServicesHeader />
      <hr className="fr-hr " />
      <div id="lieu-detail-service-accompagnement">
        <LieuInclusionDetailsServicesTypeAccompagnement data={data} />
      </div>
      <hr className="fr-hr " />
      <div id="lieu-detail-service-modalite">
        <LieuInclusionDetailsServicesModalite
          fraisACharge={lieuAccueilPublic?.fraisACharge}
          modalitesAcces={lieuAccueilPublic?.modalitesAcces}
          telephone={lieuAccueilPublic?.telephone}
        />
      </div>
      <hr className="fr-hr " />
      <div id="lieu-detail-service-public">
        <LieuInclusionDetailsServicesTypePublic
          priseEnChargeSpecifique={lieuAccueilPublic?.priseEnChargeSpecifique}
        />
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
  lieuAccueilPublic?: LieuAccueilPublicData
}>
