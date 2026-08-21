import prisma from '../../prisma/prismaClient'
import {
  GouvernanceReadModel,
  RecupererTableauDeBordGouvernanceLoader,
} from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernanceTableauDeBordLoader implements RecupererTableauDeBordGouvernanceLoader {
  async get(territoire: string): Promise<ErrorReadModel | GouvernanceReadModel> {
    return this.#compter(territoire === 'France' ? { not: 'zzz' } : territoire)
  }

  // Agrégat régional : cumul des gouvernances des départements de la région (liens de détail masqués côté bloc).
  async getPourDepartements(codes: ReadonlyArray<string>): Promise<ErrorReadModel | GouvernanceReadModel> {
    return this.#compter({ in: [...codes] })
  }

  async #compter(gouvernanceDepartementCode: FiltreDepartementCode): Promise<GouvernanceReadModel> {
    // Compter les membres de la gouvernance (non supprimés)
    const membresGouvernance = await prisma.membreRecord.findMany({
      where: {
        gouvernanceDepartementCode,
        statut: {
          not: 'supprime', // Exclure les membres supprimés
        },
      },
    })

    const totalMembres = membresGouvernance.length
    const coporteurs = membresGouvernance.filter((membre) => membre.isCoporteur).length

    // Compter les feuilles de route et actions
    const feuillesDeRoute = await prisma.feuilleDeRouteRecord.findMany({
      include: {
        action: true,
      },
      where: {
        gouvernanceDepartementCode,
      },
    })

    const totalFeuillesDeRoute = feuillesDeRoute.length
    const totalActions = feuillesDeRoute.reduce((acc, feuille) => acc + feuille.action.length, 0)

    return {
      feuilleDeRoute: {
        action: totalActions,
        total: totalFeuillesDeRoute,
      },
      membre: {
        coporteur: coporteurs,
        total: totalMembres,
      },
    }
  }
}

// Filtre commun aux where Prisma de MembreRecord et FeuilleDeRouteRecord (les StringFilter générés sont par modèle).
type FiltreDepartementCode = Readonly<{ in: Array<string> }> | Readonly<{ not: string }> | string
