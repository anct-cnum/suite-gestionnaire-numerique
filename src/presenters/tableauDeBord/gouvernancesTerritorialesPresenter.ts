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

function isErrorReadModel(
  readModel: ErrorReadModel | GouvernancesTerritorialesReadModel
): readModel is ErrorReadModel {
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
    'dot-blue-france-main-525': '#000091',
    'dot-green-menthe-main-548': '#009081',
    'dot-green-tilleul-verveine-850': '#8db836',
    'dot-green-tilleul-verveine-925': '#b9d15e',
    'dot-green-tilleul-verveine-950': '#5a7d2e',
    'dot-grey-sans-coporteur': '#929292',
    'dot-orange-terre-battue-850-200': '#e17b47',
    // Pink colors
    'dot-pink-macaron-850-200': '#f5b7c7',
    'dot-pink-macaron-925-125': '#fad7e1',
    'dot-pink-macaron-950-100': '#fce9ed',
    'dot-pink-macaron-975-75': '#fef4f6',
    'dot-pink-macaron-main-689': '#e18b96',
    'dot-pink-tuile-850-200': '#e8a598',
    'dot-pink-tuile-925-125': '#f3d2ca',
    'dot-pink-tuile-950-100': '#f9e9e5',
    'dot-pink-tuile-975-75': '#fcf4f2',
    'dot-pink-tuile-main-556': '#ce614a',
    // Purple colors
    'dot-purple-glycine-100-950': '#e8d5f5',
    'dot-purple-glycine-200-850': '#d1aaea',
    'dot-purple-glycine-850-200': '#b19dd1',
    'dot-purple-glycine-925-125': '#c4a9d8',
    'dot-purple-glycine-950-100': '#c4a9d8',
    'dot-purple-glycine-975-75': '#f5f0fc',
    'dot-purple-glycine-main-494': '#8b5fb4',
    'dot-purple-glycine-main-732': '#6a4c93',
    'dot-purple-glycine-sun-113-moon-797': '#d4c5e8',
  }
  return colorMappings[cssClass] ?? '#929292'
}