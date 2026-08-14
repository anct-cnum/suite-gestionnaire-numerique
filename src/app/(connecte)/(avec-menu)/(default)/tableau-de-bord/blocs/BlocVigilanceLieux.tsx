import { ReactElement } from 'react'

import { isErrorReadModel } from '@/components/shared/ErrorHandler'
import PointsVigilance from '@/components/TableauDeBord/PointsVigilance'
import { PrismaPointsVigilanceLieuxLoader } from '@/gateways/tableauDeBord/PrismaPointsVigilanceLieuxLoader'
import { pointsVigilanceLieuxPresenter } from '@/presenters/tableauDeBord/pointsVigilanceLieuxPresenter'
import { Scope, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocVigilanceLieux({ scope }: Props): Promise<ReactElement> {
  const scopeFiltre = toScopeFiltre(scope)
  if (scopeFiltre === undefined) {
    return <></>
  }

  const loader = new PrismaPointsVigilanceLieuxLoader()
  const readModel = await loader.get(scopeFiltre, new Date())

  if (isErrorReadModel(readModel)) {
    return <></>
  }

  const viewModel = pointsVigilanceLieuxPresenter(readModel, scope.type === 'departement' ? scope.code : undefined)

  // Si aucun lieu n'est à actualiser ni à vérifier, la section n'est pas affichée (#1488).
  if (viewModel.lignes.length === 0) {
    return <></>
  }

  return <PointsVigilance viewModel={viewModel} />
}

function toScopeFiltre(scope: Scope): ScopeFiltre | undefined {
  if (scope.type === 'france') {
    return { type: 'national' }
  }
  if (scope.type === 'departement') {
    return { codes: [scope.code], type: 'departemental' }
  }
  if (scope.type === 'structure') {
    return { id: parseInt(scope.code, 10), type: 'structure' }
  }
  return undefined
}

type Props = Readonly<{
  scope: Scope
}>
