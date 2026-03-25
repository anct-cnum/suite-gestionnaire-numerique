import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import GouvernanceAdmin from '@/components/TableauDeBord/Gouvernance/GouvernanceAdmin'
import GouvernancePref from '@/components/TableauDeBord/Gouvernance/GouvernancePref'
import { PrismaGouvernanceTableauDeBordLoader } from '@/gateways/PrismaGouvernanceTableauDeBordLoader'
import { PrismaGouvernanceAdminLoader } from '@/gateways/tableauDeBord/PrismaGouvernanceAdminLoader'
import { gouvernanceAdminPresenter } from '@/presenters/tableauDeBord/gouvernanceAdminPresenter'
import { gouvernancePrefPresenter } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocGouvernance({ contexte }: Props): Promise<ReactElement> {
  if (contexte.estNational()) {
    return gouvernanceNationale()
  }

  return gouvernanceDepartement(contexte.codeTerritoire())
}

async function gouvernanceNationale(): Promise<ReactElement> {
  const gouvernanceAdminLoader = new PrismaGouvernanceAdminLoader()
  const gouvernanceReadModel = await gouvernanceAdminLoader.get()
  const gouvernanceViewModel = handleReadModelOrError(
    gouvernanceReadModel,
    gouvernanceAdminPresenter
  )

  return (
    <GouvernanceAdmin
      gouvernanceViewModel={gouvernanceViewModel}
      lienGouvernance="/gouvernances"
    />
  )
}

async function gouvernanceDepartement(code: string): Promise<ReactElement> {
  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const gouvernanceReadModel = await gouvernanceLoader.get(code)
  const gouvernanceViewModel = handleReadModelOrError(
    gouvernanceReadModel,
    gouvernancePrefPresenter
  )

  return (
    <GouvernancePref
      gouvernanceViewModel={gouvernanceViewModel}
      lienGouvernance={`/gouvernance/${code}`}
    />
  )
}

type Props = Readonly<{
  contexte: Contexte
}>
