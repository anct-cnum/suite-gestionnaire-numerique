/* eslint-disable sort-keys */
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernancesTerritorialesReadModel } from '@/use-cases/queries/RecuperGouvernancesTerritoriales'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type GouvernancesTerritorialesViewModel = Readonly<{
  nombreTotal: number
  sansCoporteur: {
    color: string
    count: number
    label: string
  }
  ventilationParTypeDeCoporteur: ReadonlyArray<{
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
      color: 'dot-grey-sans-coporteur', // Classe CSS grise pour les gouvernances sans coporteur
      count: readModel.nombreSansCoporteur,
      label: 'Sans coporteur',
    },
    ventilationParTypeDeCoporteur: readModel.ventilationParTypeDeCoporteur.map((item) => ({
      color: getColorForType(item.type),
      count: item.count,
      type: item.type,
    })),
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