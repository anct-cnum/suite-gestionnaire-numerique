# Logique d'affichage du listing "Suivi des postes Conseiller Numérique"

## Contexte des données

### Tables impliquées

- `main.poste` : Contient l'historique des postes CoNum
- `main.subvention` : Contient les subventions liées aux postes
- `main.structure` : Contient les informations sur les structures
- `main.adresse` : Contient les adresses des structures
- `main.contrat` : Contient les contrats des conseillers numériques

### Clés importantes

- `poste_conum_id` : Identifiant unique d'un poste Conseiller Numérique (le "vrai" poste)
- `poste.id` : Identifiant technique d'une ligne dans la table poste (peut y avoir plusieurs lignes par `poste_conum_id`)

### Particularité de la table `poste`

Un même `poste_conum_id` peut avoir **plusieurs lignes** dans la table `poste`.
Chaque ligne représente une personne différente ayant été associée à ce poste.

Exemple pour `poste_conum_id=4` :
| poste.id | personne | etat | subventions |
|----------|----------|--------|-------------|
| 4 | P1 | occupe | 3 |
| 2891 | P2 | vacant | 0 |
| 3965 | P3 | vacant | 0 |

---

## Logique de sélection : 1 ligne par poste_conum_id

Pour afficher **une seule ligne par poste CoNum**, on sélectionne la ligne selon cette priorité :

1. **La ligne qui a la subvention avec la `date_fin_convention` la plus récente**
2. Si pas de subvention ou égalité : **la ligne avec `etat='occupe'`** en priorité
3. Sinon : **la ligne avec `etat='vacant'`**
4. Sinon : **la ligne avec `etat='rendu'`**
5. En dernier recours : **la ligne créée le plus récemment** (`created_at DESC`)

```sql
ORDER BY p.poste_conum_id,
         s.date_fin_convention DESC NULLS LAST,
         (CASE WHEN p.etat = 'occupe' THEN 0 WHEN p.etat = 'vacant' THEN 1 ELSE 2 END),
         p.created_at DESC
```

---

## Colonnes du tableau

### 1. Structure - ID poste

- **Source** : `main.structure.nom` + `main.poste.poste_conum_id`
- **Affichage** : Nom de la structure + "Poste #X"
- **Badge "Coordinateur"** : Affiché si `main.poste.typologie = 'coordo'`

### 2. Dép. (Département)

- **Source** : `main.adresse.departement` (via `structure.adresse_id`)
- **Affichage** : Code département (ex: "02", "69")
- **Note** : Colonne masquée si l'utilisateur n'est pas au niveau national (France)

### 3. Statut

- **Source** : `main.poste.etat` de la ligne sélectionnée
- **Valeurs possibles** :
  - `occupe` → Badge vert "Occupé"
  - `vacant` → Badge tilleul "Vacant"
  - `rendu` → Badge rouge "Rendu"

### 4. Convention (Type de convention)

- **Source** : `main.subvention.source_financement` de la dernière subvention du poste sélectionné
- **Valeurs possibles** : `DGCL`, `DGE`, `DITP`
- **Affichage** : Valeur brute ou "-" si null
- **TODO** : Mapper vers des libellés métier quand la règle sera connue

### 5. Fin de convention

- **Source** : `main.subvention.date_fin_convention` de la dernière subvention du poste sélectionné
- **Affichage** : Date au format français (JJ/MM/AAAA) ou "-" si null

### 6. Fin de contrat

- **Source** : `main.contrat.date_fin` du dernier contrat de la personne associée au poste sélectionné
- **Affichage** : Date au format français (JJ/MM/AAAA) ou "-" si null
- **Jointure** : Sur `personne_id` et `structure_id`

### 7. Bonification

- **Source** : `main.subvention.is_territoire_prioritaire` de la dernière subvention du poste sélectionné
- **Affichage** : "Oui" si true, vide sinon

### 8. Total conventionné

- **Source** : Calculé depuis la dernière subvention du poste sélectionné
- **Calcul** : `montant_subvention + montant_bonification`
- **Affichage** : Montant formaté en euros (ex: "44 000 €") ou "-" si 0

### 9. Total versé

- **Source** : Calculé depuis la dernière subvention du poste sélectionné
- **Calcul** : `versement_1 + versement_2 + versement_3`
- **Affichage** : Montant formaté en euros ou "-" si 0

### 10. Action

- **Bouton œil** : Pour voir le détail du poste (non implémenté actuellement)

---

## Indicateurs (3 cartes en haut)

### Carte 1 : Postes occupés

- **Numérateur** : Nombre de `poste_conum_id` dont le poste sélectionné a `etat='occupe'`
- **Dénominateur** : Nombre de `poste_conum_id` dont le poste sélectionné a `etat IN ('occupe', 'vacant')`
- **Note** : Les postes "rendu" ne sont pas comptés dans le dénominateur

### Carte 2 : Structures conventionnées

- **Valeur** : Nombre de structures distinctes (`structure_id`) ayant un poste avec `etat IN ('occupe', 'vacant')`
- **Contexte** : "pour X postes" (même dénominateur que carte 1)

### Carte 3 : Budget total conventionné

- **Valeur principale** : Somme de `(montant_subvention + montant_bonification)` de la dernière subvention de chaque poste sélectionné
- **Sous-valeur** : "dont X € versé" = Somme de `(versement_1 + versement_2 + versement_3)`

---

## Filtrage par territoire

- **Administrateur (France)** : Voit tous les postes, colonne département affichée
- **Gestionnaire département** : Ne voit que les postes dont la structure est dans son département, colonne département masquée
- **Gestionnaire région** : Ne voit que les postes dont la structure est dans sa région

Le filtre s'applique via `main.adresse.departement` (jointure structure → adresse).
