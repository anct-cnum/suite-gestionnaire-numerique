# Postes Conseiller Numérique - Documentation technique

Cette documentation est en complément de la vue SQL postes_conseiller_numerique_synthese crée pour abstraire et factoriser la complexité sous-jacente des données actuellement présente en base.

## Contexte des données

### Tables et vue impliquées

- `main.poste` : Contient l'historique des postes CoNum
- `main.subvention` : Contient les subventions liées aux postes
- `main.structure` : Contient les informations sur les structures
- `main.adresse` : Contient les adresses des structures
- `main.contrat` : Contient les contrats des conseillers numériques
- **`min.postes_conseiller_numerique_synthese`** : Vue de synthèse (voir ci-dessous)

### Clés importantes

- `poste_conum_id` : Identifiant unique d'un poste Conseiller Numérique (le "vrai" poste)
- `poste.id` : Identifiant technique d'une ligne dans la table poste (peut y avoir plusieurs lignes par `poste_conum_id`). En effet la table poste stocke partiellement l'historique d'évolution du poste. Une ligne est ajoutée notamment quand principalement le contrat de travail change. Cela arrive quand :
  - Une personne quitte le poste
  - Une nouvelle personne arrive sur le poste
  - Le poste est transféré à une autre structure (concerne une centaine de postess).
  - Au moment d'un changement de convention. A la fin de la convention (typiquement à la fin de l'enveloppe V1 DGCL), le contrat de travail s'arrête et un nouveau est signé.

### Particularité de la table `poste`

Un même `poste_conum_id` peut avoir **plusieurs lignes** dans la table `poste`.
Chaque ligne représente une personne différente ayant été associée à ce poste.

Exemple pour `poste_conum_id=4` :
| poste.id | personne | etat | subventions |
|----------|----------|--------|-------------|
| 4 | P1 | occupe | 3 |
| 2891 | P2 | vacant | 0 |
| 3965 | P3 | vacant | 0 |

### Particularité de la table `subvention`

Un même `poste_conum_id` peut avoir **plusieurs lignes de subvention** de sources différentes.
Ces lignes correspondent à l'historique partiel des évolutions du poste (changement de personne, renouvellement de convention, etc.).

#### Enveloppes de financement

| Source | Enveloppe | Description                                                 |
| ------ | --------- | ----------------------------------------------------------- |
| DGCL   | **V1**    | Initial - Conseiller Numérique - Plan France Relance - État |
| DGE    | **V2**    | Renouvellement - Conseiller Numérique - État                |
| DITP   | **V2**    | Renouvellement - Conseiller Numérique - État                |

Exemple pour `poste_id=1853` :
| source | enveloppe | montant | bonification | total |
|--------|-----------|---------|--------------|-------|
| DGCL | V1 | 50 000 € | 7 500 € | 57 500 € |
| DGE | V2 | 50 000 € | 7 500 € | 57 500 € |
| **TOTAL** | V1 + V2 | | | **115 000 €** |

Pour simplifier la manipulation de ces données, pour centraliser les règles métiers sous-jacentes et pour éviter des régressions liées aux changement de structure de données de l'entrepôt, nous avons centralisé la totalité de ces règles dans une une vue SQL postes_conseiller_numerique_synthese.

---

## Vue de synthèse : `min.postes_conseiller_numerique_synthese`

Cette vue simplifie l'accès aux données en appliquant toutes les règles métier.

### Colonnes de la vue

| Colonne                     | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `poste_conum_id`            | Identifiant unique du poste CoNum                  |
| `poste_id`                  | Identifiant technique du poste sélectionné         |
| `structure_id`              | ID de la structure                                 |
| `personne_id`               | ID de la personne associée                         |
| `etat`                      | État du poste (occupe, vacant, rendu)              |
| `typologie`                 | Typologie du poste                                 |
| `est_coordinateur`          | `true` si typologie = 'coordo'                     |
| `enveloppes`                | Enveloppes de financement (ex: "V1, V2")           |
| `date_fin_convention`       | Date de fin de convention (MAX)                    |
| `date_fin_contrat`          | Date de fin du dernier contrat                     |
| `bonification`              | `true` si territoire prioritaire                   |
| `montant_subvention_cumule` | Montant total des subventions (V1 + V2)            |
| `montant_versement_cumule`  | Montant total des versements (V1 + V2)             |
| `subvention_v1`             | Montant subvention enveloppe V1 (DGCL)             |
| `bonification_v1`           | Montant bonification enveloppe V1                  |
| `versement_cumule_v1`       | Montant versé enveloppe V1                         |
| `subvention_v2`             | Montant subvention enveloppe V2 (DGE/DITP)         |
| `bonification_v2`           | Montant bonification enveloppe V2                  |
| `versement_cumule_v2`       | Montant versé enveloppe V2                         |
| `nb_contrats_en_cours`      | Nombre de contrats de travail actifs pour ce poste |

---

