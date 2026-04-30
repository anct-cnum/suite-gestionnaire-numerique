import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AutresStructuresReadModel } from '@/use-cases/queries/RecupererAutresStructuresImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type AutresStructuresViewModel = Readonly<{
  nombreCoporteurs: number
  nombreTotal: number
  ventilation: ReadonlyArray<{
    backgroundColor: string
    categorie: string
    color: string
    count: number
  }>
}>

export function autresStructuresPresenter(
  readModel: AutresStructuresReadModel | ErrorReadModel
): AutresStructuresViewModel | ErrorViewModel {
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

function isErrorReadModel(readModel: AutresStructuresReadModel | ErrorReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}

function getColorForCategorie(categorie: string): string {
  const couleursMappings: Record<string, string> = {
    Associations: 'dot-pink-tuile-main-556',
    Autres: 'dot-grey-sans-coporteur',
    'Entreprises privées': 'dot-orange-terre-battue-850-200',
    GIE: 'dot-pink-tuile-925-125',
    'Syndicats mixtes': 'dot-pink-tuile-850-200',
  }

  return couleursMappings[categorie] ?? 'dot-grey-sans-coporteur'
}

function getBackgroundColor(cssClass: string): string {
  const colorMappings: Record<string, string> = {
    'dot-grey-sans-coporteur': '#929292',
    'dot-orange-terre-battue-850-200': '#e17b47',
    'dot-pink-tuile-850-200': '#e8a598',
    'dot-pink-tuile-925-125': '#f3d2ca',
    'dot-pink-tuile-main-556': '#ce614a',
  }
  return colorMappings[cssClass] ?? '#929292'
}
