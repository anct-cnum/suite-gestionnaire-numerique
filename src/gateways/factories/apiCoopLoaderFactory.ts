import { ApiCoopStatistiquesLoader } from '../apiCoop/ApiCoopStatistiquesLoader'
import { MockStatistiquesCoopLoader } from '../apiCoop/MockStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function createApiCoopStatistiquesLoader(): StatistiquesCoopLoader {
  const coopToken = process.env.COOP_TOKEN
  
  // Si le token commence par "FAKE_TOKEN", utiliser le mock loader
  if (coopToken?.startsWith('FAKE_TOKEN')) {
    return new MockStatistiquesCoopLoader()
  }
  
  // Sinon, utiliser le vrai loader
  return new ApiCoopStatistiquesLoader()
}