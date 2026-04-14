# Couche d'anticorruption — Statistiques

## Deux systèmes, deux domaines

```
┌──────────────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
│  Suite Gestionnaire Numérique (SGN)          │   │  La Coop (schéma importé localement)         │
│                                              │   │                                              │
│  Concepts propres :                          │   │  Concepts propres :                          │
│  - ScopeFiltre (national / dept / structure) │   │  - personne_id (INT clé étrangère)           │
│  - structure_id SGN (INT)                    │   │  - coop_id (UUID text sur personne)          │
│  - code département (string '75', '2A')      │   │  - structure_id Coop (INT, même que SGN !)   │
│  - thématiques en PascalCase                 │   │  - lieu_code_insee (text INSEE)              │
│  - types en PascalCase 'Individuel'          │   │  - type 'individuel'/'collectif' (lowercase) │
│  - labels français lisibles                  │   │  - type_lieu 'Lieu activite', 'A distance'   │
│                                              │   │  - thematiques TEXT[] human-readable         │
│  Tables propres :                            │   │  - duree INT (minutes)                       │
│  - main.personne (id, coop_id)               │   │  - materiels TEXT[]                          │
│  - min.personne_enrichie (vue enrichie)      │   │                                              │
│  - main.structure (id, nom, adresse_id)      │   │  Table principale :                          │
│  - main.adresse (departement, ...)           │   │  - main.activites_coop                       │
│  - main.personne_affectations                │   │                                              │
└──────────────────────────────────────────────┘   └──────────────────────────────────────────────┘
```

Ces deux systèmes ont leurs propres concepts, leurs propres identifiants.
**L'ACL est le seul endroit où ces deux mondes se touchent.**

---

## Architecture de flux

```
page.tsx
  │  ScopeFiltre + StatistiquesFilters (concepts SGN purs)
  │
  ├─────────────────────────────────────────────────────────────────────────────────────┐
  │  [RÉSOLUTION outbound — actuellement dans page.tsx, doit aller dans l'ACL]         │
  │  ScopeFiltre → liste de coop_id UUIDs (via personne_enrichie + adresses)           │
  │  structure_id SGN → filtre SQL structure_id Coop                                    │
  │  codes département → filtre SQL lieu_code_insee                                     │
  │  thématiques PascalCase → thématiques human-readable DB                            │
  └─────────────────────────────────────────────────────────────────────────────────────┘
  │  StatistiquesFilters avec identifiants Coop résolus
  ▼
PrismaStatistiquesLoader
  │  Exécute les requêtes SQL sur main.activites_coop
  │  Retourne StatistiquesCoopBrutesReadModel (valeurs brutes DB, sans labels)
  ▼
[ACL inbound — statistiquesPresenter]
  │  type 'individuel' → 'Accompagnement individuel'
  │  type_lieu 'Lieu activite' → "Lieu d'activité"
  │  thematique 'Navigation sur internet' → 'NavigationSurInternet' → label FR
  │  duree INT → plage '30'|'60'|'120'|'more' → label FR
  │  date 'YYYY-MM-DD' → 'JJ/MM'
  │  counts → proportions (algorithme Largest Remainder)
  ▼
StatistiquesMediateursData (ViewModel SGN pur, zéro identifiant Coop)
  ▼
Composants React
```

---

## Schéma de la table `main.activites_coop` (Coop)

