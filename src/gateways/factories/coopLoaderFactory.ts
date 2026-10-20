import { CachedCoopStatistiquesLoader } from '../coop/CachedCoopStatistiquesLoader'
import { PrismaStatistiquesCoopLoader } from '../PrismaStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function createCoopStatistiquesLoader(avecCache = true): StatistiquesCoopLoader {
  const baseLoader = new PrismaStatistiquesCoopLoader()

  if (avecCache) {
    console.log('💾 Cache statistiques Coop activé (durée: 1 heure)')
    return new CachedCoopStatistiquesLoader(baseLoader)
  }

  return baseLoader
}
