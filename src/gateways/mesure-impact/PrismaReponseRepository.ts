import prisma from '../../../prisma/prismaClient'
import { Canal } from '@/domain/mesure-impact/Questionnaire'
import { Reponse } from '@/domain/mesure-impact/Reponse'
import { ReponseRepository } from '@/use-cases/mesure-impact/DeposerUneReponse'

export class PrismaReponseRepository implements ReponseRepository {
  readonly #dataResource = prisma.mesureImpactReponseRecord

  async ajouter(reponse: Reponse): Promise<void> {
    const { campagneUid, canal, contenu, depot, questionnaireVersion } = reponse.state
    await this.#dataResource.create({
      data: {
        campagneId: campagneUid,
        canal: CANAL_EN_BASE[canal],
        contenu,
        depot: new Date(depot),
        questionnaireVersion,
      },
    })
  }
}

const CANAL_EN_BASE = {
  'en-ligne': 'en_ligne',
  papier: 'papier',
  telephone: 'telephone',
} as const satisfies Record<Canal, string>