| Colonne                               | Type   | Exemple                                  | Rôle                                          |
| ------------------------------------- | ------ | ---------------------------------------- | --------------------------------------------- |
| `id`                                  | INT    | `1042`                                   | Clé primaire                                  |
| `personne_id`                         | INT    | `17`                                     | FK → `main.personne.id`                       |
| `structure_id`                        | INT    | `42`                                     | FK → `main.structure.id` (même ID que SGN)    |
| `date`                                | DATE   | `2024-03-15`                             | Date de l'activité                            |
| `type`                                | TEXT   | `'individuel'` / `'collectif'`           | Type d'activité (lowercase)                   |
| `type_lieu`                           | TEXT   | `'Lieu activite'` / `'A distance'`       | Type de lieu (espace, pas PascalCase)         |
| `lieu_code_insee`                     | TEXT   | `'75056'` / `'971'`                      | Code INSEE du lieu (utilisé pour département) |
| `duree`                               | INT    | `45`                                     | Durée en minutes                              |
| `accompagnements`                     | INT    | `1` (individuel) / `12` (collectif)      | Nombre de personnes accompagnées              |
| `thematiques`                         | TEXT[] | `['Navigation sur internet', 'Email']`   | Thématiques médiation numérique               |
| `thematiques_demarche_administrative` | TEXT[] | `['Aide aux demarches administratives']` | Thématiques démarches                         |
| `materiels`                           | TEXT[] | `['Ordinateur', 'Tablette']`             | Matériels utilisés                            |

---

## Mappings bidirectionnels par entité

### 1. Médiateur

**SGN → Coop (outbound — résolution du filtre)**