## Logique de sélection : 1 ligne par (poste_conum_id, structure_id)

Pour afficher **une seule ligne par tuple (poste_conum_id, structure_id)**, on sélectionne simplement **la ligne la plus récente** (`created_at DESC`).

```sql
ORDER BY p.poste_conum_id, p.structure_id, p.created_at DESC
```

> **Note** : Toutes les lignes d'un même `poste_conum_id` ont le même état. La modification d'état est faite globalement par `poste_conum_id`.

> **Note importante** : `subvention.poste_id` correspond à `poste.id` (la clé technique, pas `poste_conum_id`).

---

## Règles de calcul des montants

### Montant subvention cumulé

**Règle** : Cumuler les montants par enveloppe de financement (V1 + V2), **sans cumul intra-enveloppe**.

#### Pourquoi plusieurs lignes par enveloppe ?

Un même poste peut avoir plusieurs lignes de subvention pour la même enveloppe, dues à l'historique des évolutions :

- Un **changement de personne** sur le poste (turnover)
- Une **migration du poste** vers une autre structure
- Un **renouvellement de convention**

Le montant conventionné reste le même pour l'enveloppe : on prend donc **un seul montant par enveloppe** (le plus récent).

#### Logique de calcul

1. Pour chaque enveloppe (V1 ou V2), prendre **un seul montant** (le plus récent par date_fin_convention)
2. Sommer les montants des enveloppes V1 et V2

```sql
-- Étape 1 : Un montant par enveloppe
SELECT DISTINCT ON (poste_id, enveloppe)
  poste_id,
  CASE WHEN source_financement = 'DGCL' THEN 'V1' ELSE 'V2' END as enveloppe,
  montant_subvention + montant_bonification as montant
FROM main.subvention
ORDER BY poste_id, enveloppe, date_fin_convention DESC

-- Étape 2 : Cumul V1 + V2
SELECT poste_id, SUM(montant) as montant_subvention_cumule
FROM subventions_par_enveloppe
GROUP BY poste_id
```

### Montant versement cumulé

**Règle** : Cumuler **tous les versements** de toutes les lignes de subvention.

```sql
SELECT
  poste_id,
  SUM(versement_1 + versement_2 + versement_3) as montant_versement_cumule
FROM main.subvention
GROUP BY poste_id
```

### Indicateur de contrats en cours

La colonne `nb_contrats_en_cours` compte le nombre de contrats de travail actifs pour toutes les personnes associées au tuple (poste_conum_id, structure_id).

Un contrat est considéré "en cours" si :

- `date_debut <= aujourd'hui`
- `date_fin >= aujourd'hui` (ou `NULL`)
- `date_rupture IS NULL`

#### Détection des incohérences

Cette colonne permet de détecter des incohérences dans les données :

| État   | nb_contrats | Statut                                     |
| ------ | ----------- | ------------------------------------------ |
| occupe | 0           | ⚠️ Incohérence : occupé sans contrat actif |
| occupe | 1           | ✅ Normal                                  |
| vacant | 0           | ✅ Normal                                  |
| rendu  | 0           | ✅ Normal                                  |
| rendu  | 1           | ⚠️ Incohérence : rendu avec contrat actif  |

---

## Colonnes du tableau d'affichage

### 1. Structure - ID poste

- **Source** : `main.structure.nom` + `poste_conum_id`
- **Affichage** : Nom de la structure + "Poste #X"
- **Badge "Coordinateur"** : Affiché si `est_coordinateur = true`

### 2. Dép. (Département)

- **Source** : `main.adresse.departement` (via `structure.adresse_id`)
- **Affichage** : Code département (ex: "02", "69")
- **Note** : Colonne masquée si l'utilisateur n'est pas au niveau national (France)

### 3. Statut

- **Source** : `etat` de la vue
- **Valeurs possibles** :
  - `occupe` → Badge vert "Occupé"
  - `vacant` → Badge tilleul "Vacant"
  - `rendu` → Badge rouge "Rendu"

### 4. Enveloppes de financement

- **Source** : `enveloppes` de la vue
- **Affichage** : "Initiale" si "V1", "Renouvellement" si "V2", "Renouvellement" si "V1, V2".

### 5. Fin de convention

- **Source** : `date_fin_convention` de la vue
- **Affichage** : Date au format français (JJ/MM/AAAA) ou "-" si null

### 6. Fin de contrat

- **Source** : `date_fin_contrat` de la vue
- **Affichage** : Date au format français (JJ/MM/AAAA) ou "-" si null

### 7. Bonification

- **Source** : `bonification` de la vue
- **Affichage** : "Oui" si `true`, vide sinon

### 8. Total conventionné

- **Source** : `montant_subvention_cumule` de la vue
- **Affichage** : Montant formaté en euros (ex: "115 000 €") ou "-" si 0

### 9. Total versé

- **Source** : `montant_versement_cumule` de la vue
- **Affichage** : Montant formaté en euros ou "-" si 0

### 10. Action

