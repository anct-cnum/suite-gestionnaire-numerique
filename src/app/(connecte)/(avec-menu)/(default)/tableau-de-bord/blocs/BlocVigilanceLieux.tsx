import { ReactElement } from 'react'

import { isErrorReadModel } from '@/components/shared/ErrorHandler'
import PointsVigilance from '@/components/TableauDeBord/PointsVigilance'
import { FiltreLieuxDansScope } from '@/gateways/shared/lieuxDansScope'
import { PrismaPointsVigilanceLieuxLoader } from '@/gateways/tableauDeBord/PrismaPointsVigilanceLieuxLoader'
import { pointsVigilanceLieuxPresenter } from '@/presenters/tableauDeBord/pointsVigilanceLieuxPresenter'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export default async function BlocVigilanceLieux({ territoire }: Props): Promise<ReactElement> {
  const loader = new PrismaPointsVigilanceLieuxLoader()
  const readModel = await loader.get(filtreLieux(territoire), new Date())

  if (isErrorReadModel(readModel)) {
    return <></>
  }

  const viewModel = pointsVigilanceLieuxPresenter(
    readModel,
    territoire.type === 'departement' ? territoire.code : undefined
  )

  // Si aucun lieu n'est à actualiser ni à vérifier, la section n'est pas affichée (#1488).
  if (viewModel.lignes.length === 0) {
    return <></>
  }

  return <PointsVigilance viewModel={viewModel} />
}

function filtreLieux(territoire: TerritoireTableauDeBord): FiltreLieuxDansScope {
  switch (territoire.type) {
    case 'departement':
      return { codes: [territoire.code], type: 'departemental' }
    case 'epci':
      return { codesInsee: territoire.codesInsee, type: 'communes' }
    case 'france':
      return { type: 'national' }
    case 'region':
      return { codes: territoire.codesDepartement, type: 'departemental' }
    case 'structure':
      return { id: territoire.structureId, type: 'structure' }
  }
}

type Props = Readonly<{
  territoire: TerritoireTableauDeBord
}>
