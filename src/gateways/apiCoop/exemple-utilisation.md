# Utilisation de l'API Coop Numérique - Statistiques

## Vue d'ensemble

L'API Coop Numérique permet de récupérer des statistiques globales sur les bénéficiaires de la médiation numérique. Elle fournit des données agrégées sur :

- Les accompagnements par jour/mois
- La répartition des bénéficiaires (genre, âge, statut social)
- Les activités (types, durées, lieux, thématiques)
- Les totaux généraux

📖 **Documentation officielle de l'API** : [https://coop-numerique.anct.gouv.fr/api/v1/documentation#tag/statistiques](https://coop-numerique.anct.gouv.fr/api/v1/documentation#tag/statistiques)

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
stats.detailsEntrees.forEach((entree) => {
  console.log(`${entree.cle}: âge ${entree.age}s`)
})
```

### Clés de cache générées

| Filtre                 | Clé de cache                            |
| ---------------------- | --------------------------------------- |
| France entière         | `france_entiere`                        |
| Paris (75)             | `dept_75`                               |
| Plusieurs départements | `dept_13_75_92`                         |
| Avec dates             | `dept_75__du_2024-01-01__au_2024-12-31` |
| Types d'activités      | `types_Collectif_Individuel`            |

## Exemple d'utilisation dans l'application

### 1. Dans un use case (avec cache)

```typescript
import { RecupererStatistiquesCoop } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

export class TableauDeBordCoopUseCase {
  private readonly statistiquesUseCase: RecupererStatistiquesCoop

