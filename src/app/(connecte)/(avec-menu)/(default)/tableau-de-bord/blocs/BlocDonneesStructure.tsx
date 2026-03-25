import { ReactElement } from 'react'

import { isErrorReadModel } from '@/components/shared/ErrorHandler'
import DonneesStructure, { DonneesStructureViewModel } from '@/components/TableauDeBord/DonneesStructure'
import { PrismaDonneesStructureLoader } from '@/gateways/tableauDeBord/PrismaDonneesStructureLoader'
import { DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocDonneesStructure({ contexte }: Props): Promise<ReactElement> {
  const structureId = contexte.idStructure()

  if (structureId === 0) {
    return <DonneesStructure viewModel={viewModelVide} />
  }
  const loader = new PrismaDonneesStructureLoader()
  const readModel = await loader.get(structureId, new Date())

  if (isErrorReadModel(readModel)) {
    return <DonneesStructure viewModel={viewModelVide} />
  }

  return <DonneesStructure viewModel={presenter(readModel)} />
}

function presenter(readModel: DonneesStructureReadModel): DonneesStructureViewModel {
  return {
    accompagnements: {
      repartition: readModel.accompagnementsMensuels,
      total: readModel.totalAccompagnements.toLocaleString('fr-FR'),
    },
    nombreLieux: String(readModel.nombreLieux),
    nombreMediateurs: String(readModel.nombreMediateurs),
  }
}

const viewModelVide: DonneesStructureViewModel = {
  accompagnements: {
    repartition: [],
    total: '-',
  },
  nombreLieux: '-',
  nombreMediateurs: '-',
}

type Props = Readonly<{
  contexte: Contexte
}>
