# Rapport SEO - Site Vitrine Inclusion Numérique

Ce document décrit l'ensemble des optimisations SEO (Search Engine Optimization) mises en place sur le site vitrine.

---

## 1. Comprendre le SEO : les bases

### Qu'est-ce que le SEO ?

Le SEO (Search Engine Optimization) regroupe les techniques permettant d'améliorer la visibilité d'un site web dans les résultats des moteurs de recherche (Google, Bing, etc.).

### Les métadonnées (metadata)

Chaque page web contient des **métadonnées** invisibles pour l'utilisateur mais lues par les moteurs de recherche. Elles apparaissent dans le code HTML de la page :

```html
<head>
  <title>Titre de la page - Inclusion Numérique</title>
  <meta name="description" content="Description de la page..." />
  <meta name="keywords" content="mot-clé 1, mot-clé 2" />
</head>
```

### Les principales métadonnées

| Métadonnée      | Rôle                                           | Où apparaît-elle ?                            |
| --------------- | ---------------------------------------------- | --------------------------------------------- |
| **title**       | Titre de la page                               | Onglet du navigateur + résultats de recherche |
| **description** | Résumé du contenu                              | Sous le titre dans les résultats de recherche |
| **keywords**    | Mots-clés associés                             | Utilisé par certains moteurs de recherche     |
| **robots**      | Instructions pour les robots                   | Non visible                                   |
| **Open Graph**  | Aperçu lors du partage sur les réseaux sociaux | Facebook, LinkedIn, Twitter...                |

### Comprendre `index: true` vs `index: false`

Les moteurs de recherche utilisent des "robots" qui parcourent le web pour indexer les pages.

| Configuration  | Signification                                                   | Quand l'utiliser ?                                          |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| `index: true`  | ✅ La page **apparaîtra** dans les résultats de recherche       | Pages principales avec du contenu utile                     |
| `index: false` | ❌ La page **n'apparaîtra PAS** dans les résultats de recherche | Pages légales, techniques ou sans intérêt pour la recherche |

**Exemple concret :**

- La page "Lieux d'inclusion numérique" → `index: true` → Un utilisateur cherchant "lieux inclusion numérique France" pourra trouver cette page
- La page "Mentions légales" → `index: false` → Personne ne cherche "mentions légales ANCT" sur un moteur de recherche

### Comprendre `follow: true` vs `follow: false`

| Configuration   | Signification                                        |
| --------------- | ---------------------------------------------------- |
| `follow: true`  | Les robots suivent les liens présents sur cette page |
| `follow: false` | Les robots ignorent les liens de cette page          |

En général, on utilise `follow: true` sauf cas particulier.

---

## 2. Pages principales (indexées par les moteurs de recherche)

Ces pages sont configurées avec `index: true` et apparaîtront dans les résultats de recherche.

### 2.1 Page d'accueil

**URL :** `/vitrine` ou `/`

**Ce qu'on voit dans les moteurs de recherche :**

```
Inclusion Numérique - Agence Nationale de la Cohésion des Territoires
https://inclusion-numerique.anct.gouv.fr/vitrine
Découvrez les dispositifs, lieux et outils pour favoriser l'inclusion
numérique sur les territoires. Accompagner tous les publics vers une
utilisation autonome, sécurisée et confiante du numérique.
```

**Configuration SEO :**

- **Titre :** Inclusion Numérique - Agence Nationale de la Cohésion des Territoires
- **Description :** Découvrez les dispositifs, lieux et outils pour favoriser l'inclusion numérique sur les territoires...
- **Mots-clés :** inclusion numérique, ANCT, France Numérique Ensemble, conseiller numérique, lieux d'inclusion, gouvernance territoriale
- **Indexation :** ✅ Oui

---

### 2.2 Page Lieux d'inclusion numérique

**URL :** `/vitrine/lieux`

**Ce qu'on voit dans les moteurs de recherche :**

```
Lieux d'inclusion numérique - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/vitrine/lieux
Cartographie interactive des lieux d'inclusion numérique en France.
Outil de prescription et de pilotage mobilisant des données territoriales.
```

**Configuration SEO :**

