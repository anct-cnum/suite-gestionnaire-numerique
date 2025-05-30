import prisma from '../../prisma/prismaClient'
import { EnveloppesLoader, EnveloppesReadModel } from '@/use-cases/queries/RecupererLesEnveloppes'

export class PrismaEnveloppesLoader implements EnveloppesLoader {
  readonly #dataResource = prisma.enveloppeFinancementRecord

  async get(uidGouvernance: string): Promise<EnveloppesReadModel> {
    const enveloppes = await this.#dataResource.findMany({
      include: {
        departementsEnveloppes: true,
      },
    })
    return {
      enveloppes: enveloppes.map(enveloppe => {
        const estVentile = enveloppe.departementsEnveloppes.length > 0
        const plafondDepartement = enveloppe.departementsEnveloppes.find(
          de => de.departementCode === uidGouvernance
        )?.plafond

        return {
          budget: estVentile
            ? {
              total: enveloppe.montant,
              type: 'ventile',
              ventile: plafondDepartement ?? 0,
            }
            : {
              total: enveloppe.montant,
              type: 'nonVentile',
            },
          dateDeDebut: enveloppe.dateDeDebut,
          dateDeFin: enveloppe.dateDeFin,
          id: enveloppe.id,
          libelle: enveloppe.libelle,
        }
      }),
    }
  }
} 