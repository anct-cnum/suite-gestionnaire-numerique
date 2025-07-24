import { ReactElement } from 'react'

import GouvernancesDetails from '@/components/Gouvernances/GouvernancesDetails'
import GouvernancesHearder from '@/components/Gouvernances/GouvernancesHeader'
import GouvernancesInfos from '@/components/Gouvernances/GouvernancesInfos'
import { GouvernancesViewModel } from '@/presenters/gouvernancesPresenter'

export default function Gouvernances(props: GouvernancesViewModel): ReactElement {
  const { details, infos } = props
  return (
    <div className="fr-mt-4w">
      <GouvernancesHearder />
      <GouvernancesInfos infos={infos} />
      <GouvernancesDetails details={details} />
    </div>
  )
}
