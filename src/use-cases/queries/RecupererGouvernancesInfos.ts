import { PrismaGouvernancesInfosLoader } from '@/gateways/PrismaGouvernancesInfosLoader'
import { QueryHandler } from '@/use-cases/QueryHandler'

export class RecupererGouvernancesInfos implements QueryHandler<Query, GouvernancesInfosReadModel> {
  async handle(): Promise<GouvernancesInfosReadModel> {
    return  new PrismaGouvernancesInfosLoader().get()
  }
}

export type GouvernancesInfosReadModel = Readonly<{
  details: ReadonlyArray<GouvernanceDetails>
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
  coFinancementMontant: string
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: string
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: string
}
 type Query = Readonly<{
   match: string
   zone?: Readonly<{
     code: string
   }>
 }>
