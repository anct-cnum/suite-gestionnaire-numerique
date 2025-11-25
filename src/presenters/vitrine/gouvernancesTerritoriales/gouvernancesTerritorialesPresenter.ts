import { MembreDetailsViewModel } from '@/presenters/gouvernancePresenter'
import { toRoleViewModel } from '@/presenters/shared/role'
import { GouvernanceViewModel } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'
import { GouvernanceTerritorialeReadModel } from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

export function gouvernancesTerritorialesPresenter(
  readModel: GouvernanceTerritorialeReadModel
): GouvernancesTerritorialesViewModel {
  return {
    gouvernanceStats: {
    
      feuilleDeRoute: {
        action: readModel.statistiques.feuilleDeRoute.action,
        total: readModel.statistiques.feuilleDeRoute.total,
      },
      membre: {
        coporteur: readModel.statistiques.membre.coporteur,
        total: readModel.statistiques.membre.total,
      },
    },
    membres: {
      coporteurs: readModel.membres.map(toMembreDetailsViewModel),
      total: readModel.statistiques.membre.total,
    },
    territoire: readModel.territoire,
  }
}

function toMembreDetailsViewModel(membre: GouvernanceTerritorialeReadModel['membres'][number]): MembreDetailsViewModel {
  return {
    details: membre.details,
    logo: determinerLogo(membre.categorie),
    nom: membre.nom,
    roles: membre.roles.map(toRoleViewModel),
    type: membre.type,
  }
}

function determinerLogo(categorie: string): string {
  switch (categorie) {
    case 'commune':
    case 'epci':
      return 'government-line'
    case 'departement':
      return 'bank-line'
    case 'sgar':
      return 'government-line'
    case 'structure':
      return 'team-line'
    default:
      return 'building-line'
  }
}

type GouvernancesTerritorialesViewModel = Readonly<{
  gouvernanceStats: GouvernanceViewModel
  membres: Readonly<{
    coporteurs: ReadonlyArray<MembreDetailsViewModel>
    total: number
  }>
  territoire: string
}>
