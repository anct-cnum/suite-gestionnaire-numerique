import prisma from '../../prisma/prismaClient'
import { AppariementLieuRepository, DecisionAppariement } from '@/use-cases/commands/DeciderAppariementLieu'

export class PrismaAppariementLieuRepository implements AppariementLieuRepository {
  readonly #dataResource = prisma.main_lieu_appariement

  // Contrat d'écriture MIN sur main.lieu_appariement (table Flyway dataspace, V152) :
  // uniquement statut / decide_par / decide_le, et uniquement depuis « a_valider »
  // — une décision prise n'est jamais réécrite, ni par MIN ni par le DAG.
  async decider(decision: DecisionAppariement): Promise<number> {
    const { count } = await this.#dataResource.updateMany({
      data: {
        decide_le: decision.decideLe,
        decide_par: decision.decidePar,
        statut: decision.statut,
      },
      where: {
        carto_record_id: decision.cartoRecordId,
        lieu_id: decision.lieuId,
        statut: 'a_valider',
      },
    })

    return count
  }
}
