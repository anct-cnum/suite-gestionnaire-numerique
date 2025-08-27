import { ApiCoopStatistiquesLoader } from '../apiCoop/ApiCoopStatistiquesLoader'
import { CachedApiCoopStatistiquesLoader } from '../apiCoop/CachedApiCoopStatistiquesLoader'
import { MockStatistiquesCoopLoader } from '../apiCoop/MockStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function createApiCoopStatistiquesLoader(avecCache = true): StatistiquesCoopLoader {
  const coopToken = process.env.COOP_TOKEN
  
  // Si le token commence par "FAKE_TOKEN", utiliser le mock loader
  if (coopToken?.startsWith('FAKE_TOKEN')) {
    console.log('🎭 Mode FAKE_TOKEN activé - Utilisation des données simulées pour l\'API Coop')
    return new MockStatistiquesCoopLoader()
  }
  
  // Sinon, utiliser le vrai loader avec ou sans cache
  const baseLoader = new ApiCoopStatistiquesLoader()
  
  if (avecCache) {
    console.log('💾 Cache API Coop activé (durée: 1 heure)')
    return new CachedApiCoopStatistiquesLoader(baseLoader)
  }
  
  return baseLoader
}