- **Bouton œil** : Pour voir le détail du poste (non implémenté actuellement)

---

## Indicateurs (3 cartes en haut)

### Carte 1 : Postes occupés

- **Numérateur** : Nombre de postes avec `etat='occupe'`
- **Dénominateur** : Nombre de postes avec `etat IN ('occupe', 'vacant')`
- **Note** : Les postes "rendu" ne sont pas comptés dans le dénominateur

### Carte 2 : Structures conventionnées

- **Valeur** : Nombre de structures distinctes (`structure_id`) ayant un poste avec `etat IN ('occupe', 'vacant')`
- **Contexte** : "pour X postes" (même dénominateur que carte 1)

### Carte 3 : Budget total conventionné

- **Valeur principale** : Somme des `montant_subvention_cumule`
- **Sous-valeur** : "dont X € versé" = Somme des `montant_versement_cumule`

---

## Filtrage par territoire

- **Administrateur (France)** : Voit tous les postes, colonne département affichée
- **Gestionnaire département** : Ne voit que les postes dont la structure est dans son département, colonne département masquée
- **Gestionnaire région** : Ne voit que les postes dont la structure est dans sa région

Le filtre s'applique via `main.adresse.departement` (jointure structure → adresse).

---

## Architecture de la base de données

La modélisation des tables actuellement est hérité et mériterait d'être amélioré. Pour mémoire, et pour documenter la manière dont il faut `penser` les données actuellement en base, voici un descriptif du schéma de données actuel et celui que l'on peut envisager pour l'améliorer. Ce qu'il faut bien garder en tête, c'est que l'on stocke, c'est l'évolution patielle du poste au cours du temps. Les tables d'associations proposées sont une bonne manière de stocker ces événemens.

### Schéma actuel

Le schéma actuel utilise une table `poste` qui mélange plusieurs concepts :

```
┌─────────────────────┐         ┌─────────────────────┐
│       poste         │         │     subvention      │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │◄────────│ poste_id (FK)       │
│ poste_conum_id      │   1..n  │ id (PK)             │
│ structure_id (FK)   │         │ source_financement  │
│ personne_id (FK)    │         │ montant_subvention  │
│ etat                │         │ ...                 │
│ typologie           │         └─────────────────────┘
│ created_at          │
└─────────────────────┘
         │n         │n
         │          │
         ▼1         ▼1
┌─────────────┐  ┌─────────────┐
│  structure  │  │  personne   │
└─────────────┘  └─────────────┘
```

La FK `subvention.poste_id` référence `poste.id` (la clé technique)

**Problèmes du schéma actuel** :

1. La table `poste` est une **table d'association ternaire** implicite entre un poste logique (`poste_conum_id`), une structure et une personne
2. Le champ `etat` (`occupe`, `vacant`, `rendu`) dont on peut imaginer qu'il stocke l'état d'occupation du poste par la personne concernée sur la ligne mais en fait ce n'est pas le cas : on stocke le dernier état du poste et on met à jour **toutes les lignes du même `poste_conum_id`** (y compris celles d'autres structures si le poste a été transféré).

### Proposition d'architecture cible

Pour mieux représenter la réalité métier :

- L'État attribue un **poste** à une **structure**
- La structure emploie une **personne** sur ce poste
- Le poste peut être **transféré** à une autre structure

```
┌──────────────────┐
│  poste_logique   │  (le poste CoNum attribué par l'État)
│  poste_conum_id  │
└────────┬─────────┘
         │ 1
         │
         ▼ n
┌──────────────────────────────┐     ┌─────────────┐
│  rattachement_structure      │────►│  structure  │
│  (poste hébergé par struct.) │     └─────────────┘
├──────────────────────────────┤
│ id (PK)                      │
│ poste_conum_id (FK)          │
│ structure_id (FK)            │
│ date_debut                   │
│ date_fin (null = actuel)     │
└──────────────┬───────────────┘
               │ 1
               │
               ▼ n
┌──────────────────────────────┐     ┌─────────────┐
│  affectation_personne        │────►│  personne   │
│  (personne sur ce rattach.)  │     └─────────────┘
├──────────────────────────────┤
│ id (PK)                      │
│ rattachement_id (FK)         │
│ personne_id (FK)             │
│ date_debut                   │
│ date_fin (null = actuel)     │
└──────────────────────────────┘
```

**Avantages** :

1. Séparation claire des concepts :

   - `rattachement_structure` : historique des transferts de poste entre structures
   - `affectation_personne` : historique des personnes employées sur un rattachement

2. États déduits automatiquement :

| État     | Condition                                                    |
| -------- | ------------------------------------------------------------ |
| `occupe` | rattachement actif (`date_fin IS NULL`) + affectation active |
| `vacant` | rattachement actif + aucune affectation active               |
| `rendu`  | aucun rattachement actif                                     |

3. Relation `subvention` plus claire : `subvention.poste_id` → `poste_logique.poste_conum_id`
