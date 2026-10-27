import { reportLoaderError } from '../shared/sentryErrorReporter'
import { chargerMembresConfirmes, synthetiserStructures } from '../shared/structuresMembresConfirmes'
import {
  AutresStructuresLoader,
  AutresStructuresReadModel,
} from '@/use-cases/queries/RecupererAutresStructuresImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaAutresStructuresLoader implements AutresStructuresLoader {
  async get(): Promise<AutresStructuresReadModel | ErrorReadModel> {
    try {
      return synthetiserStructures(await chargerMembresConfirmes(), 'autreStructure')
    } catch (error) {
      reportLoaderError(error, 'PrismaAutresStructuresLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des autres structures impliquées',
        type: 'error' as const,
      }
    }
  }
}
