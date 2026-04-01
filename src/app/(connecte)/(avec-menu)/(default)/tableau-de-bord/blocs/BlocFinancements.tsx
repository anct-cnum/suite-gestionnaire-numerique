import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import FinancementsAdmin from '@/components/TableauDeBord/FinancementsAdmin'
import FinancementsPref from '@/components/TableauDeBord/FinancementsPref'
import FinancementsStructure from '@/components/TableauDeBord/FinancementsStructure'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaFinancementsStructureLoader } from '@/gateways/tableauDeBord/PrismaFinancementsStructureLoader'
import { financementAdminPresenter } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { financementsPrefPresenter } from '@/presenters/tableauDeBord/financementPrefPresenter'
import { financementsStructurePresenter } from '@/presenters/tableauDeBord/financementsStructurePresenter'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocFinancements({ contexte }: Props): Promise<ReactElement> {
  if (contexte.estNational()) {
    return financementsNationaux()
  }

  if (contexte.estGestionnaireStructureSansGouvernance()) {
    return financementsStructure(contexte.idStructure())
  }

  return financementsDepartement(contexte.codeTerritoire())
}

async function financementsNationaux(): Promise<ReactElement> {
  const financementsAdminLoader = new PrismaFinancementsAdminLoader()
  const financementsReadModel = await financementsAdminLoader.get()
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementAdminPresenter)

  return (
    <FinancementsAdmin financementViewModel={financementsViewModel} lienFinancements="/gouvernance/01/beneficiaires" />
  )
}

async function financementsDepartement(code: string): Promise<ReactElement> {
  const financementsLoader = new PrismaFinancementsLoader()
  const financementsReadModel = await financementsLoader.get(code)
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementsPrefPresenter)

  return (
    <FinancementsPref conventionnement={financementsViewModel} lienFinancements={`/gouvernance/${code}/financements`} />
  )
}

async function financementsStructure(structureId: number): Promise<ReactElement> {
  const financementsLoader = new PrismaFinancementsStructureLoader()
  const financementsReadModel = await financementsLoader.get(structureId)
  const financementsViewModel = handleReadModelOrError(financementsReadModel, financementsStructurePresenter)

  return <FinancementsStructure lienFinancements="/gouvernance/financements" viewModel={financementsViewModel} />
}

type Props = Readonly<{
  contexte: Contexte
}>
