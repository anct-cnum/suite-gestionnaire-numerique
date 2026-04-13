import { ReactElement } from 'react'

import { isErrorReadModel } from '@/components/shared/ErrorHandler'
import DonneesStructure, { DonneesStructureViewModel } from '@/components/TableauDeBord/DonneesStructure'
import { PrismaDonneesStructureLoader } from '@/gateways/tableauDeBord/PrismaDonneesStructureLoader'
import { DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { Scope } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocDonneesStructure({ scope }: Props): Promise<ReactElement> {
  const structureId = scope.type === 'structure' ? parseInt(scope.code, 10) : 0

  if (structureId === 0) {
    return <DonneesStructure viewModel={viewModelVide} />
  }
  const maintenant = new Date()
  const loader = new PrismaDonneesStructureLoader()
  const readModel = await loader.get(structureId, maintenant)

  if (isErrorReadModel(readModel)) {
    return <DonneesStructure viewModel={viewModelVide} />
  }

  return <DonneesStructure viewModel={presenter(readModel, maintenant)} />
}

function presenter(readModel: DonneesStructureReadModel, maintenant: Date): DonneesStructureViewModel {
  return {
    accompagnements: {
      repartition: sixDerniersMois(readModel.accompagnementsMensuels, maintenant),
      total: readModel.totalAccompagnements.toLocaleString('fr-FR'),
    },
    nombreLieux: String(readModel.nombreLieux),
    nombreMediateurs: String(readModel.nombreMediateurs),
  }
}

function sixDerniersMois(
  donnees: DonneesStructureReadModel['accompagnementsMensuels'],
  maintenant: Date
): DonneesStructureViewModel['accompagnements']['repartition'] {
  const moisCourant = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - 5 + index, 1)
    const cle = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    const mois = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(2)}`
    const trouve = donnees.find((donnee) => donnee.mois === cle)
    return {
      estMoisCourant: date.getTime() === moisCourant.getTime(),
      mois,
      nombre: trouve?.nombre ?? 0,
    }
  })
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
  scope: Scope
}>
