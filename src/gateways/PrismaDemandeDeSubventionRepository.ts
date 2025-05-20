import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import {
  AddDemandeDeSubventionRepository,
  //GetDemandeDeSubventionRepository,
} from '@/use-cases/commands/shared/DemandeDeSubventionRepository'

export class PrismaDemandeDeSubventionRepository
implements AddDemandeDeSubventionRepository
{
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async add(
    demandeDeSubvention: DemandeDeSubvention,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const client = tx ?? prisma

    const utilisateurResource = client.utilisateurRecord

    const user = await utilisateurResource.findUniqueOrThrow({
      where: {
        ssoId: demandeDeSubvention.state.uidCreateur,
      },
    })
    const demande = await client.demandeDeSubventionRecord.create({
      data: {
        actionId: Number(demandeDeSubvention.state.uidAction),
        createurId: user.id,
        creation: new Date(demandeDeSubvention.state.dateDeCreation),
        derniereModification: new Date(demandeDeSubvention.state.derniereModification),
        enveloppeFinancementId: Number(demandeDeSubvention.state.uidEnveloppeFinancement),
        statut: demandeDeSubvention.state.statut,
        subventionDemandee: demandeDeSubvention.state.subventionDemandee,
        subventionEtp: demandeDeSubvention.state.subventionEtp,
        subventionPrestation: demandeDeSubvention.state.subventionPrestation,
      },
    })

    // Création des associations avec les bénéficiaires
    await Promise.all(
      demandeDeSubvention.state.beneficiaires.map(async (beneficiaireId) =>
        client.beneficiaireSubventionRecord.create({
          data: {
            demandeDeSubventionId: demande.id,
            membreId: beneficiaireId,
          },
        }))
    )

    return true
  }

  // async get(
  //   actionUid: ActionUid,
  //   tx?: Prisma.TransactionClient
  // ): Promise<DemandeDeSubvention> {
  //   const client = tx ?? prisma
  //   const demandeDeSubvention = client.demandeDeSubventionRecord
  //   const demande = await demandeDeSubvention.findUniqueOrThrow({
  //     where: {
  //       actionId: actionUid.state.value,
  //     },
  //   })

  // return DemandeDeSubvention.create(
  //   "beneficiaires",
  //   demande.dateDeCreation,
  //   derniereModification,
  //   demande.st,
  //   subventionDemandee,
  //   subventionEtp,
  //   subventionPrestation,
  //   uid,
  //   uidAction,
  //   uidCreateur,
  //   uidEnveloppeFinancement,
  // )
  //}
}
