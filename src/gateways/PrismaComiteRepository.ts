import { Prisma } from '@prisma/client'

import { Comite } from '@/domain/Comite'
import { AddComiteRepository } from '@/use-cases/commands/shared/ComiteRepository'

export class PrismaComiteRepository implements AddComiteRepository {
  readonly #dataResource: Prisma.ComiteRecordDelegate

  constructor(dataResource: Prisma.ComiteRecordDelegate) {
    this.#dataResource = dataResource
  }

  async add(comite: Comite): Promise<boolean> {
    await this.#dataResource.create({
      data: {
        commentaire: comite.state.commentaire,
        creation: comite.state.dateDeCreation,
        dateProchainComite: comite.state.date,
        derniereEdition: comite.state.dateDeModification,
        editeurUtilisateurId: comite.state.uidUtilisateurLAyantModifie,
        frequence: comite.state.frequence,
        gouvernanceId: Number(comite.state.uidGouvernance),
        type: comite.state.type,
      },
    })

    return true
  }
}
