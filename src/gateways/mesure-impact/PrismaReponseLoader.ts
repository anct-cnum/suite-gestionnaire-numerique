import prisma from '../../../prisma/prismaClient'
import { ReponsesDeLHeureLoader } from '@/use-cases/mesure-impact/ProposerUnDefi'

export class PrismaReponseLoader implements ReponsesDeLHeureLoader {
  readonly #dataResource = prisma.mesureImpactReponseRecord

  async nombreDepuis(identifiantPublic: string, depuis: Date): Promise<number> {
    return this.#dataResource.count({
      where: { depot: { gte: depuis }, relationCampagne: { identifiantPublic } },
    })
  }
}