- **Titre :** Lieux d'inclusion numérique - Inclusion Numérique
- **Description :** Cartographie interactive des lieux d'inclusion numérique en France...
- **Mots-clés :** lieux inclusion numérique, cartographie, médiation numérique, structures d'accompagnement, aidants numériques
- **Indexation :** ✅ Oui

---

### 2.3 Page Dispositifs

**URL :** `/vitrine/dispositifs`

**Ce qu'on voit dans les moteurs de recherche :**

```
Les dispositifs d'inclusion numérique - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/vitrine/dispositifs
Découvrez les dispositifs d'inclusion numérique : conseillers numériques,
Aidants Connect, ateliers de montée en compétences.
```

**Configuration SEO :**

- **Titre :** Les dispositifs d'inclusion numérique - Inclusion Numérique
- **Description :** Découvrez les dispositifs d'inclusion numérique : conseillers numériques, Aidants Connect...
- **Mots-clés :** conseiller numérique, Aidants Connect, dispositifs inclusion, accompagnement numérique, ateliers numériques
- **Indexation :** ✅ Oui

---

### 2.4 Page Données territoriales (sélection du territoire)

**URL :** `/vitrine/donnees-territoriales`

**Ce qu'on voit dans les moteurs de recherche :**

```
Données territoriales - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/vitrine/donnees-territoriales
Accédez aux données publiques d'inclusion numérique par territoire en France.
Statistiques sur les lieux d'inclusion, médiateurs numériques, feuilles de route.
```

**Configuration SEO :**

- **Titre :** Données territoriales - Inclusion Numérique
- **Description :** Accédez aux données publiques d'inclusion numérique par territoire en France...
- **Mots-clés :** inclusion numérique, données territoriales, France, départements, statistiques, médiateurs numériques, feuille de route, France Numérique Ensemble
- **Indexation :** ✅ Oui

---

### 2.5 Page Outils numériques

**URL :** `/vitrine/outils-numeriques`

**Ce qu'on voit dans les moteurs de recherche :**

```
Outils numériques - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/vitrine/outils-numeriques
Découvrez les outils numériques pour piloter l'inclusion numérique :
Mon Inclusion Numérique, cartographie nationale, données territoriales.
```

**Configuration SEO :**

- **Titre :** Outils numériques - Inclusion Numérique
- **Description :** Découvrez les outils numériques pour piloter l'inclusion numérique...
- **Mots-clés :** outils numériques, Mon Inclusion Numérique, pilotage, données territoriales, cartographie nationale
- **Indexation :** ✅ Oui

---

### 2.6 Page Mon Inclusion Numérique (détail outil)

**URL :** `/vitrine/outils-numeriques/min`

**Ce qu'on voit dans les moteurs de recherche :**

```
Mon Inclusion Numérique - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/vitrine/outils-numeriques/min
Mon Inclusion Numérique : outil de visualisation de données et de pilotage
de l'inclusion numérique dans les territoires.
```

**Configuration SEO :**

- **Titre :** Mon Inclusion Numérique - Inclusion Numérique
- **Description :** Mon Inclusion Numérique : outil de visualisation de données et de pilotage...
- **Mots-clés :** Mon Inclusion Numérique, pilotage territorial, données inclusion, gouvernance territoriale, feuille de route, collectivités
- **Indexation :** ✅ Oui

---

## 3. Pages de données territoriales (dynamiques)

Ces pages ont un **titre et une description qui s'adaptent automatiquement** au territoire sélectionné.

### 3.1 Synthèse et indicateurs

**URLs :**

- `/vitrine/donnees-territoriales/synthese-et-indicateurs/national` → France entière
- `/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/69` → Rhône

**Exemple pour le Rhône dans les moteurs de recherche :**

```
Synthèse et indicateurs - Rhône (69) - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../departement/69
Synthèse et indicateurs de l'inclusion numérique pour le département Rhône (69).
Lieux d'accompagnement, médiateurs numériques, accompagnements réalisés.
```

**Exemple pour la France dans les moteurs de recherche :**

```
Synthèse et indicateurs - France - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../national
Synthèse et indicateurs de l'inclusion numérique pour la France.
Lieux d'accompagnement, médiateurs numériques, accompagnements réalisés.
```

