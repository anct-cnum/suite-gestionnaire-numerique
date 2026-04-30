import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { CollectivitesReadModel } from '@/use-cases/queries/RecupererCollectivitesImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type CollectivitesViewModel = Readonly<{
  nombreCoporteurs: number
  nombreTotal: number
  ventilation: ReadonlyArray<{
    backgroundColor: string
    categorie: string
    color: string
    count: number
  }>
}>

export function collectivitesPresenter(
  readModel: CollectivitesReadModel | ErrorReadModel
): CollectivitesViewModel | ErrorViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    nombreCoporteurs: readModel.nombreCoporteurs,
    nombreTotal: readModel.nombreTotal,
    ventilation: readModel.ventilationParCategorie.map((item) => {
      const color = getColorForCategorie(item.categorie)
      return {
        backgroundColor: getBackgroundColor(color),
        categorie: item.categorie,
        color,
        count: item.count,
      }
    }),
  }
}

function isErrorReadModel(readModel: CollectivitesReadModel | ErrorReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}

function getColorForCategorie(categorie: string): string {
  const couleursMappings: Record<string, string> = {
    Autres: 'dot-grey-sans-coporteur',
    Communes: 'dot-green-emeraude-main-632',
    'Conseils départementaux': 'dot-blue-france-main-525',
    'Conseils régionaux': 'dot-green-menthe-main-548',
    EPCI: 'dot-green-bourgeon-main-640',
  }

  return couleursMappings[categorie] ?? 'dot-grey-sans-coporteur'
}

function getBackgroundColor(cssClass: string): string {
  const colorMappings: Record<string, string> = {
    'dot-blue-france-main-525': '#000091',
    'dot-green-bourgeon-main-640': '#68a532',
    'dot-green-emeraude-main-632': '#00a95f',
    'dot-green-menthe-main-548': '#009081',
    'dot-grey-sans-coporteur': '#929292',
  }
  return colorMappings[cssClass] ?? '#929292'
}
