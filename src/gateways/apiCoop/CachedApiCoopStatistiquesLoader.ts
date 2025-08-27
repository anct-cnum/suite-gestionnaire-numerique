import { StatistiquesCoopLoader, StatistiquesCoopReadModel, StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'

interface CacheEntry {
  data: StatistiquesCoopReadModel
  timestamp: number
  cacheKey: string
}

export class CachedApiCoopStatistiquesLoader implements StatistiquesCoopLoader {
  private static cache: Map<string, CacheEntry> = new Map()
  private static readonly CACHE_DURATION_MS = 60 * 60 * 1000 // 1 heure de cache
  
  constructor(private readonly baseLoader: StatistiquesCoopLoader) {}

  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    const cacheKey = this.genererCleCache(filtres)
    const maintenant = Date.now()
    
    // Vérifier si on a une entrée en cache valide
    const entreeCache = CachedApiCoopStatistiquesLoader.cache.get(cacheKey)
    
    if (entreeCache && this.estCacheValide(entreeCache, maintenant)) {
      console.log(`📦 Cache HIT pour: ${cacheKey} (âge: ${Math.round((maintenant - entreeCache.timestamp) / 1000)}s)`)
      return entreeCache.data
    }
    
    // Si pas de cache ou cache expiré, appeler l'API
    console.log(`🌐 Cache MISS pour: ${cacheKey} - Appel API en cours...`)
    
    try {
      const donnees = await this.baseLoader.recupererStatistiques(filtres)
      
      // Mettre en cache les nouvelles données
      CachedApiCoopStatistiquesLoader.cache.set(cacheKey, {
        data: donnees,
        timestamp: maintenant,
        cacheKey,
      })
      
      // Nettoyer les vieilles entrées du cache
      this.nettoyerCache(maintenant)
      
      console.log(`✅ Données mises en cache pour: ${cacheKey}`)
      return donnees
      
    } catch (error) {
      // En cas d'erreur API, essayer de retourner des données périmées si disponibles
      if (entreeCache) {
        console.warn(`⚠️ Erreur API, utilisation du cache périmé pour: ${cacheKey} (âge: ${Math.round((maintenant - entreeCache.timestamp) / 1000)}s)`)
        return entreeCache.data
      }
      
      // Si pas de cache du tout, relancer l'erreur
      throw error
    }
  }
  
  private genererCleCache(filtres?: StatistiquesFilters): string {
    if (!filtres) {
      return 'france_entiere'
    }
    
    // Créer une clé unique basée sur les filtres
    const elements: string[] = []
    
    if (filtres.departements && filtres.departements.length > 0) {
      elements.push(`dept_${[...filtres.departements].sort().join('_')}`)
    }
    
    if (filtres.du) {
      elements.push(`du_${filtres.du}`)
    }
    
    if (filtres.au) {
      elements.push(`au_${filtres.au}`)
    }
    
    if (filtres.communes && filtres.communes.length > 0) {
      elements.push(`com_${[...filtres.communes].sort().join('_')}`)
    }
    
    if (filtres.types && filtres.types.length > 0) {
      elements.push(`types_${[...filtres.types].sort().join('_')}`)
    }
    
    if (filtres.conseillerNumerique !== undefined) {
      elements.push(`cn_${filtres.conseillerNumerique ? '1' : '0'}`)
    }
    
    return elements.length > 0 ? elements.join('__') : 'france_entiere'
  }
  
  private estCacheValide(entree: CacheEntry, maintenant: number): boolean {
    return (maintenant - entree.timestamp) < CachedApiCoopStatistiquesLoader.CACHE_DURATION_MS
  }
  
  private nettoyerCache(maintenant: number): void {
    // Supprimer les entrées expirées depuis plus de 2x la durée du cache
    const seuilSuppression = maintenant - (CachedApiCoopStatistiquesLoader.CACHE_DURATION_MS * 2)
    
    for (const [cle, entree] of CachedApiCoopStatistiquesLoader.cache.entries()) {
      if (entree.timestamp < seuilSuppression) {
        CachedApiCoopStatistiquesLoader.cache.delete(cle)
        console.log(`🗑️ Cache supprimé pour: ${cle} (trop ancien)`)
      }
    }
    
    // Limiter la taille du cache à 100 entrées max
    if (CachedApiCoopStatistiquesLoader.cache.size > 100) {
      // Trier par timestamp et garder les 100 plus récentes
      const entries = Array.from(CachedApiCoopStatistiquesLoader.cache.entries())
        .sort((entree1, entree2) => entree2[1].timestamp - entree1[1].timestamp)
        .slice(0, 100)
      
      CachedApiCoopStatistiquesLoader.cache.clear()
      for (const [cle, valeur] of entries) {
        CachedApiCoopStatistiquesLoader.cache.set(cle, valeur)
      }
      
      console.log('🧹 Cache réduit à 100 entrées')
    }
  }
  
  // Méthodes utilitaires pour la gestion du cache
  static viderCache(): void {
    const taille = this.cache.size
    this.cache.clear()
    console.log(`🗑️ Cache vidé (${taille} entrées supprimées)`)
  }
  
  static obtenirStatistiquesCache(): { taille: number; cles: string[]; detailsEntrees: Array<{ cle: string; age: number }> } {
    const maintenant = Date.now()
    const detailsEntrees = Array.from(this.cache.entries()).map(([cle, entree]) => ({
      cle,
      age: Math.round((maintenant - entree.timestamp) / 1000), // Age en secondes
    }))
    
    return {
      taille: this.cache.size,
      cles: Array.from(this.cache.keys()),
      detailsEntrees,
    }
  }
  
  static forcerRafraichissement(cacheKey: string): void {
    this.cache.delete(cacheKey)
    console.log(`🔄 Cache forcé à se rafraîchir pour: ${cacheKey}`)
  }
}