**Configuration SEO :**

- **Titre :** Synthèse et indicateurs - {Territoire} - Inclusion Numérique
- **Description :** Synthèse et indicateurs de l'inclusion numérique pour {territoire}...
- **Mots-clés :** synthèse, indicateurs, inclusion numérique, fragilité numérique, + nom du département si applicable
- **Indexation :** ✅ Oui

---

### 3.2 Feuilles de route

**URLs :**

- `/vitrine/donnees-territoriales/feuille-de-route/departement/69` → Rhône

**Exemple pour le Rhône dans les moteurs de recherche :**

```
Feuilles de route - Rhône (69) - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../departement/69
Découvrez les feuilles de route de l'inclusion numérique pour le département
Rhône (69). Actions, financements et objectifs du programme France Numérique Ensemble.
```

**Configuration SEO :**

- **Titre :** Feuilles de route - {Territoire} - Inclusion Numérique
- **Description :** Découvrez les feuilles de route de l'inclusion numérique pour {territoire}...
- **Mots-clés :** feuille de route, inclusion numérique, France Numérique Ensemble, actions territoriales, financement, + nom du département
- **Indexation :** ✅ Oui

---

### 3.3 Gouvernances

**URLs :**

- `/vitrine/donnees-territoriales/gouvernances/departement/69` → Rhône

**Exemple pour le Rhône dans les moteurs de recherche :**

```
Gouvernance - Rhône (69) - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../departement/69
Découvrez la gouvernance de l'inclusion numérique pour le département Rhône (69).
Membres, co-porteurs et organisation territoriale du programme France Numérique Ensemble.
```

**Configuration SEO :**

- **Titre :** Gouvernance - {Territoire} - Inclusion Numérique
- **Description :** Découvrez la gouvernance de l'inclusion numérique pour {territoire}...
- **Mots-clés :** gouvernance, inclusion numérique, France Numérique Ensemble, co-porteurs, membres, collectivités, + nom du département
- **Indexation :** ✅ Oui

---

### 3.4 Lieux d'inclusion (par territoire)

**URLs :**

- `/vitrine/donnees-territoriales/lieux-inclusion/national` → France entière
- `/vitrine/donnees-territoriales/lieux-inclusion/departement/69` → Rhône

**Exemple pour le Rhône dans les moteurs de recherche :**

```
Lieux d'inclusion numérique - Rhône (69) - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../departement/69
Découvrez les lieux d'inclusion numérique pour le département Rhône (69).
Statistiques sur les structures d'accompagnement, médiathèques, France Services.
```

**Configuration SEO :**

- **Titre :** Lieux d'inclusion numérique - {Territoire} - Inclusion Numérique
- **Description :** Découvrez les lieux d'inclusion numérique pour {territoire}...
- **Mots-clés :** lieux inclusion numérique, structures accompagnement, médiathèques, France Services, tiers-lieux, + nom du département
- **Indexation :** ✅ Oui

---

### 3.5 Médiateurs numériques

**URLs :**

- `/vitrine/donnees-territoriales/mediateurs-numeriques/national` → France entière
- `/vitrine/donnees-territoriales/mediateurs-numeriques/departement/69` → Rhône

**Exemple pour le Rhône dans les moteurs de recherche :**

```
Médiateurs numériques - Rhône (69) - Inclusion Numérique
https://inclusion-numerique.anct.gouv.fr/.../departement/69
Découvrez les médiateurs numériques pour le département Rhône (69).
Statistiques sur les conseillers numériques, aidants Connect et professionnels.
```

**Configuration SEO :**

- **Titre :** Médiateurs numériques - {Territoire} - Inclusion Numérique
- **Description :** Découvrez les médiateurs numériques pour {territoire}...
- **Mots-clés :** médiateurs numériques, conseillers numériques, Aidants Connect, médiation numérique, + nom du département
- **Indexation :** ✅ Oui

---

## 4. Pages légales (non indexées)

Ces pages sont configurées avec `index: false` car elles n'apportent pas de valeur pour la recherche.

### 4.1 Mentions légales

