import { reportLoaderError } from '../shared/sentryErrorReporter'
import { chargerMembresConfirmes, synthetiserStructures } from '../shared/structuresMembresConfirmes'
import { CollectivitesLoader, CollectivitesReadModel } from '@/use-cases/queries/RecupererCollectivitesImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaCollectivitesLoader implements CollectivitesLoader {
  async get(): Promise<CollectivitesReadModel | ErrorReadModel> {
    try {
      return synthetiserStructures(await chargerMembresConfirmes(), 'collectivite')
    } catch (error) {
      reportLoaderError(error, 'PrismaCollectivitesLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des collectivités impliquées',
        type: 'error' as const,
      }
    }
  }
}
