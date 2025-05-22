import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { AddDemandeDeSubventionRepository } from '@/use-cases/commands/shared/DemandeDeSubventionRepository'

export class PrismaDemandeDeSubventionRepository implements AddDemandeDeSubventionRepository {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean> {
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
      demandeDeSubvention.state.beneficiaires.map(async beneficiaireId =>
        client.beneficiaireSubventionRecord.create({
          data: {
            demandeDeSubventionId: demande.id,
            membreId: beneficiaireId,
          },
        }))
    )

    return true
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention> {
    const demande = await prisma.demandeDeSubventionRecord.findUniqueOrThrow({
      include: {
        beneficiaire: {
          include: {
            membre: true,
          },
        },
      },
      where: {
        id: Number(uid),
      },
    })
    const demandeDeSubvention = DemandeDeSubvention.create({
      beneficiaires: demande.beneficiaire.map((beneficiaire) => beneficiaire.membreId),
      dateDeCreation: demande.creation,
      derniereModification: demande.derniereModification,
      statut: demande.statut,
      subventionDemandee: demande.subventionDemandee,
      subventionEtp: demande.subventionEtp,
      subventionPrestation: demande.subventionPrestation,
      uid: { value: String(demande.id) },
      uidAction: { value: String(demande.actionId) },
      uidCreateur: String(demande.createurId),
      uidEnveloppeFinancement: { value: String(demande.enveloppeFinancementId) },
    })  

    if (!(demandeDeSubvention instanceof DemandeDeSubvention)) {
      throw new Error(demandeDeSubvention)
    }

    return demandeDeSubvention
  }
}