**URL :** `/vitrine/mentions-legales`

**Configuration SEO :**

- **Titre :** Mentions légales - Inclusion Numérique
- **Description :** Mentions légales de la plateforme Inclusion Numérique. Éditeur, hébergement, propriété intellectuelle et informations de contact.
- **Indexation :** ❌ Non (`index: false`)

**Pourquoi ne pas indexer ?** Ces informations obligatoires n'intéressent pas les utilisateurs qui recherchent de l'information sur l'inclusion numérique.

---

### 4.2 Déclaration d'accessibilité

**URL :** `/vitrine/accessibilite`

**Configuration SEO :**

- **Titre :** Déclaration d'accessibilité - Inclusion Numérique
- **Description :** Déclaration d'accessibilité de la plateforme Inclusion Numérique. Conformité RGAA et engagement pour l'accessibilité numérique.
- **Indexation :** ❌ Non (`index: false`)

**Pourquoi ne pas indexer ?** Page technique obligatoire, peu recherchée.

---

### 4.3 Conditions générales d'utilisation

**URL :** `/vitrine/conditions-generales-utilisation`

**Configuration SEO :**

- **Titre :** Conditions générales d'utilisation - Inclusion Numérique
- **Description :** Conditions générales d'utilisation de la plateforme Inclusion Numérique. Règles d'utilisation du service et responsabilités.
- **Indexation :** ❌ Non (`index: false`)

**Pourquoi ne pas indexer ?** Document juridique obligatoire, pas d'intérêt pour la recherche.

---

### 4.4 Politique de confidentialité

**URL :** `/vitrine/politique-confidentialite`

**Configuration SEO :**

- **Titre :** Politique de confidentialité - Inclusion Numérique
- **Description :** Politique de confidentialité de la plateforme Inclusion Numérique. Traitement des données personnelles et conformité RGPD.
- **Indexation :** ❌ Non (`index: false`)

**Pourquoi ne pas indexer ?** Document RGPD obligatoire, pas d'intérêt pour la recherche.

---

## 5. Open Graph (partage sur les réseaux sociaux)

Toutes les pages principales sont configurées avec **Open Graph** pour un affichage optimal lors du partage sur les réseaux sociaux (Facebook, LinkedIn, Twitter...).

**Exemple de ce qui apparaît lors du partage de la page d'accueil :**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Inclusion Numérique - ANCT                     │
│  inclusion-numerique.anct.gouv.fr               │
│                                                 │
│  Découvrez les dispositifs, lieux et outils     │
│  pour favoriser l'inclusion numérique sur       │
│  les territoires.                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 6. Récapitulatif

### Pages indexées (visibles sur les moteurs de recherche)

| Page                               | URL                                                          |
| ---------------------------------- | ------------------------------------------------------------ |
| Accueil                            | `/vitrine`                                                   |
| Lieux                              | `/vitrine/lieux`                                             |
| Dispositifs                        | `/vitrine/dispositifs`                                       |
| Données territoriales              | `/vitrine/donnees-territoriales`                             |
| Outils numériques                  | `/vitrine/outils-numeriques`                                 |
| Mon Inclusion Numérique            | `/vitrine/outils-numeriques/min`                             |
| Synthèse (par territoire)          | `/vitrine/donnees-territoriales/synthese-et-indicateurs/...` |
| Feuilles de route (par territoire) | `/vitrine/donnees-territoriales/feuille-de-route/...`        |
| Gouvernances (par territoire)      | `/vitrine/donnees-territoriales/gouvernances/...`            |
| Lieux (par territoire)             | `/vitrine/donnees-territoriales/lieux-inclusion/...`         |
| Médiateurs (par territoire)        | `/vitrine/donnees-territoriales/mediateurs-numeriques/...`   |

### Pages non indexées (cachées des moteurs de recherche)

| Page             | URL                                         | Raison                        |
| ---------------- | ------------------------------------------- | ----------------------------- |
| Mentions légales | `/vitrine/mentions-legales`                 | Contenu juridique obligatoire |
| Accessibilité    | `/vitrine/accessibilite`                    | Contenu technique obligatoire |
| CGU              | `/vitrine/conditions-generales-utilisation` | Contenu juridique obligatoire |
| Confidentialité  | `/vitrine/politique-confidentialite`        | Contenu RGPD obligatoire      |

