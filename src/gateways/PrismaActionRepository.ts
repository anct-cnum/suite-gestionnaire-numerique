import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Action, ActionUid } from '@/domain/Action'
import { DemandeDeSubventionUid } from '@/domain/DemandeDeSubvention'
import {
  AddActionRepository,
  GetActionRepository,
  SupprimerActionRepository,
} from '@/use-cases/commands/shared/ActionRepository'
import { RecordId } from '@/use-cases/commands/shared/Repository'

// istanbul ignore next @preserve
export class PrismaActionRepository
implements AddActionRepository, GetActionRepository, SupprimerActionRepository
{
  readonly #dataResource = prisma.actionRecord

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async add(action: Action, tx?: Prisma.TransactionClient): Promise<RecordId> {
    const client = tx ?? prisma
    const utilisateurResource = client.utilisateurRecord
    const user = await utilisateurResource.findUniqueOrThrow({
      where: {
        ssoId: action.state.uidCreateur,
      },
    })
    const actionRecord = await client.actionRecord.create({
      data: {
        besoins: action.state.besoins,
        budgetGlobal: Number(action.state.budgetGlobal),
        contexte: action.state.contexte,
        createurId: user.id,
        creation: new Date(action.state.dateDeCreation),
        dateDeDebut: new Date(action.state.dateDeDebut),
        dateDeFin: action.state.dateDeFin ? new Date(action.state.dateDeFin) : '',
        derniereModification: new Date(action.state.dateDeCreation),
        description: action.state.description,
        feuilleDeRouteId: Number(action.state.uidFeuilleDeRoute),
        nom: action.state.nom,
        porteurAction: {
          create: action.state.uidPorteurs.map((uidPorteur) => ({
            membreId: uidPorteur,
          })),
        },
      },
    })

    return actionRecord.id
  }

  async get(uid: Action['uid']['state']['value']): Promise<Action> {
    const actionRecord = await this.#dataResource.findUniqueOrThrow({
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
        porteurAction: true,
        utilisateur: true,
      },
      where: {
        id: Number(uid),
      },
    })
    const destinataires = actionRecord.demandesDeSubvention.flatMap((demande) =>
      demande.beneficiaire.map((beneficiaire) => beneficiaire.membreId))

    const action = Action.create({
      besoins: actionRecord.besoins,
      budgetGlobal: actionRecord.budgetGlobal,
      contexte: actionRecord.contexte,
      dateDeCreation: actionRecord.creation,
      dateDeDebut: actionRecord.dateDeDebut.getFullYear().toString(),
      dateDeFin: actionRecord.dateDeFin.getFullYear().toString(),
      demandeDeSubventionUid: actionRecord.demandesDeSubvention.length > 0 ? actionRecord.demandesDeSubvention[0].id.toString() : '',
      description: actionRecord.description,
      destinataires,
      nom: actionRecord.nom,
      uid: { value: String(actionRecord.id) },
      uidCreateur: actionRecord.utilisateur.ssoId,
      uidFeuilleDeRoute: { value: String(actionRecord.feuilleDeRouteId) },
      uidPorteurs: actionRecord.porteurAction.map((porteur) => porteur.membreId),
    })

    if (!(action instanceof Action)) {
      throw new Error(action)
    }

    return action
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async supprimer(actionId: ActionUid, demandeDeSubventionId: DemandeDeSubventionUid): Promise<boolean> {
    const result = await prisma.$transaction([
      prisma.beneficiaireSubventionRecord.deleteMany(
        { where: { demandeDeSubventionId: Number(demandeDeSubventionId.state.value) } }
      ),
      prisma.demandeDeSubventionRecord.deleteMany({ where: { actionId: Number(actionId.state.value) } }),
      prisma.actionRecord.deleteMany({ where: { id: Number(actionId.state.value) } }),
    ])
    return result[0].count <= 1 && result[1].count === 1
  }
}
