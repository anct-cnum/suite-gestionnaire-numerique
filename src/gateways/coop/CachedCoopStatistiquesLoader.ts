import {
  StatistiquesCoopLoader,
  StatistiquesCoopReadModel,
  StatistiquesFilters,
} from '@/use-cases/queries/RecupererStatistiquesCoop'

export class CachedCoopStatistiquesLoader implements StatistiquesCoopLoader {
  private static readonly cache = new Map<string, CacheEntry>()
  private static readonly CACHE_DURATION_MS = 60 * 60 * 1000 // 1 heure de cache
  private readonly baseLoader: StatistiquesCoopLoader

  constructor(baseLoader: StatistiquesCoopLoader) {
    this.baseLoader = baseLoader
  }

  static forcerRafraichissement(cacheKey: string): void {
    this.cache.delete(cacheKey)

    console.log(`🔄 Cache forcé à se rafraîchir pour: ${cacheKey}`)
  }

  static obtenirStatistiquesCache(): {
    cles: Array<string>
    detailsEntrees: Array<{ age: number; cle: string }>
    taille: number
  } {
    const maintenant = Date.now()
    const detailsEntrees = Array.from(this.cache.entries()).map(([cle, entree]) => ({
      age: Math.round((maintenant - entree.timestamp) / 1000), // Age en secondes
      cle,
    }))

    return {
      cles: Array.from(this.cache.keys()),
      detailsEntrees,
      taille: this.cache.size,
    }
  }

  // Méthodes utilitaires pour la gestion du cache
  static viderCache(): void {
    const taille = this.cache.size
    this.cache.clear()

    console.log(`🗑️ Cache vidé (${taille} entrées supprimées)`)
  }

  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    const cacheKey = this.genererCleCache(filtres)
    const maintenant = Date.now()

    // Vérifier si on a une entrée en cache valide
    const entreeCache = CachedCoopStatistiquesLoader.cache.get(cacheKey)

    if (entreeCache && this.estCacheValide(entreeCache, maintenant)) {
      console.log(`📦 Cache HIT pour: ${cacheKey} (âge: ${Math.round((maintenant - entreeCache.timestamp) / 1000)}s)`)
      return entreeCache.data
    }

    // Si pas de cache ou cache expiré, interroger le loader de base

    console.log(`🌐 Cache MISS pour: ${cacheKey} - Lecture en cours...`)

    try {
      const donnees = await this.baseLoader.recupererStatistiques(filtres)

      // Mettre en cache les nouvelles données
      CachedCoopStatistiquesLoader.cache.set(cacheKey, {
        cacheKey,
        data: donnees,
        timestamp: maintenant,
      })

      // Nettoyer les vieilles entrées du cache
      this.nettoyerCache(maintenant)

      console.log(`✅ Données mises en cache pour: ${cacheKey}`)
      return donnees
    } catch (error) {
      // En cas d'erreur de lecture, essayer de retourner des données périmées si disponibles
      if (entreeCache) {
        console.warn(
          `⚠️ Erreur de lecture, utilisation du cache périmé pour: ${cacheKey} (âge: ${Math.round((maintenant - entreeCache.timestamp) / 1000)}s)`
        )
        return entreeCache.data
      }

      // Si pas de cache du tout, relancer l'erreur
      throw error
    }
  }

  private estCacheValide(entree: CacheEntry, maintenant: number): boolean {
    return maintenant - entree.timestamp < CachedCoopStatistiquesLoader.CACHE_DURATION_MS
  }

  private genererCleCache(filtres?: StatistiquesFilters): string {
    if (!filtres) {
      return 'france_entiere'
    }

    // Créer une clé unique basée sur les filtres
    const elements: Array<string> = []

    if (filtres.departements && filtres.departements.length > 0) {
      elements.push(
        `dept_${[...filtres.departements].sort((departementA, departementB) => departementA.localeCompare(departementB, 'fr')).join('_')}`
      )
    }

    if (typeof filtres.du === 'string' && filtres.du.trim() !== '') {
      elements.push(`du_${filtres.du}`)
    }

    if (typeof filtres.au === 'string' && filtres.au.trim() !== '') {
      elements.push(`au_${filtres.au}`)
    }

    if (filtres.communes && filtres.communes.length > 0) {
      elements.push(
        `com_${[...filtres.communes].sort((communeA, communeB) => communeA.localeCompare(communeB, 'fr')).join('_')}`
      )
    }

    if (filtres.types && filtres.types.length > 0) {
      elements.push(`types_${[...filtres.types].sort((typeA, typeB) => typeA.localeCompare(typeB, 'fr')).join('_')}`)
    }

    if (filtres.conseillerNumerique !== undefined) {
      elements.push(`cn_${filtres.conseillerNumerique ? '1' : '0'}`)
    }

    return elements.length > 0 ? elements.join('__') : 'france_entiere'
  }

  private nettoyerCache(maintenant: number): void {
    // Supprimer les entrées expirées depuis plus de 2x la durée du cache
    const seuilSuppression = maintenant - CachedCoopStatistiquesLoader.CACHE_DURATION_MS * 2

    for (const [cle, entree] of CachedCoopStatistiquesLoader.cache.entries()) {
      if (entree.timestamp < seuilSuppression) {
        CachedCoopStatistiquesLoader.cache.delete(cle)

        console.log(`🗑️ Cache supprimé pour: ${cle} (trop ancien)`)
      }
    }

    // Limiter la taille du cache à 100 entrées max
    if (CachedCoopStatistiquesLoader.cache.size > 100) {
      // Trier par timestamp et garder les 100 plus récentes
      const entries = Array.from(CachedCoopStatistiquesLoader.cache.entries())
        .sort((entree1, entree2) => entree2[1].timestamp - entree1[1].timestamp)
        .slice(0, 100)

      CachedCoopStatistiquesLoader.cache.clear()
      for (const [cle, valeur] of entries) {
        CachedCoopStatistiquesLoader.cache.set(cle, valeur)
      }

      console.log('🧹 Cache réduit à 100 entrées')
    }
  }
}

interface CacheEntry {
  cacheKey: string
  data: StatistiquesCoopReadModel
  timestamp: number
}
