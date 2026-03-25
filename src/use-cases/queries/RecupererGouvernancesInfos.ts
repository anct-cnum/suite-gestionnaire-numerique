import { PrismaGouvernancesInfosLoader } from '@/gateways/PrismaGouvernancesInfosLoader'
import { QueryHandler } from '@/use-cases/QueryHandler'

export class RecupererGouvernancesInfos implements QueryHandler<Query, GouvernancesInfosReadModel> {
  async handle(query?: Query): Promise<GouvernancesInfosReadModel> {
    return new PrismaGouvernancesInfosLoader().get(query?.codesDepartements)
  }
}

export type GouvernancesInfosReadModel = Readonly<{
  details: ReadonlyArray<GouvernanceDetails>
}>
interface GouvernanceDetails {
  actionCount: number
  coFinancementMontant: number
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: number
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: Array<number>
}
type Query = Readonly<{
  codesDepartements?: ReadonlyArray<string>
}>
