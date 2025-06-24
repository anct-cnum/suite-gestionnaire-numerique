import prisma from '../../prisma/prismaClient'
import { LieuxInclusionNumeriqueLoader, LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'

export class PrismaLieuxInclusionNumeriqueLoader implements LieuxInclusionNumeriqueLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<LieuxInclusionNumeriqueReadModel> {
    const result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
      SELECT COUNT(*) AS nb_lieux
      FROM main.personne_lieux_activites pla
      JOIN main.structure s ON pla.structure_id = s.id
      JOIN main.adresse a ON s.adresse_id = a.id
      WHERE a.departement = ${codeDepartement}
    `

    return {
      departement: codeDepartement,
      nombreLieux: Number(result[0]?.nb_lieux ?? 0),
    }
  }
} 