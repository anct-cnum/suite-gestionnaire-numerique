import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Action } from '@/domain/Action'
import { AddActionRepository, GetActionRepository } from '@/use-cases/commands/shared/ActionRepository'

export class PrismaActionRepository implements AddActionRepository, GetActionRepository {
  readonly #dataResource = prisma.actionRecord

  async add(action: Action, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.actionRecord.create({
      data: {
        besoins: action.state.besoins,
        budgetGlobal: Number(action.state.budgetGlobal),
        contexte: action.state.contexte,
        createurId: action.state.uidEditeur.value,
        creation: new Date(action.state.dateDeCreation),
        dateDeDebut: new Date(action.state.dateDeDebut),
        dateDeFin: new Date(action.state.dateDeFin),
        derniereModification: new Date(action.state.dateDeCreation),
        description: action.state.description,
        feuilleDeRouteId: Number(action.state.uidFeuilleDeRoute),
        nom: action.state.nom,

      },
    })

    return true
  }

  async get(uid: Action['uid']['state']['value']): Promise<Action> {
    const record = await this.#dataResource.findUniqueOrThrow({
      where: {
        id: Number(uid),
      },
    })

    const action = Action.create({
      besoins: record.besoins,
      budgetGlobal: record.budgetGlobal,
      contexte: record.contexte,
      dateDeCreation: record.creation,
      dateDeDebut: record.dateDeDebut,
      dateDeFin: record.dateDeFin,
      description: record.description,
      nom: record.nom,
      uid: { value: record.id },
      uidFeuilleDeRoute: { value: record.feuilleDeRouteId },
      uidPorteur: record.derniereModification,
    })

    if (!(action instanceof Action)) {
      throw new Error(action)
    }

    return action
  }
}
