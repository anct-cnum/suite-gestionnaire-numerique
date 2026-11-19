import { MesureImpactCampagneRecord } from '../../../prisma/generated/client'
import prisma from '../../../prisma/prismaClient'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { CampagneLoader } from '@/use-cases/mesure-impact/DeposerUneReponse'
import { CampagnePubliqueLoader } from '@/use-cases/mesure-impact/RecupererLaCampagnePublique'
import { CampagnesDeLaStructureLoader } from '@/use-cases/mesure-impact/RecupererLesCampagnesDeLaStructure'

export class PrismaCampagneLoader implements CampagneLoader, CampagnePubliqueLoader, CampagnesDeLaStructureLoader {
  readonly #dataResource = prisma.mesureImpactCampagneRecord

  async deLaStructure(structureId: number): Promise<ReadonlyArray<Campagne>> {
    const records = await this.#dataResource.findMany({ orderBy: { ouverture: 'desc' }, where: { structureId } })
    return records.map((record) => this.#versCampagne(record))
  }

  async parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null> {
    const record = await this.#dataResource.findUnique({ where: { identifiantPublic } })
    return record === null ? null : this.#versCampagne(record)
  }

  #versCampagne(record: MesureImpactCampagneRecord): Campagne {
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
