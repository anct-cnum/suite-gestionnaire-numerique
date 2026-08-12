import { ApiCoopStatistiquesLoader } from '../apiCoop/ApiCoopStatistiquesLoader'
import { CachedApiCoopStatistiquesLoader } from '../apiCoop/CachedApiCoopStatistiquesLoader'
import { MockConfig, MockStatistiquesCoopLoader } from '../apiCoop/MockStatistiquesCoopLoader'
import { PrismaStatistiquesCoopLoader } from '../PrismaStatistiquesCoopLoader'
import { StatistiquesCoopLoader } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function createApiCoopStatistiquesLoader(avecCache = true): StatistiquesCoopLoader {
  const coopToken = process.env.COOP_TOKEN
  // Si le token commence par "FAKE_TOKEN", utiliser le mock loader (dev sans schéma coop en base)
  if (coopToken?.startsWith('FAKE_TOKEN') === true) {
    const config = parseFakeToken(coopToken)

    console.log(`🎭 Mode FAKE_TOKEN activé - ${config.shouldFail ? 'Erreur' : 'Succès'} après ${config.delaySeconds}s`)
    return new MockStatistiquesCoopLoader(config)
  }

  // Levier de repli (#1793) : COOP_STATS_SOURCE=api pour revenir à l'appel HTTP API Coop sans redéployer.
  const baseLoader =
    process.env.COOP_STATS_SOURCE === 'api' ? new ApiCoopStatistiquesLoader() : new PrismaStatistiquesCoopLoader()

  if (avecCache) {
    console.log('💾 Cache statistiques Coop activé (durée: 1 heure)')
    return new CachedApiCoopStatistiquesLoader(baseLoader)
  }

  return baseLoader
}

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
    return { delaySeconds: 0.8, shouldFail: false }
  }

  const status = parts[2] // OK ou NOK
  const delay = parts.length > 3 ? parseInt(parts[3], 10) : 0

  return {
    delaySeconds: isNaN(delay) ? 0 : delay,
    shouldFail: status === 'NOK',
  }
}
