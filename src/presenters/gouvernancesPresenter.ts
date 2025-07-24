
// eslint-disable-next-line import/no-restricted-paths
import { MontantPositif } from '@/components/shared/Montant/MontantPositif'
import { GouvernancesInfosReadModel } from '@/use-cases/queries/RecupererGouvernancesInfos'

export function gouvernancePresenter(viewModel: GouvernancesInfosReadModel) : GouvernancesViewModel {
  return {
    details: viewModel.details.map(detail => {
      return {
        actionCount : detail.actionCount,
        coFinancementMontant: MontantPositif
          .of(detail.coFinancementMontant)
          .orElseGet(() => MontantPositif.Zero),
        coporteurCount: detail.coporteurCount,
        departementCode: detail.departementCode,
        departementNom: detail.departementNom,
        departementRegion: detail.departementRegion,
        dotationEtatMontant: MontantPositif
          .of(detail.dotationEtatMontant)
          .orElseGet(() => MontantPositif.Zero),
        feuilleDeRouteCount: detail.feuilleDeRouteCount,
        membreCount: detail.membreCount,
        montantEngager: MontantPositif
          .of(detail.montantEngager)
          .orElseGet(() => MontantPositif.Zero),
      }
    } ),
    infos: {
      creditEngager: {
        creditEngagerGlobal: viewModel.infos.creditEngager.creditEngagerGlobal,
        envelopeGlobal: viewModel.infos.creditEngager.envelopeGlobal,
      },
      feuilleDeRoutes: {
        feuilleDeRouteCompte: viewModel.infos.feuilleDeRoutes.feuilleDeRouteCompte,
        subventionValiderCompte: viewModel.infos.feuilleDeRoutes.subventionValiderCompte,
      },
      gouvernancesTerritoriales: {
        gouvernanceCoporterCompte: viewModel.infos.gouvernancesTerritoriales.gouvernanceCoporterCompte,
        gouvernancesCompte: viewModel.infos.gouvernancesTerritoriales.gouvernancesCompte,
      },
    },
  }
}

export type GouvernancesViewModel = Readonly<{
  details: Array<GouvernanceDetails>
  infos: {
    creditEngager: {
      creditEngagerGlobal: string
      envelopeGlobal: string
    }
    feuilleDeRoutes: {
      feuilleDeRouteCompte: string
      subventionValiderCompte: string
    }
    gouvernancesTerritoriales: {
      gouvernanceCoporterCompte:string
      gouvernancesCompte: string
    }
  }
}>

interface GouvernanceDetails {
  actionCount: number
  coFinancementMontant: MontantPositif
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: MontantPositif
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: MontantPositif
}
