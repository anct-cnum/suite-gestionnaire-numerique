import prisma from '../../prisma/prismaClient'
import { RepartitionSubventionGouvernanceLoader } from '@/use-cases/queries/RecupererRepartitionSubventionGouvernance'
import { StatutSubvention } from "@/domain/DemandeDeSubvention"

export class PrismaRepartitionSubventionGouvernanceLoader implements RepartitionSubventionGouvernanceLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(uidGouvernance: string): Promise<ReadonlyMap<string, number>> {
    const demandesDeSubventionsAccordees = await prisma.demandeDeSubventionRecord.findMany({
      include: {
        enveloppe: true,
      },
      where: {
        action: {
          feuilleDeRoute: {
            gouvernanceDepartementCode: uidGouvernance,
          },
        },
        statut: StatutSubvention.ACCEPTEE,
      },
    })

    // cumul des subventions acceptées par enveloppe
    const repartitionParEnveloppe = 
            demandesDeSubventionsAccordees.reduce<Record<string, number>>((acc, demandeDeSubvention) => {
              const enveloppeId = String(demandeDeSubvention.enveloppeFinancementId)
              const montantActuel = acc[enveloppeId] ?? 0
              return {
                ...acc,
                [enveloppeId]: montantActuel + demandeDeSubvention.subventionDemandee,
              }
            }, {})

    return new Map(Object.entries(repartitionParEnveloppe))
  }
}