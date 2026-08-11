import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { EligibiliteLabelConumLoader } from '@/use-cases/queries/RecupererEligibiliteLabelConum'

export class PrismaEligibiliteLabelConumLoader implements EligibiliteLabelConumLoader {
  readonly #dataResource = prisma.poste

  // Une structure est éligible au label si elle a reçu au moins un financement
  // Conseiller Numérique dans son historique (1 poste = 1 financement),
  // que le poste soit encore actif ou non.
  async estEligible(structureId: number): Promise<boolean> {
    try {
      const nombreDePostes = await this.#dataResource.count({
        where: { structure_id: structureId },
      })
      return nombreDePostes > 0
    } catch (error) {
      reportLoaderError(error, 'PrismaEligibiliteLabelConumLoader', {
        operation: 'estEligible',
        structureId,
      })
      return false
    }
  }
}