---

## 7. Bonnes pratiques appliquées

1. **Titres uniques** : Chaque page a un titre différent et descriptif
2. **Descriptions pertinentes** : Entre 150 et 160 caractères, résumant le contenu
3. **Mots-clés ciblés** : En rapport avec l'inclusion numérique et les services proposés
4. **Hiérarchie des titres** : Utilisation cohérente des balises h1, h2, h3...
5. **URLs lisibles** : Structurées et compréhensibles (`/vitrine/lieux` plutôt que `/page?id=123`)
6. **Contenu dynamique contextualisé** : Les pages territoriales adaptent leurs métadonnées au département sélectionné

---

## 8. Préconisations d'amélioration

### 8.1 Problématique actuelle

Les pages de données territoriales (synthèse, feuilles de route, gouvernances, lieux, médiateurs) sont accessibles uniquement via :

- La carte interactive (côté client, JavaScript)
- Le sélecteur de département (côté client, JavaScript)

**Conséquence :** Les robots des moteurs de recherche ne peuvent pas "cliquer" sur une carte interactive. Ils ne découvrent donc pas les pages des 101 départements français.

### 8.2 Solution recommandée : maillage interne

Le **maillage interne** consiste à créer des liens entre les pages d'un même site. Ces liens permettent aux robots de découvrir de nouvelles pages en les "suivant".

#### Préconisation 1 : Liens vers des territoires sur la page d'accueil des données

Sur la page `/vitrine/donnees-territoriales`, ajouter une section avec des liens directs vers certains territoires :

```
┌─────────────────────────────────────────────────────────────┐
│  Découvrir un territoire                                    │
│                                                             │
│  • Découvrez les lieux d'inclusion numérique en Mayenne     │
│  • Les chiffres de l'inclusion en Indre-et-Loire            │
│  • Feuille de route du Rhône                                │
│  • Gouvernance de l'inclusion dans les Bouches-du-Rhône     │
│  • Médiateurs numériques en Gironde                         │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Avantages :**

- Les robots découvrent les pages départementales
- Textes de liens variés et naturels (bon pour le SEO)
- Facilite la navigation pour les utilisateurs

**Recommandation :** Afficher une sélection de 10-15 départements représentatifs (grandes métropoles, DOM-TOM, territoires ruraux) pour couvrir la diversité des territoires.

#### Préconisation 2 : Liens vers les départements voisins

Sur chaque page de détail d'un département, ajouter une section "Départements voisins" :

```
┌─────────────────────────────────────────────────────────────┐
│  Départements voisins                                       │
│                                                             │
│  [Loire (42)]  [Ain (01)]  [Isère (38)]  [Saône-et-Loire]  │
└─────────────────────────────────────────────────────────────┘
```

**Exemple pour le Rhône (69) :**

- Lien vers Loire (42)
- Lien vers Ain (01)
- Lien vers Isère (38)
- Lien vers Saône-et-Loire (71)

**Avantages :**

- Crée un réseau de liens entre tous les départements
- Les robots peuvent naviguer de département en département
- Pertinent pour l'utilisateur (contexte géographique)
- Améliore le "PageRank" interne des pages territoriales

### 8.3 Impact attendu

| Métrique                      | Avant                | Après (estimé)           |
| ----------------------------- | -------------------- | ------------------------ |
| Pages territoriales indexées  | ~10 (accidentelles)  | ~500+ (toutes les pages) |
| Découvrabilité par les robots | ❌ Faible            | ✅ Excellente            |
| Navigation utilisateur        | Via carte uniquement | Carte + liens textuels   |

### 8.4 Priorité de mise en œuvre

| Préconisation                        | Priorité   | Effort | Impact SEO |
| ------------------------------------ | ---------- | ------ | ---------- |
| Liens sur page données territoriales | 🔴 Haute   | Faible | Fort       |
| Liens départements voisins           | 🟡 Moyenne | Moyen  | Moyen      |

---

_Document généré le 4 décembre 2025_
