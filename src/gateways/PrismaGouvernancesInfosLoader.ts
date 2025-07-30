import prisma from '../../prisma/prismaClient'
import { GouvernancesInfosReadModel } from '@/use-cases/queries/RecupererGouvernancesInfos'

export class PrismaGouvernancesInfosLoader {
  async get(): Promise<GouvernancesInfosReadModel> {
    const gouvernances = await this.getDepartementParGouvernances()
    const membres = await this.getMemberesParGouvernancess()
    const feuilleDeRoutes = await this.getFeuilleDeRouteParGouvernance()
    const dotationsEtat = await this.getDotationEtatParGouvernance()
    const montantEngager = await this.getMontantEngagerParGouvernance()
    const cofinancement = await this.getCofinancementParGouvernance()
    const details = Array.from(gouvernances).map((gouvernance) => {
      const gouvernanceCode = gouvernance.code
      const membre = membres[gouvernanceCode]
      const feuilleDeRoute = feuilleDeRoutes[gouvernanceCode]
      const dotationsEtatGouvernance = dotationsEtat[gouvernanceCode]
      const montantEngagerGouvernance = montantEngager[gouvernanceCode]
      const cofinancementGouvernance = cofinancement[gouvernanceCode]
      return {
        /* eslint-disable */
        /* eslint-enable */
        actionCount: feuilleDeRoute?.nombreActions ?? 0,
        coFinancementMontant:
          cofinancementGouvernance !== null ? cofinancementGouvernance : 0,
        coporteurCount: membre?.coporteur ?? 0,
        departementCode: gouvernance.code,
        departementNom: gouvernance.nom,
        departementRegion: gouvernance.relationRegion.nom,
        dotationEtatMontant:
          dotationsEtatGouvernance !== null ? dotationsEtatGouvernance : 0,
        feuilleDeRouteCount: feuilleDeRoute?.nombreFeuillesDeRoute ?? 0,
        membreCount: membre?.membre ?? 0,
        montantEngager: montantEngagerGouvernance ?? [],

      }
    })

    return {
      details,
    }
  }

  private async getCofinancementParGouvernance(): Promise<Record<string, number>> {
    const cofinancements = await prisma.coFinancementRecord.findMany({
      include: {
        action: {
          include: {
            feuilleDeRoute: true,
          },
        },
      },
    })

    return cofinancements.reduce<Record<string, number>>((acc, cof) => {
      const code = cof.action.feuilleDeRoute.gouvernanceDepartementCode
      acc[code] = (acc[code] ?? 0) + cof.montant
      return acc
    }, {})
  }

  private async getDepartementParGouvernances(): Promise<
    Array<
      {
        code: string
        nom: string
        regionCode: string
      } & {
        relationRegion: {
          code: string
          nom: string
        }
      }
    >
  > {
    return prisma.departementRecord.findMany({
      include: {
        relationRegion: true,
      },
      where: {
        code: {
          not: 'zzz',
        },
      },
    })
  }

  private async getDotationEtatParGouvernance(): Promise<Record<string, null | number>> {
    const result = await prisma.departementEnveloppeRecord.groupBy({
      _sum: {
        plafond: true,
      },
      by: ['departementCode'],
    })

    return Object.fromEntries(
      // eslint-disable-next-line no-underscore-dangle
      result.map((dep) => [dep.departementCode, dep._sum.plafond])
    )
  }

  private async getFeuilleDeRouteParGouvernance(): Promise<
    Record<
      string,
      {
        gouvernanceDepartementCode: string
        nombreActions: number
        nombreFeuillesDeRoute: number
      }
    >
  > {
    const feuilles = await prisma.feuilleDeRouteRecord.findMany({
      include: {
        action: true,
      },
    })

    return feuilles.reduce<
      Record<
        string,
        {
          gouvernanceDepartementCode: string
          nombreActions: number
          nombreFeuillesDeRoute: number
        }
      >
    >((acc, feuilleDeRoute) => {
      const code = feuilleDeRoute.gouvernanceDepartementCode
      if (!(code in acc)) {
        acc[code] = {
          gouvernanceDepartementCode: code,
          nombreActions: 0,
          nombreFeuillesDeRoute: 0,
        }
      }

      acc[code].nombreFeuillesDeRoute += 1
      acc[code].nombreActions += feuilleDeRoute.action.length

      return acc
    }, {})
  }

  private async getMemberesParGouvernancess(): Promise<
    Record<string, { coporteur: number; membre: number }>
  > {
    const membres = await prisma.membreRecord.findMany({
      where: {
        statut: 'confirme',
      },
    })
    return membres.reduce<Record<string, { coporteur: number; membre: number }>>((acc, membre) => {
      const code = membre.gouvernanceDepartementCode
      if (!(code in acc)) {
        acc[code] = { coporteur: 0, membre: 0 }
      }
      acc[code].membre += 1
      if (membre.isCoporteur) {
        acc[code].coporteur += 1
      }
      return acc
    }, {})
  }

  private async getMontantEngagerParGouvernance(): Promise<Record<string, Array<number>>> {
    const demandes = await prisma.demandeDeSubventionRecord.findMany({
      include: {
        action: {
          include: {
            feuilleDeRoute: true,
          },
        },
      },
      where: {
        statut: 'acceptee',
      },
    })
    return demandes.reduce<Record<string, Array<number>>>((acc, demande) => {
      const code = demande.action.feuilleDeRoute.gouvernanceDepartementCode
      if (!code) {
        return acc
      }

      const montant = (demande.subventionEtp ?? 0) + (demande.subventionPrestation ?? 0)

      if (!(code in acc)) {
        acc[code] = []
      }

      acc[code].push(montant)
      return acc
    }, {})
  }
}
