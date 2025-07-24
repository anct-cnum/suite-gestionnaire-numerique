import { ReactElement } from 'react'

import GouvernancesList from '@/components/Gouvernances/GouvernancesList'
import { gouvernancePresenter } from '@/presenters/gouvernancesPresenter'
import { RecupererGouvernancesInfos } from '@/use-cases/queries/RecupererGouvernancesInfos'

export default async function GouvernancesController(): Promise<ReactElement> {
  const query = new RecupererGouvernancesInfos()
  const gonvernancesReadModel = await query.handle()
  const gonvernancesViewModel = gouvernancePresenter(gonvernancesReadModel)
  return (
    <GouvernancesList
      details={gonvernancesViewModel.details}
      infos={gonvernancesViewModel.infos}
    />
  )
}
