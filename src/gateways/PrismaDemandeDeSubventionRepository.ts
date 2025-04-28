import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { AddDemandeDeSubventionRepository } from '@/use-cases/commands/shared/DemandeDeSubventionRepository'

export class PrismaDemandeDeSubventionRepository implements AddDemandeDeSubventionRepository {
  readonly #dataResource = prisma.demandeDeSubventionRecord

  async add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    const demande = await client.demandeDeSubventionRecord.create({
      data: {
        actionId: Number(demandeDeSubvention.state.uidAction),
        createurId: 1, // Default for testing, should be replaced in production
        creation: new Date(demandeDeSubvention.state.dateDeCreation),
        derniereModification: new Date(demandeDeSubvention.state.derniereModification),
        enveloppeFinancementId: Number(demandeDeSubvention.state.uidEnveloppeFinancement),
        statut: demandeDeSubvention.state.statut,
        subventionDemandee: demandeDeSubvention.state.subventionDemandee,
        subventionEtp: demandeDeSubvention.state.subventionEtp,
        subventionPrestation: demandeDeSubvention.state.subventionPrestation,
      },
    })

    for (const beneficiaire of demandeDeSubvention.state.beneficiaires) {
      await client.beneficiaireSubventionRecord.create({
        data: {
          demandeDeSubventionId: demande.id,
          membreId: beneficiaire,
        },
      })
    }

    return true
  }
}
