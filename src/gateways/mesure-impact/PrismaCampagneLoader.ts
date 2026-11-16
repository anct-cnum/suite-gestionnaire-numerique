import prisma from '../../../prisma/prismaClient'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { CampagneLoader } from '@/use-cases/mesure-impact/DeposerUneReponse'
import { CampagnePubliqueLoader } from '@/use-cases/mesure-impact/RecupererLaCampagnePublique'

export class PrismaCampagneLoader implements CampagneLoader, CampagnePubliqueLoader {
  readonly #dataResource = prisma.mesureImpactCampagneRecord

  async parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null> {
    const record = await this.#dataResource.findUnique({ where: { identifiantPublic } })
    if (record === null) {
      return null
    }
    return Campagne.create({
      fermeture: record.fermeture,
      identifiantPublic: record.identifiantPublic,
      libelleTerritoire: record.libelleTerritoire,
      nom: record.nom,
      ouverture: record.ouverture,
      questionnaireVersion: record.questionnaireVersion,
      structureId: record.structureId,
      uid: { value: record.id },
    })
  }
}
