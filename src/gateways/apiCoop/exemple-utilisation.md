# Utilisation de l'API Coop Numérique - Statistiques

## Vue d'ensemble

L'API Coop Numérique permet de récupérer des statistiques globales sur les bénéficiaires de la médiation numérique. Elle fournit des données agrégées sur :

- Les accompagnements par jour/mois
- La répartition des bénéficiaires (genre, âge, statut social)
- Les activités (types, durées, lieux, thématiques)
- Les totaux généraux

## Système de Cache

### Vue d'ensemble du cache

L'API Coop intègre un **système de cache intelligent** qui améliore drastiquement les performances :

- **Durée du cache** : 1 heure par défaut
- **Clés uniques** : Chaque combinaison de filtres génère une clé de cache unique
- **Accélération** : >1000x plus rapide (de ~7s à 0ms)
- **Résilience** : Utilise le cache périmé si l'API est indisponible
- **Limite** : Maximum 100 entrées en cache (FIFO)

### Utilisation avec cache (recommandé)

```typescript
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

// Avec cache activé (par défaut)
const loaderAvecCache = createApiCoopStatistiquesLoader(true)

// Sans cache (pour forcer un appel API frais)
const loaderSansCache = createApiCoopStatistiquesLoader(false)
```

### Gestion du cache

```typescript
import { CachedApiCoopStatistiquesLoader } from '@/gateways/apiCoop/CachedApiCoopStatistiquesLoader'

// Vider tout le cache
CachedApiCoopStatistiquesLoader.viderCache()

// Forcer le rafraîchissement d'une entrée spécifique
CachedApiCoopStatistiquesLoader.forcerRafraichissement('dept_75')

// Obtenir les statistiques du cache
const stats = CachedApiCoopStatistiquesLoader.obtenirStatistiquesCache()
console.log(`Entrées en cache: ${stats.taille}`)
stats.detailsEntrees.forEach(entree => {
  console.log(`${entree.cle}: âge ${entree.age}s`)
})
```

### Clés de cache générées

| Filtre | Clé de cache |
|--------|--------------|
| France entière | `france_entiere` |
| Paris (75) | `dept_75` |
| Plusieurs départements | `dept_13_75_92` |
| Avec dates | `dept_75__du_2024-01-01__au_2024-12-31` |
| Types d'activités | `types_Collectif_Individuel` |

## Exemple d'utilisation dans l'application

### 1. Dans un use case (avec cache)

```typescript
import { RecupererStatistiquesCoop } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

export class TableauDeBordCoopUseCase {
  private readonly statistiquesUseCase: RecupererStatistiquesCoop

  constructor() {
    // Utilise automatiquement le cache
    this.statistiquesUseCase = new RecupererStatistiquesCoop(
      createApiCoopStatistiquesLoader()
    )
  }

  async recupererDonneesTableauDeBord() {
    // Récupération des statistiques globales
    const statistiquesGlobales = await this.statistiquesUseCase.execute({})

    // Récupération des statistiques du mois en cours
    const debutMois = new Date()
    debutMois.setDate(1)
    const finMois = new Date()
    
    const statistiquesMois = await this.statistiquesUseCase.execute({
      filtres: {
        du: debutMois.toISOString().split('T')[0],
        au: finMois.toISOString().split('T')[0]
      }
    })

    return {
      global: statistiquesGlobales,
      moisCourant: statistiquesMois
    }
  }
}
```

### 2. Dans une action de serveur (avec cache)

```typescript
'use server'

import { RecupererStatistiquesCoop } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

export async function recupererStatistiquesCoopAction(filtres?: {
  du?: string
  au?: string
  departements?: string[]
}) {
  // Le cache est activé par défaut via la factory
  const useCase = new RecupererStatistiquesCoop(
    createApiCoopStatistiquesLoader()
  )

  try {
    const statistiques = await useCase.execute({
      filtres: {
        du: filtres?.du,
        au: filtres?.au,
        departements: filtres?.departements,
      }
    })

    return { success: true, data: statistiques }
  } catch (error) {
    console.error('Erreur récupération statistiques Coop:', error)
    return { 
      success: false, 
      error: 'Impossible de récupérer les statistiques' 
    }
  }
}
```

### 3. Dans un composant React

```typescript
'use client'

import { useEffect, useState } from 'react'
import { StatistiquesCoopReadModel } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { recupererStatistiquesCoopAction } from './actions'

export function TableauDeBordCoop() {
  const [statistiques, setStatistiques] = useState<StatistiquesCoopReadModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const chargerStatistiques = async () => {
      const result = await recupererStatistiquesCoopAction()
      
      if (result.success) {
        setStatistiques(result.data)
      }
      setLoading(false)
    }

    chargerStatistiques()
  }, [])

  if (loading) return <div>Chargement des statistiques...</div>

  if (!statistiques) return <div>Erreur de chargement</div>

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-md-4">
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <h3 className="fr-card__title">Bénéficiaires</h3>
              <p className="fr-text--lg font-weight-700">
                {statistiques.totaux.beneficiaires.total.toLocaleString('fr-FR')}
              </p>
              <p className="fr-text--sm color-grey">
                dont {statistiques.totaux.beneficiaires.suivis.toLocaleString('fr-FR')} suivis
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fr-col-12 fr-col-md-4">
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <h3 className="fr-card__title">Accompagnements</h3>
              <p className="fr-text--lg font-weight-700">
                {statistiques.totaux.accompagnements.total.toLocaleString('fr-FR')}
              </p>
              <p className="fr-text--sm color-grey">
                {statistiques.totaux.accompagnements.individuels.proportion.toFixed(1)}% individuels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fr-col-12 fr-col-md-4">
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <h3 className="fr-card__title">Activités</h3>
              <p className="fr-text--lg font-weight-700">
                {statistiques.totaux.activites.total.toLocaleString('fr-FR')}
              </p>
              <p className="fr-text--sm color-grey">
                {statistiques.totaux.activites.collectifs.proportion.toFixed(1)}% collectives
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Filtres disponibles

L'API supporte plusieurs filtres :

```typescript
const filtres = {
  du: '2024-01-01',                        // Date de début
  au: '2024-12-31',                        // Date de fin
  types: ['Individuel', 'Collectif'],      // Types d'activités
  departements: ['75', '92', '93'],        // Codes département
  communes: ['75001', '92001'],            // Codes INSEE commune
  conseillerNumerique: true,               // Dans le dispositif Conseiller Numérique
  // ... autres filtres (UUIDs)
}
```

## Configuration

Assurez-vous que la variable d'environnement `COOP_TOKEN` est configurée dans votre fichier `.env.local` :

```bash
COOP_TOKEN="votre_token_bearer_ici"
```

## Tests

Pour tester l'intégration :

```bash
# Lancer le script de test
npx tsx scripts/test-cache-api-coop.ts

# Ou lancer les tests unitaires
yarn test src/gateways/apiCoop/
```