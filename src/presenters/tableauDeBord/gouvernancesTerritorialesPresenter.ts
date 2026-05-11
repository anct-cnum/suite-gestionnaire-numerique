/* eslint-disable sort-keys */
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernancesTerritorialesReadModel } from '@/use-cases/queries/RecuperGouvernancesTerritoriales'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type GouvernancesTerritorialesViewModel = Readonly<{
  nombreTotal: number
  sansCoporteur: {
    backgroundColor: string
    color: string
    count: number
    label: string
  }
  ventilationParTypeDeCoporteur: ReadonlyArray<{
    backgroundColor: string
    color: string
    count: number
    type: string
  }>
}>

export function gouvernancesTerritorialesPresenter(
  readModel: ErrorReadModel | GouvernancesTerritorialesReadModel
): ErrorViewModel | GouvernancesTerritorialesViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    nombreTotal: readModel.nombreTotal,
    sansCoporteur: {
      backgroundColor: getBackgroundColor('dot-grey-sans-coporteur'),
      color: 'dot-grey-sans-coporteur', // Classe CSS grise pour les gouvernances sans coporteur
      count: readModel.nombreSansCoporteur,
      label: 'Sans coporteur',
    },
    ventilationParTypeDeCoporteur: readModel.ventilationParTypeDeCoporteur.map((item) => {
      const color = getColorForType(item.type)
      return {
        backgroundColor: getBackgroundColor(color),
        color,
        count: item.count,
        type: item.type,
      }
    }),
  }
}

function isErrorReadModel(readModel: ErrorReadModel | GouvernancesTerritorialesReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}

// Mapping des types de coporteur vers les classes CSS prédéfinies
function getColorForType(type: string): string {
  const couleursMappings: Record<string, string> = {
    Association: 'dot-green-menthe-main-548',
    Autre: 'dot-pink-tuile-main-556',
    'Collectivité, commune': 'dot-green-tilleul-verveine-925',
    'Collectivité, EPCI': 'dot-orange-terre-battue-850-200',
    'Collectivité, intercommunalité': 'dot-blue-france-main-525',
    'Collectivité territoriale': 'dot-pink-macaron-925-125',
    Commune: 'dot-purple-glycine-850-200',
    'Conseil départemental': 'dot-purple-glycine-main-494',
    'Entreprise privée': 'dot-purple-glycine-950-100',
    EPCI: 'dot-green-tilleul-verveine-850',
    'Établissement public': 'dot-pink-macaron-850-200',
    Institution: 'dot-purple-glycine-975-75',
    Opérateur: 'dot-pink-tuile-850-200',
    'Organisme de formation': 'dot-purple-glycine-main-732',
    'Partenaire privé': 'dot-purple-glycine-100-950',
    'Préfecture régionale': 'dot-purple-glycine-925-125',
    Région: 'dot-green-tilleul-verveine-950',
    'Service public': 'dot-purple-glycine-200-850',
    'Structure associative': 'dot-pink-macaron-main-689',
  }

  return couleursMappings[type] ?? 'dot-pink-tuile-main-556'
}

// Conversion des classes CSS vers les couleurs hexadécimales pour le graphique
function getBackgroundColor(cssClass: string): string {
  const colorMappings: Record<string, string> = {
    'dot-black': '#000000',
    'dot-blue-france-main-525': '#6a6af4',
    'dot-green-menthe-main-548': '#009081',
    'dot-green-tilleul-verveine-850': '#e2cf58',
    'dot-green-tilleul-verveine-925': '#fbe769',
    'dot-green-tilleul-verveine-950': '#fceeac',
    'dot-grey-sans-coporteur': '#929292',
    'dot-orange-terre-battue-850-200': '#fcc0b0',
    // Pink colors
    'dot-pink-macaron-850-200': '#fcc0b4',
    'dot-pink-macaron-925-125': '#fddfda',
    'dot-pink-macaron-950-100': '#fee9e6',
    'dot-pink-macaron-975-75': '#fef4f2',
    'dot-pink-macaron-main-689': '#e18b76',
    'dot-pink-tuile-850-200': '#fcbfb7',
    'dot-pink-tuile-925-125': '#fddfdb',
    'dot-pink-tuile-950-100': '#fee9e7',
    'dot-pink-tuile-975-75': '#fef4f3',
    'dot-pink-tuile-main-556': '#ce614a',
    // Purple colors
    'dot-purple-glycine-100-950': '#e8d5f5',
    'dot-purple-glycine-200-850': '#d1aaea',
    'dot-purple-glycine-850-200': '#fbb8f6',
    'dot-purple-glycine-925-125': '#fddbfa',
    'dot-purple-glycine-950-100': '#fee7fc',
    'dot-purple-glycine-975-75': '#fef3fd',
    'dot-purple-glycine-main-494': '#a558a0',
    'dot-purple-glycine-main-732': '#6a4c93',
    'dot-purple-glycine-sun-113-moon-797': '#6e445a',
  }
  return colorMappings[cssClass] ?? '#929292'
}
