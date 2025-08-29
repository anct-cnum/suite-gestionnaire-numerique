import { ApiCoopStatistiquesLoader } from '../apiCoop/ApiCoopStatistiquesLoader'
import { CachedApiCoopStatistiquesLoader } from '../apiCoop/CachedApiCoopStatistiquesLoader'
import { MockStatistiquesCoopLoader, MockConfig } from '../apiCoop/MockStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

/**
 * Parse le token FAKE_TOKEN pour extraire la configuration
 * Format: FAKE_TOKEN_[OK|NOK]_[delaySeconds]
 * Exemples:
 * - FAKE_TOKEN_OK_10 : répond OK après 10 secondes
 * - FAKE_TOKEN_NOK_0 : répond en erreur instantanément
 * - FAKE_TOKEN_OK_2 : répond OK après 2 secondes
 * - FAKE_TOKEN : comportement par défaut (OK après 0.8s)
 */
function parseFakeToken(token: string): MockConfig {
  const parts = token.split('_')
  
  // Format par défaut si pas de configuration
  if (parts.length < 3) {
    return { shouldFail: false, delaySeconds: 0.8 }
  }
  
  const status = parts[2] // OK ou NOK
  const delay = parts.length > 3 ? parseInt(parts[3], 10) : 0
  
  return {
    shouldFail: status === 'NOK',
    delaySeconds: isNaN(delay) ? 0 : delay
  }
}

export function createApiCoopStatistiquesLoader(avecCache = true): StatistiquesCoopLoader {
  const coopToken = process.env.COOP_TOKEN
  if (coopToken === undefined) {
    throw new Error('COOP_TOKEN is not set')
  }
  // Si le token commence par "FAKE_TOKEN", utiliser le mock loader
  if (coopToken.startsWith('FAKE_TOKEN')) {
    const config = parseFakeToken(coopToken)
    // eslint-disable-next-line no-console
    console.log(`🎭 Mode FAKE_TOKEN activé - ${config.shouldFail ? 'Erreur' : 'Succès'} après ${config.delaySeconds}s`)
    return new MockStatistiquesCoopLoader(config)
  }
  
  // Sinon, utiliser le vrai loader avec ou sans cache
  const baseLoader = new ApiCoopStatistiquesLoader()
  
  if (avecCache) {
    // eslint-disable-next-line no-console
    console.log('💾 Cache API Coop activé (durée: 1 heure)')
    return new CachedApiCoopStatistiquesLoader(baseLoader)
  }
  
  return baseLoader
}