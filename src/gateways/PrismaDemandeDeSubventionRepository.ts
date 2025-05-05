import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { AddDemandeDeSubventionRepository } from '@/use-cases/commands/shared/DemandeDeSubventionRepository'

export class PrismaDemandeDeSubventionRepository implements AddDemandeDeSubventionRepository {
  async add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    const demande = await client.demandeDeSubventionRecord.create({
      data: {
        actionId: Number(demandeDeSubvention.state.uidAction),
        createurId: Number(demandeDeSubvention.state.uidCreateur),
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
}
