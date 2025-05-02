import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Action } from '@/domain/Action'
import { AddActionRepository, GetActionRepository } from '@/use-cases/commands/shared/ActionRepository'
import { RecordId } from '@/use-cases/commands/shared/Repository'

export class PrismaActionRepository implements AddActionRepository, GetActionRepository {
  readonly #dataResource = prisma.actionRecord
  readonly #utilisateurResource = prisma.utilisateurRecord

  async add(action: Action, tx?: Prisma.TransactionClient): Promise<RecordId> {
    const client = tx ?? prisma
    const user = await this.#utilisateurResource.findUniqueOrThrow({
      where: {
        ssoId: action.state.uidCreateur,
      },
    })
    console.log('ACTION BLIIII', action.state)
    const actionRecord = await client.actionRecord.create({
      data: {
        besoins: action.state.besoins,
        budgetGlobal: Number(action.state.budgetGlobal),
        contexte: action.state.contexte,
        createurId: user.id,
        creation: new Date(action.state.dateDeCreation),
        dateDeDebut: new Date(action.state.dateDeDebut),
        dateDeFin: new Date(action.state.dateDeFin),
        derniereModification: new Date(action.state.dateDeCreation),
        description: action.state.description,
        feuilleDeRouteId: Number(action.state.uidFeuilleDeRoute),
        nom: action.state.nom,
      },
    })
    
    return actionRecord.id
  }

  async get(uid: Action['uid']['state']['value']): Promise<Action> {
    const record = await this.#dataResource.findUniqueOrThrow({
      include: {
        demandesDeSubvention: {
          include: {
            beneficiaire: {
              include: {
                membre: true,
              },
            },
          },
        },
        utilisateur: true,
      },
      where: {
        id: Number(uid),
      },
    })
    const beneficiaires = record.demandesDeSubvention.flatMap((demande) =>
      demande.beneficiaire.map((beneficiaire) => beneficiaire.membreId))
    const action = Action.create({
      beneficiaires,
      besoins: record.besoins,
      budgetGlobal: record.budgetGlobal,
      contexte: record.contexte,
      dateDeCreation: record.creation,
      dateDeDebut: record.dateDeDebut,
      dateDeFin: record.dateDeFin,
      description: record.description,
      nom: record.nom,
      uid: { value: String(record.id) },
      uidCreateur: record.utilisateur.ssoId,
      uidFeuilleDeRoute: { value: String(record.feuilleDeRouteId) },
      uidPorteur: String(record.createurId),
    })

    if (!(action instanceof Action)) {
      throw new Error(action)
    }

    return action
  }
}
