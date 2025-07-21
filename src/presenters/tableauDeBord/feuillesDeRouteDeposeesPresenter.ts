import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesReadModel } from '@/use-cases/queries/RecupererFeuillesDeRouteDeposees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type FeuillesDeRouteDeposeesViewModel = Readonly<{
  nombreTotal: number
  sansDemandeSubvention: {
    backgroundColor: string
    color: string
    count: number
    label: string
  }
  ventilationParPerimetre: ReadonlyArray<{
    backgroundColor: string
    color: string
    count: number
    perimetre: string
  }>
}>

export function feuillesDeRouteDeposeesPresenter(
  readModel: ErrorReadModel | FeuillesDeRouteDeposeesReadModel
): ErrorViewModel | FeuillesDeRouteDeposeesViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    nombreTotal: readModel.nombreTotal,
    sansDemandeSubvention: {
      backgroundColor: getBackgroundColor('dot-grey-sans-coporteur'),
      color: 'dot-grey-sans-coporteur', // Réutilisation de la classe grise
      count: readModel.nombreSansDemandeSubvention,
      label: 'Sans demande de subvention',
    },
    ventilationParPerimetre: readModel.ventilationParPerimetre.map((item) => {
      const color = getColorForPerimetre(item.perimetre)
      return {
        backgroundColor: getBackgroundColor(color),
        color,
        count: item.count,
        perimetre: getLibelleForPerimetre(item.perimetre),
      }
    }),
  }
}

function isErrorReadModel(
  readModel: ErrorReadModel | FeuillesDeRouteDeposeesReadModel
): readModel is ErrorReadModel {
  return 'type' in readModel
}

// Mapping des périmètres vers les classes CSS vertes
function getColorForPerimetre(perimetre: string): string {
  const couleursMappings: Record<string, string> = {
    Autre: 'dot-green-archipel-main-648',
    departemental: 'dot-green-tilleul-verveine-main-707',
    groupementsDeCommunes: 'dot-green-menthe-main-548',
    regional: 'dot-green-emeraude-main-632',
  }
  
  return couleursMappings[perimetre] ?? 'dot-green-archipel-main-648'
}

// Mapping des périmètres vers les libellés affichés
function getLibelleForPerimetre(perimetre: string): string {
  const libelleMappings: Record<string, string> = {
    departemental: 'Feuilles de route départementales',
    groupementsDeCommunes: 'Feuilles de route infra-départementales',
    regional: 'Feuilles de route régionales',
  }
  
  return libelleMappings[perimetre] ?? perimetre
}

// Conversion des classes CSS vers les couleurs hexadécimales pour le graphique
function getBackgroundColor(cssClass: string): string {
  const colorMappings: Record<string, string> = {
    'dot-green-archipel-main-648': '#00A95F',
    'dot-green-emeraude-main-632': '#00AC8C',
    'dot-green-menthe-main-548': '#009081',
    'dot-green-tilleul-verveine-main-707': '#B8E986',
    'dot-grey-sans-coporteur': '#929292',
  }
  return colorMappings[cssClass] ?? '#929292'
}