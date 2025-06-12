import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { RepartitionSubventionGouvernanceLoader } from '@/use-cases/queries/RecupererRepartitionSubventionGouvernance'

export class PrismaRepartitionSubventionGouvernanceLoader implements RepartitionSubventionGouvernanceLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(uidGouvernance: string): Promise<ReadonlyMap<string, number>> {
    const demandesDeSubventionsValides = await prisma.demandeDeSubventionRecord.findMany({
      include: {
        enveloppe: true,
      },
      where: {
        action: {
          feuilleDeRoute: {
            gouvernanceDepartementCode: uidGouvernance,
          },
        },
        statut: {
          in: [
            StatutSubvention.ACCEPTEE,
            StatutSubvention.EN_COURS,
            StatutSubvention.DEPOSEE,
          ],
        },
      },
    })

    // cumul des subventions acceptées par enveloppe
    const repartitionParEnveloppe = 
            demandesDeSubventionsValides.reduce<Record<string, number>>((acc, demandeDeSubvention) => {
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