import { PrismaClient } from '@prisma/client'

import { IndicesDeFragiliteLoader, IndicesDeFragiliteReadModel } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'

export class PrismaIndicesDeFragiliteLoader implements IndicesDeFragiliteLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async get(codeDepartement: string): Promise<IndicesDeFragiliteReadModel> {
    console.log('codeDepartement', codeDepartement)
    const communes = await this.#prisma.$queryRaw<Array<CommuneWithScore>>`
      SELECT i.code_insee, i.score 
      FROM admin.ifn_commune i
      WHERE i.code_insee LIKE '${codeDepartement}%'
    `

    return {
      communes: communes.map(commune => ({
        codeInsee: commune.code_insee,
        score: commune.score ?? null,
      })),
      departement: codeDepartement,
    }
  }
}

interface CommuneWithScore {
  code_insee: string
  score: null | number
} 