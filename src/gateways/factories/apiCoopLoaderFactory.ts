import { CachedApiCoopStatistiquesLoader } from '../apiCoop/CachedApiCoopStatistiquesLoader'
import { PrismaStatistiquesCoopLoader } from '../PrismaStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function createApiCoopStatistiquesLoader(avecCache = true): StatistiquesCoopLoader {
  const baseLoader = new PrismaStatistiquesCoopLoader()

  if (avecCache) {
    console.log('💾 Cache statistiques Coop activé (durée: 1 heure)')
    return new CachedApiCoopStatistiquesLoader(baseLoader)
  }

  return baseLoader
}
