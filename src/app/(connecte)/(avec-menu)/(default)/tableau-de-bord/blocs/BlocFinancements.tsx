import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import FinancementsAdmin from '@/components/TableauDeBord/FinancementsAdmin'
import FinancementsPref from '@/components/TableauDeBord/FinancementsPref'
import FinancementsStructure from '@/components/TableauDeBord/FinancementsStructure'
import { PrismaEnveloppesConseillerNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaEnveloppesConseillerNumeriqueLoader'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaFinancementsStructureLoader } from '@/gateways/tableauDeBord/PrismaFinancementsStructureLoader'
import {
  EnveloppeConseillerNumeriqueViewModel,
  enveloppesConseillerNumeriquePresenter,
} from '@/presenters/tableauDeBord/enveloppesConseillerNumeriquePresenter'
import { financementAdminPresenter } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { financementsPrefPresenter } from '@/presenters/tableauDeBord/financementPrefPresenter'
import { financementsStructurePresenter } from '@/presenters/tableauDeBord/financementsStructurePresenter'
import { Scope } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocFinancements({ scope }: Props): Promise<ReactElement> {
  if (scope.type === 'france') {
    return financementsNationaux()
  }

  if (scope.type === 'structure') {
    return financementsStructure(parseInt(scope.code, 10))
  }

  if (scope.type === 'departement') {
    return financementsDepartement(scope.code)
  }

  return financementsDepartement(scope.code)
}

async function chargerEnveloppesConseillerNumerique(
  code: string
): Promise<ReadonlyArray<EnveloppeConseillerNumeriqueViewModel>> {
  const loader = new PrismaEnveloppesConseillerNumeriqueLoader()
  const readModel = await loader.get(code)
  return enveloppesConseillerNumeriquePresenter(readModel.enveloppes, new Date())
}

async function financementsNationaux(): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsAdminLoader().get(),
    chargerEnveloppesConseillerNumerique('france'),
  ])
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementAdminPresenter)

  return (
    <FinancementsAdmin
      enveloppesConseillerNumerique={enveloppesConum}
      financementViewModel={financementsViewModel}
      lienFinancements="/gouvernance/01/beneficiaires"
    />
  )
}

async function financementsDepartement(code: string): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsLoader().get(code),
    chargerEnveloppesConseillerNumerique(code),
  ])
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementsPrefPresenter)

  return (
    <FinancementsPref
      conventionnement={financementsViewModel}
      enveloppesConseillerNumerique={enveloppesConum}
      lienFinancements={`/gouvernance/${code}/financements`}
    />
  )
}

async function financementsStructure(structureId: number): Promise<ReactElement> {
  const financementsLoader = new PrismaFinancementsStructureLoader()
  const financementsReadModel = await financementsLoader.get(structureId)
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementsStructurePresenter)

  return <FinancementsStructure lienFinancements="/gouvernance/financements" viewModel={financementsViewModel} />
}

type Props = Readonly<{
  scope: Scope
}>
