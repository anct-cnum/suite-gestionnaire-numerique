import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesReadModel } from '@/use-cases/queries/RecupererFeuillesDeRouteDeposees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type FeuillesDeRouteDeposeesViewModel = Readonly<{
  nombreTotal: number
  sansDemandeSubvention: {
    color: string
    count: number
    label: string
  }
  ventilationParPerimetre: ReadonlyArray<{
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
      color: 'dot-grey-sans-coporteur', // Réutilisation de la classe grise
      count: readModel.nombreSansDemandeSubvention,
      label: 'Sans demande de subvention',
    },
    ventilationParPerimetre: readModel.ventilationParPerimetre.map((item) => ({
      color: getColorForPerimetre(item.perimetre),
      count: item.count,
      perimetre: item.perimetre,
    })),
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