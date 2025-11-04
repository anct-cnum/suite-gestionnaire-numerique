import { ReactElement } from 'react'

import { LieuAccueilPublicData, ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import LieuInclusionDetailsServicesHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesHeader'
import LieuInclusionDetailsServicesModalite from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesModalite'
import LieuInclusionDetailsServicesTypeAccompagnement from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypeAccompagnement'
import LieuInclusionDetailsServicesTypePublic from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypePublic'

export default function LieuInclusionDetailsServices(props: Props): ReactElement {
  const { data, lieuAccueilPublic, peutModifier } = props

  return (
    <div>
      <LieuInclusionDetailsServicesHeader />
      <hr className="fr-hr " />
      <div id="lieu-detail-service-accompagnement">
        <LieuInclusionDetailsServicesTypeAccompagnement
          data={data}
          modalitesAccueil={lieuAccueilPublic?.modalitesAccueil}
          peutModifier={peutModifier}
        />
      </div>
      <hr className="fr-hr " />
      <div id="lieu-detail-service-modalite">
        <LieuInclusionDetailsServicesModalite
          email={lieuAccueilPublic?.email}
          fraisACharge={lieuAccueilPublic?.fraisACharge}
          modalitesAcces={lieuAccueilPublic?.modalitesAcces}
          peutModifier={peutModifier}
          telephone={lieuAccueilPublic?.telephone}
        />
      </div>
      <hr className="fr-hr " />
      <div id="lieu-detail-service-public">
        <LieuInclusionDetailsServicesTypePublic
          peutModifier={peutModifier}
          priseEnChargeSpecifique={lieuAccueilPublic?.priseEnChargeSpecifique}
          publicsSpecifiquementAdresses={lieuAccueilPublic?.publicsSpecifiquementAdresses}
        />
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
  lieuAccueilPublic?: LieuAccueilPublicData
  peutModifier: boolean
}>
