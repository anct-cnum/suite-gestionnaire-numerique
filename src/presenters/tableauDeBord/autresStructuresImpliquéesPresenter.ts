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
  return couleursParCategorie.get(categorie) ?? 'dot-grey-sans-coporteur'
}

// Map plutôt qu'objet : les règles de tri des clés divergent sur les libellés accentués
const couleursParCategorie: ReadonlyMap<string, string> = new Map([
  ['Associations et fondations', 'dot-pink-tuile-main-556'],
  ['Autres', 'dot-grey-sans-coporteur'],
  ['CCAS / CIAS', 'dot-purple-glycine-main-494'],
  ['Chambres consulaires', 'dot-purple-glycine-850-200'],
  ['Entreprises et coopératives', 'dot-orange-terre-battue-850-200'],
  ['Établissements publics', 'dot-pink-macaron-main-689'],
  ['GIP', 'dot-pink-tuile-925-125'],
  ['Organismes de sécurité sociale', 'dot-pink-macaron-850-200'],
  ['Syndicats', 'dot-pink-tuile-850-200'],
])

function getBackgroundColor(cssClass: string): string {
  const colorMappings: Record<string, string> = {
    'dot-grey-sans-coporteur': '#929292',
    'dot-orange-terre-battue-850-200': '#fcc0b0',
    'dot-pink-macaron-850-200': '#fcc0b4',
    'dot-pink-macaron-main-689': '#e18b76',
    'dot-pink-tuile-850-200': '#fcbfb7',
    'dot-pink-tuile-925-125': '#fddfdb',
    'dot-pink-tuile-main-556': '#ce614a',
    'dot-purple-glycine-850-200': '#fbb8f6',
    'dot-purple-glycine-main-494': '#a558a0',
  }
  return colorMappings[cssClass] ?? '#929292'
}