| SGN                                                                | Coop                     | Traduction                                                                                                                                                                                               |
| ------------------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ScopeFiltre { type: 'structure', id: 42 }`                        | liste de `coop_id` UUIDs | `SELECT coop_id FROM min.personne_enrichie WHERE structure_employeuse_id = 42 OR (affectation active sur structure 42)` — utilisé uniquement si aucun filtre médiateur ni structure employeuse explicite |
| `ScopeFiltre { type: 'departemental', codes: ['75'] }`             | liste de `coop_id` UUIDs | `SELECT coop_id FROM personne_enrichie JOIN structure JOIN adresse WHERE adresse.departement = ANY(['75'])`                                                                                              |
| `ScopeFiltre { type: 'national' }`                                 | pas de filtre médiateur  | Aucune traduction nécessaire                                                                                                                                                                             |
| `StatistiquesFilters.mediateurs: [12, 34]` (IDs SGN)               | liste de `coop_id` UUIDs | `SELECT coop_id FROM min.personne_enrichie WHERE id = ANY(ARRAY[12,34])`                                                                                                                                 |
| `StatistiquesFilters.structuresEmployeuses: ['42', '7']` (IDs SGN) | liste de `coop_id` UUIDs | `SELECT coop_id FROM min.personne_enrichie WHERE structure_employeuse_id = ANY(ARRAY[42,7])` — **uniquement `structure_employeuse_id`**, pas les affectations                                            |

**Priorité de résolution des médiateurs (dans `page.tsx`) :**

| Filtres actifs                               | `mediateurs` envoyé à l'API Coop             |
| -------------------------------------------- | -------------------------------------------- |
| structures employeuses + médiateurs          | intersection des deux ensembles de `coop_id` |
| structures employeuses seules                | `coop_id` des médiateurs de ces structures   |
| médiateurs seuls                             | `coop_id` des médiateurs sélectionnés        |
| aucun filtre explicite (scope structure)     | `coop_id` de tous les médiateurs du scope    |
| aucun filtre explicite (scope national/dept) | pas de filtre médiateur                      |

**Coop → SGN (inbound — aucune traduction nécessaire)**
Le `personne_id` reste interne aux requêtes SQL. Il n'est jamais exposé dans le ViewModel.

---

### 2. Lieu / Structure

**Distinction entre lieux d'activité et structures employeuses**

Les deux filtres (`FiltreLieux` et `FiltreStructuresEmployeuses`) requêtent la même table `main.structure`, mais avec des critères différents :

| Filtre                 | Critère de sélection SGN                            | Résolution Coop                                                                                                  |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Lieux d'activité       | `JOIN main.activites_coop ON structure_id`          | `AND a.structure_id = ANY(...)` (filtre direct lieu)                                                             |
| Structures employeuses | `JOIN personne_enrichie ON structure_employeuse_id` | Résolu en `coop_id` médiateurs via `personne_enrichie.structure_employeuse_id` uniquement (pas les affectations) |

**SGN → Coop (outbound) — filtre lieux**

| SGN                                                    | Coop                                | Traduction                                                                                                            |
| ------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `main.structure.id` (INT SGN)                          | `activites_coop.structure_id` (INT) | **Identique** — même entier, pas de traduction d'identifiant                                                          |
| `StatistiquesFilters.lieux: ['42', '7']`               | filtre `structure_id`               | `AND a.structure_id = ANY(ARRAY['42','7']::int[])`                                                                    |
| `ScopeFiltre { type: 'departemental', codes: ['75'] }` | filtre via `adresse.departement`    | `JOIN structure s JOIN adresse ad WHERE ad.departement = ANY(['75'])` (pour construire la liste de lieux disponibles) |
| `ScopeFiltre { type: 'structure', id: 42 }`            | filtre `structure_id = 42`          | Direct — pas besoin de résolution intermédiaire                                                                       |

**Coop → SGN (inbound)**
Le `structure_id` Coop n'est pas exposé dans le ViewModel. Les lieux sont exposés par `main.structure.nom`.

---

### 3. Département

**SGN → Coop (outbound)**

| SGN                                              | Coop                                                            | Traduction                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `StatistiquesFilters.departements: ['75', '2A']` | `activites_coop.lieu_code_insee`                                | `AND LEFT(a.lieu_code_insee, 2) = ANY(ARRAY['75','2A'])` pour codes normaux   |
| code département DOM-TOM (`'971'`, `'972'`, ...) | `lieu_code_insee` commence par 97/98                            | `AND LEFT(a.lieu_code_insee, 3) = ANY(...)` si `lieu_code_insee ~ '^97\|^98'` |
| `ScopeFiltre { type: 'departemental', codes }`   | `departementsImplicites()` → `StatistiquesFilters.departements` | Propagation directe des codes dans les filtres                                |

SQL complet dans `PrismaStatistiquesLoader` :

```sql
AND (
  CASE
    WHEN a.lieu_code_insee ~ '^97|^98' THEN LEFT(a.lieu_code_insee, 3)
    ELSE LEFT(a.lieu_code_insee, 2)
  END
) = ANY(ARRAY['75','2A'])
```

---

### 4. Type d'activité

**SGN → Coop (outbound — filtre)**

| SGN (`StatistiquesFilters.types`) | Coop (`activites_coop.type`)             | Traduction                                        |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| `'Individuel'`                    | `'individuel'`                           | `.toLowerCase()` → `AND LOWER(a.type) = ANY(...)` |
| `'Collectif'`                     | `'collectif'`                            | `.toLowerCase()`                                  |
| `'Demarche'`                      | non applicable (filtre thématique admin) | Non traduit en filtre `type`                      |

**Coop → SGN (inbound — label)**

| Coop (`activites_coop.type`) | Clé canonique (PascalCase) | Label SGN affiché             |
| ---------------------------- | -------------------------- | ----------------------------- |
| `'individuel'`               | `'Individuel'`             | `'Accompagnement individuel'` |
| `'collectif'`                | `'Collectif'`              | `'Atelier collectif'`         |

Traduction : `toPascalCase(value)` → lookup `TYPE_ACTIVITE_LABELS[canonique]`

---

### 5. Type de lieu

**SGN → Coop (outbound — pas de filtre type_lieu exposé)**
Le type de lieu n'est pas filtrable depuis l'interface SGN. Il est seulement affiché.

**Coop → SGN (inbound — label)**

| Coop (`activites_coop.type_lieu`) | Clé canonique (PascalCase) | Label SGN affiché   |
| --------------------------------- | -------------------------- | ------------------- |
| `'Lieu activite'`                 | `'LieuActivite'`           | `"Lieu d'activité"` |
| `'A distance'`                    | `'ADistance'`              | `'À distance'`      |
| `'Domicile'`                      | `'Domicile'`               | `'À domicile'`      |
| `'Autre'`                         | `'Autre'`                  | `'Autre lieu'`      |

Traduction : `toPascalCase('Lieu activite')` → `'LieuActivite'` → lookup `TYPE_LIEU_LABELS['LieuActivite']`

---

### 6. Thématiques (médiation numérique)

**SGN → Coop (outbound — filtre)**

| SGN (`thematiqueNonAdministratives`)   | Coop (`activites_coop.thematiques[]`)        | Traduction                                                                                                              |
| -------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `'NavigationSurInternet'` (PascalCase) | `'Navigation sur internet'` (human-readable) | `toHumanReadable('NavigationSurInternet')` : insère un espace avant chaque majuscule, met en minuscule sauf premier mot |
| `'BanqueEtAchatsEnLigne'`              | `'Banque et achats en ligne'`                | même logique                                                                                                            |

SQL : `AND a.thematiques && ARRAY['Navigation sur internet','Email']::text[]`

**Coop → SGN (inbound — label)**

| Coop (`thematiques[]` element)         | Clé canonique                       | Label SGN affiché                      |
| -------------------------------------- | ----------------------------------- | -------------------------------------- |
| `'Navigation sur internet'`            | `'NavigationSurInternet'`           | `'Navigation sur internet'`            |
| `'Email'`                              | `'Email'`                           | `'E-mail'`                             |
| `'Aide aux demarches administratives'` | `'AideAuxDemarchesAdministratives'` | `'Aide aux démarches administratives'` |
| `'Argent'`                             | `'Argent'`                          | `'Argent - Impôts'`                    |

Traduction : `toPascalCase(value)` → lookup `THEMATIQUE_LABELS[canonique] ?? canonique`

---

### 7. Thématiques démarches administratives

Même logique que les thématiques médiation numérique, mais sur la colonne `thematiques_demarche_administrative`.

**SGN → Coop** : `StatistiquesFilters.thematiqueAdministratives` (PascalCase) → `toHumanReadable()` → `AND a.thematiques_demarche_administrative && ARRAY[...]::text[]`

**Coop → SGN** : même pipeline `toPascalCase` → `THEMATIQUE_LABELS`

---

### 8. Matériel

**SGN → Coop (outbound)** : pas de filtre matériel exposé dans l'interface.

**Coop → SGN (inbound — label)**

| Coop (`materiels[]` element) | Clé canonique  | Label SGN affiché   |
| ---------------------------- | -------------- | ------------------- |
| `'Ordinateur'`               | `'Ordinateur'` | `'Ordinateur'`      |
| `'Tablette'`                 | `'Tablette'`   | `'Tablette'`        |
| `'Telephone'`                | `'Telephone'`  | `'Téléphone'`       |
| `'Aucun'`                    | `'Aucun'`      | `'Pas de matériel'` |
| `'Autre'`                    | `'Autre'`      | `'Autre'`           |

Traduction : `toPascalCase(value)` → lookup `MATERIEL_LABELS[canonique]` avec agrégation (plusieurs variantes de casse peuvent coexister en DB)

---

### 9. Durée

**SGN → Coop (outbound)** : pas de filtre durée exposé dans l'interface.

**Coop → SGN (inbound — bucketing SQL + label)**

La durée est buckétisée en SQL dans `PrismaStatistiquesLoader` avant d'arriver dans le modèle brut :

| Coop (`activites_coop.duree` en minutes) | Plage brute (SGN) | Label SGN affiché   |
| ---------------------------------------- | ----------------- | ------------------- |
| `< 30`                                   | `'30'`            | `'Moins de 30 min'` |
| `>= 30` et `< 60`                        | `'60'`            | `'30min à 1 h'`     |
| `>= 60` et `< 120`                       | `'120'`           | `'1 h à 2 h'`       |
| `>= 120` (ou `NULL`)                     | `'more'`          | `'2 h et plus'`     |

Les 4 plages sont **toujours présentes** dans le modèle brut, avec `count: 0` si aucune activité.
Traduction finale : lookup `DUREE_PLAGES[plage].label` dans le presenter.

---

### 10. Dates

**SGN → Coop (outbound — filtre plage)**

| SGN (`StatistiquesFilters`) | Coop (SQL)                                                                        |
| --------------------------- | --------------------------------------------------------------------------------- |
| `du: '2024-01-01'`          | `AND a.date >= '2024-01-01'::date`                                                |
| `au: '2024-12-31'`          | `AND a.date <= '2024-12-31'::date`                                                |
| (aucun `du`)                | série depuis `CURRENT_DATE - 29 days` (jour) ou `CURRENT_DATE - 11 months` (mois) |

**Coop → SGN (inbound — formatage)**

| Coop (données brutes)           | SGN (label affiché) | Traduction                                       |
| ------------------------------- | ------------------- | ------------------------------------------------ |
| `date: '2024-03-15'` (ISO text) | `'15/03'`           | `split('-')` → `parties[2] + '/' + parties[1]`   |
| `month: 3, year: 2024` (INT)    | `'03/24'`           | `padStart(2,'0') + '/' + String(year).slice(-2)` |

---

## Résumé : ce qui traverse l'ACL

### Vers la Coop (outbound)

| Ce que SGN envoie                                         | Ce que la Coop reçoit                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ScopeFiltre { type: 'structure', id: 42 }`               | `coop_id` UUIDs des médiateurs de la structure 42 (scope implicite, si aucun filtre explicite) |
| `ScopeFiltre { type: 'departemental', codes: ['75'] }`    | `coop_id` UUIDs des médiateurs dont la structure est dans le 75                                |
| `mediateurs: [12, 34]` (IDs SGN)                          | `coop_id` UUIDs des médiateurs sélectionnés                                                    |
| `structuresEmployeuses: ['42', '7']` (IDs SGN)            | `coop_id` UUIDs des médiateurs dont `structure_employeuse_id` est dans la liste                |
| `lieux: ['42', '7']` (IDs SGN)                            | `a.structure_id = ANY(ARRAY[42,7]::int[])` (même ID)                                           |
| `departements: ['75', '2A']`                              | `LEFT(lieu_code_insee, 2 ou 3) = ANY(...)`                                                     |
| `thematiqueNonAdministratives: ['NavigationSurInternet']` | `thematiques && ARRAY['Navigation sur internet']`                                              |
| `types: ['Individuel']`                                   | `LOWER(a.type) = ANY(ARRAY['individuel'])`                                                     |
| `du / au: 'YYYY-MM-DD'`                                   | `a.date >= ... AND a.date <= ...`                                                              |

