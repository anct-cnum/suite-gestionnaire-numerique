import prisma from '../../prisma/prismaClient'
import { EnveloppesLoader, EnveloppesReadModel } from '@/use-cases/queries/RecupererLesEnveloppes'

export class PrismaEnveloppesLoader implements EnveloppesLoader {
  readonly #dataResource = prisma.enveloppeFinancementRecord

  async get(uidGouvernance: string): Promise<EnveloppesReadModel> {
    const enveloppes = await this.#dataResource.findMany({
      include: {
        departementsEnveloppes: {
          where: {
            departementCode: uidGouvernance,
          },
        },
      },
    })

    return {
      enveloppes: enveloppes.map(enveloppe => ({
        dateDeDebut: enveloppe.dateDeDebut,
        dateDeFin: enveloppe.dateDeFin,
        id: enveloppe.id,
        libelle: enveloppe.libelle,
        montant: enveloppe.departementsEnveloppes[0]?.plafond ?? enveloppe.montant,
      })),
    }
  }
} 