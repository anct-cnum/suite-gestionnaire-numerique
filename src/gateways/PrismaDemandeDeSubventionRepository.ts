import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { AddDemandeDeSubventionRepository } from '@/use-cases/commands/shared/DemandeDeSubventionRepository'

export class PrismaDemandeDeSubventionRepository implements AddDemandeDeSubventionRepository {
  async add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    const demande = await client.demandeDeSubventionRecord.create({
      data: {
        action: {
          connect: {
            id: Number(demandeDeSubvention.state.uidAction),
          },
        },
        
        creation: new Date(demandeDeSubvention.state.dateDeCreation),
        derniereModification: new Date(demandeDeSubvention.state.derniereModification),
        enveloppe: {
          connect: {
            id: Number(demandeDeSubvention.state.uidEnveloppeFinancement),
          },
        },
        statut: demandeDeSubvention.state.statut,
        subventionDemandee: demandeDeSubvention.state.subventionDemandee,
        subventionEtp: demandeDeSubvention.state.subventionEtp,
        subventionPrestation: demandeDeSubvention.state.subventionPrestation,
        utilisateur: {
          connect: {
            id:  Number(1),
          },
        },
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