### Depuis la Coop (inbound)

| Ce que la Coop retourne                    | Ce que le ViewModel SGN expose                                     |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `type: 'individuel'`                       | `label: 'Accompagnement individuel'`                               |
| `type_lieu: 'Lieu activite'`               | `label: "Lieu d'activité"`                                         |
| `thematiques: ['Navigation sur internet']` | `label: 'Navigation sur internet', value: 'NavigationSurInternet'` |
| `duree: 45`                                | buckétisé → `label: '30min à 1 h'`                                 |
| `date: '2024-03-15'`                       | `label: '15/03'`                                                   |
| `month: 3, year: 2024`                     | `label: '03/24'`                                                   |
| `count: 47` sur 100 accompagnements        | `proportion: 47` (algorithme Largest Remainder)                    |
| `personne_id: 17`                          | **jamais exposé** (reste dans SQL)                                 |
| `structure_id: 42`                         | **jamais exposé** (reste dans SQL)                                 |
| `coop_id: 'uuid-...'`                      | **jamais exposé** (reste dans SQL)                                 |

---

## Dette technique connue

La résolution **SGN scope → identifiants Coop** est dispersée dans `page.tsx` plutôt qu'encapsulée dans une vraie couche ACL :

- La fonction `recupererStatistiques` dans `page.tsx` cumule : résolution des IDs, logique de priorité des filtres médiateurs, appel API Coop
- Les `coop_id` UUIDs ne fuient pas dans les URL (les filtres sont exprimés en IDs SGN), mais la traduction reste dans le controller

**L'ACL correcte devrait** encapsuler cette résolution dans un `PrismaStatistiquesLoader` dédié :

1. Recevoir `ScopeFiltre` + `StatistiquesPageFilters` SGN (sans identifiant Coop)
2. Résoudre en interne : `ScopeFiltre`, `mediateurs`, `lieux`, `structuresEmployeuses` → `coop_id[]`
3. Appeler l'API Coop avec les identifiants résolus
4. Retourner `StatistiquesCoopBrutesReadModel`
