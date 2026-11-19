import prisma from '../../../prisma/prismaClient'
import { Canal } from '@/domain/mesure-impact/Questionnaire'
import { ReponseEnregistree } from '@/domain/mesure-impact/Resultats'
import { ReponsesDeLHeureLoader } from '@/use-cases/mesure-impact/ProposerUnDefi'
import { ReponsesDeLaCampagneLoader } from '@/use-cases/mesure-impact/RecupererLesResultats'
import { SuiviDesReponsesLoader } from '@/use-cases/mesure-impact/RecupererVotreCampagne'

export class PrismaReponseLoader implements ReponsesDeLaCampagneLoader, ReponsesDeLHeureLoader, SuiviDesReponsesLoader {
  readonly #dataResource = prisma.mesureImpactReponseRecord

  async nombreDepuis(identifiantPublic: string, depuis: Date): Promise<number> {
    return this.#dataResource.count({
      where: { depot: { gte: depuis }, relationCampagne: { identifiantPublic } },
    })
  }

  async reponses(campagneUid: number): Promise<ReadonlyArray<ReponseEnregistree>> {
    const records = await this.#dataResource.findMany({
      orderBy: [{ depot: 'asc' }, { id: 'asc' }],
      select: { canal: true, contenu: true, depot: true, questionnaireVersion: true },
      where: { campagneId: campagneUid },
    })
    return records.map(({ canal, contenu, depot, questionnaireVersion }) => ({
      canal: CANAL_DU_DOMAINE[canal],
      contenu,
      depot,
      questionnaireVersion,
    }))
  }

  async suivi(campagneUid: number): Promise<Readonly<{ derniere: Date | null; nombre: number }>> {
    const { _count: nombre, _max: max } = await this.#dataResource.aggregate({
      _count: true,
      _max: { depot: true },
      where: { campagneId: campagneUid },
    })
    return { derniere: max.depot, nombre }
  }
}

const CANAL_DU_DOMAINE = {
  en_ligne: 'en-ligne',
  papier: 'papier',
  telephone: 'telephone',
} as const satisfies Record<string, Canal>