  constructor() {
    // Utilise automatiquement le cache
    this.statistiquesUseCase = new RecupererStatistiquesCoop(createApiCoopStatistiquesLoader())
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
        au: finMois.toISOString().split('T')[0],
      },
    })

    return {
      global: statistiquesGlobales,
      moisCourant: statistiquesMois,
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
  const useCase = new RecupererStatistiquesCoop(createApiCoopStatistiquesLoader())

  try {
    const statistiques = await useCase.execute({
      filtres: {
        du: filtres?.du,
        au: filtres?.au,
        departements: filtres?.departements,
      },
    })

    return { success: true, data: statistiques }
  } catch (error) {
    console.error('Erreur récupération statistiques Coop:', error)
    return {
      success: false,
      error: 'Impossible de récupérer les statistiques',
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
  du: '2024-01-01', // Date de début
  au: '2024-12-31', // Date de fin
  types: ['Individuel', 'Collectif'], // Types d'activités
  departements: ['75', '92', '93'], // Codes département
  communes: ['75001', '92001'], // Codes INSEE commune
  conseillerNumerique: true, // Dans le dispositif Conseiller Numérique
  // ... autres filtres (UUIDs)
}
```

## Système de Mock pour le développement

### Vue d'ensemble

Le système de mock permet de simuler les réponses de l'API Coop pendant le développement sans dépendre du service externe. Il génère des données réalistes avec des paramètres configurables.

### Activation du mock

Le mock s'active automatiquement si la variable `COOP_TOKEN` commence par `FAKE_TOKEN`. Le format de configuration est :

```
FAKE_TOKEN_[RESPONSE_TYPE]_[DELAY_SECONDS]
```

Où :

- `RESPONSE_TYPE` : `OK` (succès) ou `NOK` (erreur)
- `DELAY_SECONDS` : temps de réponse simulé en secondes (0-30)

### Exemples de configuration

```bash
# Mock répondant immédiatement avec succès
COOP_TOKEN="FAKE_TOKEN_OK_0"

# Mock répondant en 2 secondes avec succès
COOP_TOKEN="FAKE_TOKEN_OK_2"

# Mock répondant en 5 secondes avec une erreur
COOP_TOKEN="FAKE_TOKEN_NOK_5"

# Mock répondant après 10 secondes avec succès
COOP_TOKEN="FAKE_TOKEN_OK_10"
```

### Données générées par le mock

Le mock génère des statistiques cohérentes basées sur les filtres fournis :

```typescript
// Exemple de données générées pour la France entière
{
  totaux: {
    beneficiaires: {
      total: 2500000,
      suivis: 1875000,
      anonymes: 625000
    },
    accompagnements: {
      total: 8750000,
      individuels: { total: 6125000, proportion: 70 },
      collectifs: { total: 2625000, proportion: 30 },
      ateliersNumeriques: { total: 1750000, proportion: 20 }
    },
    activites: {
      total: 12250000,
      individuels: { total: 8575000, proportion: 70 },
      collectifs: { total: 3675000, proportion: 30 }
    }
  },
  // ... autres données
}
```

### Filtres supportés par le mock

Le mock adapte ses données selon les filtres fournis :

- **Départements** : Ajuste les totaux selon le nombre de départements
- **Dates** : Simule une évolution temporelle
- **Types d'activités** : Filtre les statistiques par type

```typescript
// Exemple d'utilisation avec filtres
const loader = createApiCoopStatistiquesLoader()
const statistiques = await loader.recupererStatistiques({
  departements: ['75'], // Paris - données ajustées pour un département
  du: '2024-01-01',
  au: '2024-03-31',
})
```

### Script de test du mock

Un script dédié permet de tester différentes configurations :

```bash
# Test avec succès instantané
COOP_TOKEN=FAKE_TOKEN_OK_0 yarn tsx scripts/test-mock-api-coop.ts

# Test avec erreur après 2 secondes
COOP_TOKEN=FAKE_TOKEN_NOK_2 yarn tsx scripts/test-mock-api-coop.ts
```

### Intégration dans l'application

Le mock est automatiquement utilisé par la factory :

```typescript
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

// Si COOP_TOKEN commence par FAKE_TOKEN, retourne automatiquement le mock
const loader = createApiCoopStatistiquesLoader()
const stats = await loader.recupererStatistiques({})

// Le composant ne sait pas s'il utilise le vrai service ou le mock
```

## Configuration

### Production

Assurez-vous que la variable d'environnement `COOP_TOKEN` est configurée avec un vrai token :

```bash
COOP_TOKEN="votre_token_bearer_ici"
```

### Développement avec mock

Pour utiliser le mock pendant le développement :

```bash
# Dans .env.local pour un mock rapide et fonctionnel
COOP_TOKEN="FAKE_TOKEN_OK_0"

# Ou pour tester les délais de chargement
COOP_TOKEN="FAKE_TOKEN_OK_3"
```

## Tests

Pour tester l'intégration :

```bash
# Lancer le script de test
npx tsx scripts/test-cache-api-coop.ts

# Ou lancer les tests unitaires
yarn test src/gateways/apiCoop/
```

## Mapping des données pour la page Vitrine Médiateurs Numériques

### Vue d'ensemble

La page `/vitrine/donnees-territoriales/mediateurs-numeriques` utilise les données de l'API Coop via le transformer `statistiquesCoopToMediateursData`.

**⚠️ Le mapping n'est pas complet** : certaines données attendues par l'UI ne sont pas fournies par l'API.

### Tableau de correspondance

| API (`StatistiquesCoopReadModel`) | UI (`StatistiquesMediateursData`) | Statut                                |
| --------------------------------- | --------------------------------- | ------------------------------------- |
| `totaux`                          | `totalCounts`                     | ✅ Complet                            |
| `totaux.accompagnements`          | `totalCounts.accompagnements`     | ✅ Complet                            |
| `totaux.activites`                | `totalCounts.activites`           | ✅ Complet                            |
| `totaux.beneficiaires`            | `totalCounts.beneficiaires`       | ✅ Complet                            |
| `accompagnementsParJour`          | `accompagnementsParJour`          | ✅ Complet                            |
| `accompagnementsParMois`          | `accompagnementsParMois`          | ✅ Complet                            |
| `activites.typeActivites`         | `activites.typeActivites`         | ✅ Complet                            |
| `activites.durees`                | `activites.durees`                | ✅ Complet                            |
| `activites.typeLieu`              | `activites.typeLieu`              | ✅ Complet                            |
| `activites.thematiques`           | `activites.thematiques`           | ✅ Complet                            |
| `activites.materiels`             | `activites.materiels`             | ✅ Complet                            |
| -                                 | `activites.thematiquesDemarches`  | ❌ Non fourni par l'API (placeholder) |
| `beneficiaires.genres`            | `beneficiaires.genres`            | ✅ Complet                            |
| `beneficiaires.trancheAges`       | `beneficiaires.trancheAges`       | ✅ Complet                            |
| `beneficiaires.statutsSocial`     | `beneficiaires.statutsSocial`     | ✅ Complet                            |

### Données manquantes

Le champ suivant est attendu par l'UI mais n'est pas fourni par l'API :

1. **`activites.thematiquesDemarches`** : Thématiques des démarches administratives (Papiers, Famille, Social, etc.)

Ce champ est initialisé avec une valeur placeholder (`count: -1`, `label: 'Non disponible'`) dans le transformer.

### Fichiers concernés

- Transformer : `src/components/coop/Statistiques/statistiquesCoopToMediateursData.ts`
- Page : `src/app/vitrine/donnees-territoriales/(with-layout)/mediateurs-numeriques/[niveau]/[[...code]]/page.tsx`
- Composant async : `src/components/coop/Statistiques/StatistiquesAsyncContent.tsx`
