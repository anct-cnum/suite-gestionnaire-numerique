import { ReactElement } from 'react'

import { isErrorReadModel } from '@/components/shared/ErrorHandler'
import MediateursAidants, { MediateursAidantsViewModel } from '@/components/TableauDeBord/MediateursAidants'
import {
  PrismaStatistiquesMediateursLoader,
  StatistiquesMediateursReadModel,
} from '@/gateways/PrismaStatistiquesMediateursLoader'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocMediateurs({ contexte }: Props): Promise<ReactElement> {
  const loader = new PrismaStatistiquesMediateursLoader()
  const readModel = await loader.get(contexte.codeTerritoire())

  if (isErrorReadModel(readModel)) {
    return (
      <MediateursAidants viewModel={viewModelVide} />
    )
  }

  return (
    <MediateursAidants viewModel={presenter(readModel)} />
  )
}

function presenter(readModel: StatistiquesMediateursReadModel): MediateursAidantsViewModel {
  const nonHabilites = readModel.nombreMediateurs
    - readModel.nombreConseillersNumeriques
    - readModel.nombreAidantsConnect

  return {
    details: [
      {
        color: 'dot-purple-glycine-sun-319-moon-630',
        label: 'Coordinateurs',
        total: readModel.nombreCoordinateurs,
      },
      {
        color: 'dot-purple-glycine-main-494',
        label: 'Conseillers numériques',
        total: readModel.nombreConseillersNumeriques,
      },
      {
        color: 'dot-purple-glycine-950-100',
        label: 'Aidants habilités Aidants Connect',
        total: readModel.nombreAidantsConnect,
      },
      {
        color: 'dot-purple-glycine-850-200',
        label: 'Médiateurs non-habilités Aidants Connect',
        total: Math.max(0, nonHabilites),
      },
    ],
    graphique: {
      backgroundColor: ['#6E445A', '#A558A0', '#fee7fc', '#FBB8F6'],
    },
    total: readModel.nombreMediateurs,
  }
}

const viewModelVide: MediateursAidantsViewModel = {
  details: [],
  graphique: { backgroundColor: [] },
  total: 0,
}

type Props = Readonly<{
  contexte: Contexte
}>
