import prisma from '../../prisma/prismaClient'
import { Comite } from '@/domain/Comite'
import { ComiteRepository } from '@/use-cases/commands/shared/ComiteRepository'

export class PrismaComiteRepository implements ComiteRepository {
  readonly #dataResource = prisma.comiteRecord

  async add(comite: Comite): Promise<boolean> {
    await this.#dataResource.create({
      data: {
        commentaire: comite.state.commentaire,
        creation: comite.state.dateDeCreation,
        date: comite.state.date,
        derniereEdition: comite.state.dateDeModification,
        editeurUtilisateurId: comite.state.uidEditeur,
        frequence: comite.state.frequence,
        gouvernanceDepartementCode: comite.state.uidGouvernance,
        type: comite.state.type,
      },
    })

    return true
  }

  async get(uid: Comite['uid']['state']['value']): Promise<Comite> {
    const record = await this.#dataResource.findUniqueOrThrow({
      include: {
        relationUtilisateur: true,
      },
      where: {
        id: Number(uid),
      },
    })

    const comite = Comite.create({
      commentaire: record.commentaire ?? undefined,
      date: record.date ?? undefined,
      dateDeCreation: record.creation,
      dateDeModification: record.derniereEdition,
      frequence: record.frequence,
      type: record.type,
      uid: { value: String(record.id) },
      uidEditeur: {
        email: record.relationUtilisateur?.ssoEmail ?? '',
        value: record.relationUtilisateur?.ssoId ?? '',
      },
      uidGouvernance: { value: record.gouvernanceDepartementCode },
    })

    if (!(comite instanceof Comite)) {
      throw new Error(comite)
    }

    return comite
  }

  async update(comite: Comite): Promise<void> {
    await this.#dataResource.update({
      data: {
        commentaire: comite.state.commentaire,
        creation: comite.state.dateDeCreation,
        date: comite.state.date ?? null,
        derniereEdition: comite.state.dateDeModification,
        editeurUtilisateurId: comite.state.uidEditeur,
        frequence: comite.state.frequence,
        type: comite.state.type,
      },
      where: {
        id: Number(comite.state.uid.value),
      },
    })
  }

  async drop(comite: Comite): Promise<void> {
    await this.#dataResource.delete({
      where: {
        id: Number(comite.state.uid.value),
      },
    })
  }
}
