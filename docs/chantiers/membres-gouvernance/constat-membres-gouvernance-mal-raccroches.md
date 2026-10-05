# Constat — membres de gouvernance raccrochés à la mauvaise structure

> Document de travail. Base de référence : `dataspace_dev` (localhost:5532).
> Tables : `min.membre`, `main.structure_administrative` (+ `main.adresse`).

## Contexte

Suite à la refonte structure (`main.structure` → `main.structure_administrative` /
`lieu_inclusion`, migrations Flyway V085/V086), on vérifie que les membres de gouvernance
pointent bien vers **leur** structure et non vers un doublon ou la structure d'un autre
territoire.

Rappel des colonnes utiles de `min.membre` :

| Colonne                        | Rôle                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `id`                           | identifiant métier, ex. `departement-41-41`                  |
| `nom`                          | **libellé historique fiable** du membre (ex. `Loir-et-Cher`) |
| `gouvernance_departement_code` | département de la gouvernance où le membre siège             |
| `is_coporteur`                 | membre co-porteur de la gouvernance                          |
| `siret_ridet`                  | SIRET/RIDET porté par le membre (souvent NULL)               |
| `old_structure_id`             | ancre vers l'ancien `main.structure` (souvent NULL)          |
| `structure_id`                 | FK actuelle vers `main.structure_administrative`             |

## Problème 1 — Conseils départementaux rattachés au CD d'un autre département

### Lecture de l'id

Pour les membres « conseil départemental », l'id suit le format
`departement-<collectivité>-<gouvernance>` :

- **1er nombre** = le département de la collectivité elle-même (= son `nom`) ;
- **2e nombre** = la gouvernance à laquelle elle participe (= `gouvernance_departement_code`).

La `structure_id` **doit** donc pointer vers le conseil départemental du **1er** nombre.
La SA cible correcte est identifiable de façon déterministe via le membre
`departement-<dep>-<dep>`.

### Cas de référence : Loir-et-Cher (41) — cohérent ✅

| id                  | `nom`        | `structure_id` | SIRET            | INSEE | dénomination                              |
| ------------------- | ------------ | -------------- | ---------------- | ----- | ----------------------------------------- |
| `departement-41-41` | Loir-et-Cher | **4622**       | `22410001600019` | 41018 | Conseil Départemental cité administrative |

Le membre (co-porteur) pointe vers la bonne SA. À noter : le doublon historique existe
toujours dans `structure_administrative` — **3 SA non fusionnées** partagent le SIRET
`22410001600019` : `4622` (old `main.structure` 60149), `4623` (old 170189),
`4624` (old 27984) — mais le membre est bien rattaché à 4622.

### Les 6 membres mal raccrochés

Dans chaque cas, le `nom` historique concorde avec le **1er** nombre (le département du
membre) mais la structure rattachée est celle du **2e** nombre (le département de la
gouvernance hôte).

| id                  | `nom` (historique) | Rattaché à (SA actuelle)         | INSEE actuel | Devrait être (SA attendue)       |
| ------------------- | ------------------ | -------------------------------- | ------------ | -------------------------------- |
| `departement-05-26` | Hautes-Alpes       | 4543 — Dpt de la Drôme (Valence) | 26362        | **4442** — Dpt des Hautes-Alpes  |
| `departement-18-36` | Cher               | 4604 — _(Indre)_                 | 36044        | **4491** — Dpt du Cher           |
| `departement-22-29` | Côtes-d'Armor      | 4565 — Dpt du Finistère          | 29232        | **4508** — _(Côtes-d'Armor)_     |
| `departement-35-22` | Ille-et-Vilaine    | 4508 — _(Côtes-d'Armor)_         | 22278        | **4602** — Dpt d'Ille-et-Vilaine |
| `departement-77-95` | Seine-et-Marne     | 4858 — Dpt du Val-d'Oise (Cergy) | 95127        | **4783** — _(Seine-et-Marne)_    |
| `departement-84-26` | Vaucluse           | 4543 — Dpt de la Drôme (Valence) | 26362        | **4803** — _(Vaucluse)_          |

> **Doublon croisé 22 ↔ 35** : le membre Côtes-d'Armor pointe vers le Finistère, et le
> membre Ille-et-Vilaine pointe vers les Côtes-d'Armor (4508) — chaîne décalée d'un cran.

### Cas écartés (faux positifs)

- `departement-48-30`, `departement-91-94` : rattachés à leur propre CD, simple
  participation à une gouvernance voisine — **OK**.
- `departement-67-68` : Collectivité Européenne d'Alsace, entité unique couvrant 67 et 68.
- DOM 97x / 98x : faux positifs du tronquage à 2 chiffres du code INSEE.

### Origine probable

Les 6 membres fautifs ont tous `is_coporteur = false`, **`old_structure_id = NULL` et
`siret_ridet = NULL`**. La migration V085 n'avait donc ni ancre `old_main_structure_id`
ni SIRET pour les remapper : leur mauvais rattachement **préexistait à la refonte** —
vraisemblablement attachés au porteur de la gouvernance hôte par la logique gouvernance
d'origine, et non à leur propre CD. À l'inverse, `41-41` (co-porteur) disposait d'une
ancre et reste correct.

### Correction envisagée

6 `UPDATE min.membre SET structure_id = <SA attendue>` ciblés, avec garde-fou
`nom` / SIRET (`22<dep>…`). _(à dérouler dans un second temps)_

---

## Problème 2 — Élargissement à tous les membres

On élargit le contrôle aux **2188 membres** (tous ont une `structure_id` non nulle).
Les ids structurés encodent l'identifiant attendu, ce qui permet une détection
**déterministe** par famille :

| Famille d'id          | Format                        | Identifiant comparé         | Volume |
| --------------------- | ----------------------------- | --------------------------- | ------ |
| `structure`           | `structure-<SIRET14>-<gouv>`  | SIRET exact vs `sa.siret`   | 1246   |
| `epci`                | `epci-<SIREN9>-<gouv>`        | SIREN vs `left(sa.siret,9)` | 304    |
| `commune`             | `commune-<INSEE>-<gouv>`      | INSEE / SIREN `21+insee`    | 267    |
| `departement`         | `departement-<dep>-<gouv>`    | `substr(siret,3,2)` = dep   | 97     |
| `prefecture` / `sgar` | `prefecture-<dep>` / `sgar-…` | — (pas d'ancre SIRET)       | 135    |
| `uuid` / autre        | UUID                          | — (pas d'ancre)             | 139    |

> ⚠️ **Couverture** : 274 membres (préfectures, SGAR, ids UUID) n'ont **pas** d'identifiant
> exploitable dans l'id ; non vérifiables par cette méthode (nécessiteraient un rapprochement
> nom/SIRET). À traiter séparément.

### Signaux à NE PAS confondre avec un bug

- **Même SIREN, établissement (NIC) différent** : 99 membres `structure`. La refonte a
  consolidé une SA par entité (SIREN) ; l'id portait un SIRET d'établissement précis.
  Entité correcte → **bénin** (ex. Orange, La Poste).
- **SIRET de l'id légèrement erroné (transposition) mais même entité** : 3 membres
  `structure` — `Voix des Femmes`, `HALAYE`, `La Fabrique des possibles`. La SA est la
  bonne (nom identique), c'est l'id qui porte une coquille → **bénin**.

### 2.a — EPCI rattachés à une autre entité (3)

| id                  | `nom`                                 | Rattaché à (SA)                       | Problème                 |
| ------------------- | ------------------------------------- | ------------------------------------- | ------------------------ |
| `epci-247200132-72` | CU Le Mans Métropole                  | 3629 — **Commune du Mans**            | EPCI → commune membre    |
| `epci-243900479-39` | CC Haut-Jura Arcade                   | 1029 — **Commune de Hauts de Bienne** | EPCI → commune membre    |
| `epci-200068914-16` | CC La Rochefoucauld porte du Périgord | 1309 — SA SIREN `200068014`           | SIREN voisin, à vérifier |

### 2.b — Communes rattachées à une autre entité (6)

| id                 | `nom`          | Rattaché à (SA)                               | Problème                             |
| ------------------ | -------------- | --------------------------------------------- | ------------------------------------ |
| `commune-49007-49` | **Angers**     | 2331 — **Mairie de Bonifacio (2A)** ‼️        | commune → commune corse sans rapport |
| `commune-51454-51` | **Reims**      | 6227 — CCAS (SIRET dép. 81, Tarn)             | commune → CCAS d'un autre dép.       |
| `commune-59512-59` | **Roubaix**    | 6381 — CCAS de l'Isle-Adam (95)               | commune → CCAS d'un autre dép.       |
| `commune-76217-76` | Dieppe         | 5358 — Cté d'agglo de la région dieppoise     | commune → son EPCI                   |
| `commune-09167-09` | Lézat-sur-Lèze | 1119 — CC Arize Lèze                          | commune → son EPCI                   |
| `commune-19151-19` | Noailles       | 8919 — « NOAILLES DISTRIBUTION » (entreprise) | commune → entreprise homonyme        |

### 2.c — Structures rattachées à une SA SANS SIRET (5)

Entité correcte (le `nom` de la SA est identique au membre) mais la SA cible n'a **pas** de
SIRET — vraisemblablement un _shell_ créé côté MIN, non raccordé à la SIRENE (ids SA élevés,
récents). Problème de **qualité de donnée** (SA à enrichir / fusionner), pas de mauvais
rattachement d'entité.

| id                             | `nom`                                                 | SA cible (sans siret) |
| ------------------------------ | ----------------------------------------------------- | --------------------- |
| `structure-09132573900017-35`  | Ensemble Partageons le Numérique                      | 11177                 |
| `structure-32532939300059-07`  | CIDFF07                                               | 11147                 |
| `structure-33986977900029-79`  | Fédération des Centres Socioculturels des Deux-Sèvres | 11184                 |
| `structure-77768873204287-59`  | APF France handicap (Association)                     | 11113                 |
| `structure-82251316700035-972` | UP AND SPACE MARTINIQUE                               | 11260                 |

### Synthèse Problème 2

| Catégorie                       | Nb  | Nature                     |
| ------------------------------- | --- | -------------------------- |
| CD → autre département (Pb 1)   | 6   | mauvais rattachement       |
| EPCI → autre entité (2.a)       | 3   | mauvais rattachement       |
| Commune → autre entité (2.b)    | 6   | mauvais rattachement       |
| Structure → SA sans SIRET (2.c) | 5   | qualité de donnée          |
| Même SIREN, établissement ≠     | 99  | bénin (consolidation)      |
| SIRET id erroné, même entité    | 3   | bénin (coquille id)        |
| Préfecture / SGAR / UUID        | 274 | non couverts (pas d'ancre) |

**15 vrais mauvais rattachements** (6 CD + 3 EPCI + 6 communes) + 5 SA à enrichir.

---

## Problème 3 — Nom affiché faux (ticket support : Paris Est Marne & Bois)

### Symptôme

Dans MIN, le co-porteur de la gouvernance du 94 s'affiche **« ville de Villiers sur Marne »**
au lieu de **« Paris Est Marne et Bois »** (EPT). La collectivité **est** bien co-porteuse —
seul le **nom d'affichage** est faux.

### D'où vient le nom affiché

`min/src/gateways/shared/MembresGouvernance.ts` → `determinerNomMembre()` :

```ts
return (
  membre.relationStructureAdministrative.denomination_antenne ??
  membre.relationStructureAdministrative.denomination_sirene ??
  ''
)
```

Le nom affiché = **`denomination_antenne` de la SA rattachée** si non nul, sinon
`denomination_sirene`. **`min.membre.nom` n'est PAS utilisé** par l'affichage (il vaut pourtant
« Paris Est Marne et Bois », correct). Le membre `epci-200057941-94` pointe vers la SA **978**
dont `denomination_antenne = "ville de Villiers sur Marne"` → c'est ça qui s'affiche.

### Décision de cadrage (utilisateur)

> **On ne corrige PAS les SA** (pas de modif de `denomination_antenne`) en première étape.
> On cherche un **pattern de re-rattachement** du membre vers la bonne SA.

## Le « stock » de SA canoniques

L'objectif de consolidation est d'avoir des **SA canoniques** : `denomination_antenne IS NULL`,
correspondant à l'API SIREN. `structure_administrative` **n'a pas d'unicité sur le SIRET**.

| Mesure                         | Valeur    |
| ------------------------------ | --------- |
| SA totales                     | 11 334    |
| Canoniques (`antenne IS NULL`) | 5 787     |
| Antennes (`antenne NOT NULL`)  | 5 547     |
| Sans SIRET                     | 156       |
| **SIRET avec 1 canonique**     | **5 787** |
| SIRET avec >1 canonique        | **0**     |
| SIRET sans canonique           | 2 025     |

> ✅ **Propriété clé** : la canonique est **unique par SIRET** quand elle existe →
> `WHERE siret = ? AND denomination_antenne IS NULL` renvoie 0 ou 1 ligne (déterministe).

## Pattern de re-rattachement (sans toucher aux SA, on ne modifie que `structure_id`)

On dérive une **clé** depuis le membre, par priorité, puis on cherche la cible :

| Étage | Clé (source)                                                                                 | Cible                                                                          | Fiabilité                             |
| ----- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| **1** | SIRET exact (`siret_ridet`, ou `structure-<SIRET14>`)                                        | canonique unique du SIRET                                                      | déterministe                          |
| **2** | SIREN (`epci-<SIREN>`, `departement→22+dep`, `commune→21+insee`, ou SIREN de la SA actuelle) | canonique du SIREN                                                             | bonne (vérifier multi-établissements) |
| **3** | `membre.nom` (libellé historique fiable)                                                     | parmi les SA du **même SIREN**, meilleure **similarité trigramme** (`pg_trgm`) | heuristique, seuil à valider          |

### Couverture mesurée

- **Étage 1** (structure + uuid) : déjà ~100 % sur la bonne canonique → **2** à re-rattacher
  seulement (`APEJ` 7002→7000, `FACE Territoire Bourbonnais` 10389→10387). RAS.
- **Étage 2** : ~453 collectivités ont une canonique atteignable par SIREN
  (143 EPCI + 174 communes + 97 préf + 39 CD).
- **Sans canonique** (~321, dont PEMB) : l'étage 3 (similarité nom) prend le relais.

### Démo étage 3 — Paris Est Marne & Bois (aucune canonique)

`membre.nom = "Paris Est Marne et Bois"` vs les 8 SA du SIREN `200057941` :

| SA               | nom                         | similarité  |
| ---------------- | --------------------------- | ----------- |
| **971**          | EPT Paris Est Marne & Bois  | **0.800** ⬅ |
| 975 / 976        | #parisestmarne&bois         | 0.577       |
| 978 _(actuelle)_ | ville de Villiers sur Marne | 0.150       |

→ `UPDATE min.membre SET structure_id = 971 WHERE id = 'epci-200057941-94'` : zéro modif de SA,
affichage devient « EPT Paris Est Marne & Bois ».

## ⚠️ Migrer `structure_id` ≠ déplacer une seule FK — surface complète

**7 FK** référencent `main.structure_administrative` :

| Table                                          | Colonne                       | Classe          |
| ---------------------------------------------- | ----------------------------- | --------------- |
| `min.membre`                                   | `structure_id`                | **gouvernance** |
| `min.utilisateur`                              | `structure_id`                | **gouvernance** |
| `main.contact_structure_administrative`        | `structure_administrative_id` | **gouvernance** |
| `main.poste`                                   | `structure_id`                | terrain         |
| `main.contrat`                                 | `structure_id`                | terrain         |
| `main.personne_affectations_emploi`            | `structure_administrative_id` | terrain         |
| `main.lieu_inclusion_structure_administrative` | `structure_administrative_id` | terrain         |

- **Cluster gouvernance** (membre + utilisateur + contact) : doit **voyager ensemble**. Re-rattacher
  le seul membre laisse utilisateurs et contacts orphelins sur l'ancienne SA.
- **Données terrain** (poste/contrat/affectation/lieu) : liées à l'établissement réel ; les déplacer
  relève d'une **fusion de SA** complète (mécanisme `audit.structure_merge_log` :
  `winner_id`/`loser_id`/`moved_identifiers`, transactionnel + gestion des collisions d'unicité).

### Empreinte PEMB (les 8 SA du SIREN, fragmentées)

| SA      | antenne                                                               | membre | utilisateur | contact | poste | contrat | affect. | lieu |
| ------- | --------------------------------------------------------------------- | -----: | ----------: | ------: | ----: | ------: | ------: | ---: |
| **978** | ville de Villiers sur Marne                                           |  **1** |       **2** |   **3** |     0 |       0 |       0 |    0 |
| **977** | #Parisestmarne&Bois Champigny (14 r. Louis Talamoni = **siège réel**) |      0 |           0 |       1 |    19 |      16 |      25 |    1 |
| 971     | EPT Paris Est Marne & Bois (Joinville)                                |      0 |           0 |       0 |     0 |       0 |       1 |    2 |
| 972-976 | L'Escale / Mairies / #PEMB                                            |      0 |           0 |       0 |     0 |       0 |    1-11 |  0-1 |

> ⚠️ 971, 977, 978 ont **le même SIRET** `20005794100011` / `denomination_sirene #PARISESTMARNE&BOIS` :
> ce sont des **doublons de la même entité**, pas des collectivités voisines. Le nom de commune dans
> `denomination_antenne` n'est qu'une **étiquette polluée**. La SA **977 n'est pas membre** (0 dans
> `min.membre`) ; elle porte le **terrain** au **siège réel** (Champigny).

## Motif systémique — gouvernance sur SA-antenne ≠ SA-terrain (même SIREN)

PEMB est un cas général : ~**179 membres** ont leur gouvernance sur une SA **sans terrain**, alors
que l'opérationnel (`postes + contrats + affectations + lieux`) vit sur une **autre SA du même
SIREN**.

| Famille     | Membres | SIREN multi-SA | **Terrain ailleurs** | Terrain déjà sur la SA membre |
| ----------- | ------: | -------------: | -------------------: | ----------------------------: |
| structure   |    1304 |            566 |              **106** |                           593 |
| EPCI        |     304 |            169 |               **27** |                           205 |
| préfecture  |     105 |             25 |               **15** |                            20 |
| commune     |     257 |             93 |               **13** |                           146 |
| département |      97 |             71 |               **12** |                            69 |
| uuid        |      64 |             28 |                **6** |                            33 |

Exemples : `departement-02-02` Aisne (gov 4422 « Conseil départemental » op=0 / terrain 4424
« DEPARTEMENT DE L AISNE » op=115) ; `commune-91345-91` Longjumeau (gov « Centre social » /
terrain « Mairie de Longjumeau ») ; `prefecture-48` Lozère (gov « PREFECTURE » / terrain
« France Services Mende »). La gouvernance est souvent raccrochée à un **point de service /
antenne** plutôt qu'à l'établissement réel.

### Règle de « winner » déterministe pour la consolidation

> **winner = la SA du SIREN avec la plus grosse empreinte opérationnelle**
> (`postes + contrats + affectations + lieux`) — pas la SA pointée par la gouvernance, ni celle
> au plus joli libellé.

Pour PEMB → **977** (siège Champigny, op=61). Reste ensuite à nettoyer son `denomination_antenne`
(étape SA différée) pour un affichage propre.

## Feuille de migration (dry-run) — `migration-membres-gouvernance-candidats.csv`

Un CSV par membre (2188 lignes) compare le **nom d'origine** (`membre.nom`), le **nom actuel
affiché** (`denomination_antenne` de la SA rattachée) et **3 candidats** : canonique (même SIRET,
`antenne IS NULL`), terrain (winner = max empreinte op. du SIREN), similarité (meilleur trigramme
vs `membre.nom`). Colonnes d'action : `action`, `cible_proposee`, `confiance`.

### Taxonomie `action`

| action                   |    n | sens                                                                 | cible_proposée      |
| ------------------------ | ---: | -------------------------------------------------------------------- | ------------------- |
| `ok_canonique`           | 1389 | déjà sur une SA canonique                                            | inchangé            |
| `ok`                     |  560 | déjà bon (terrain sur la SA, ou SA unique)                           | inchangé            |
| `corriger_entite`        |  140 | l'id encode une entité ≠ SIREN/SIRET/INSEE de la SA actuelle         | _(vide — manuel)_   |
| `fusionner_vers_terrain` |   98 | gouvernance sur antenne sans terrain ; terrain ailleurs (même SIREN) | SA-terrain (winner) |
| `rattacher_canonique`    |    1 | une canonique existe pour le SIRET                                   | SA canonique        |

- `confiance = a_revoir` quand : `corriger_entite`, ou `fusionner_vers_terrain` où **terrain ≠
  similarité** (arbitrage libellé vs terrain, ex. PEMB : terrain=977 / simil=971 ; préf. Lozère :
  terrain=France Services / actuelle=PREFECTURE). Sinon `haute`.

### ⚠️ `corriger_entite` mélange deux niveaux

- **dur** (vrais bugs) : entité d'un autre territoire — Angers→Bonifacio, Noailles→entreprise,
  Reims→CCAS du Tarn. ⇒ Problèmes 1 & 2.
- **doux** (~120, surtout commune) : commune rattachée à son **propre CCAS/EPCI** (forme juridique
  ≠ 21, même territoire) — 61 sur CCAS, 27 sur EPCI/asso, 5 sur un CD… Souvent _intentionnel_
  métier, mais l'affichage montre « CCAS de X » au lieu de « X ». À trancher avec le métier.

## Plan d'action

### 1. Deux parcours, selon l'action

Le correctif dépend de la nature du problème — **ne pas confondre fusion de SA et re-rattachement**.

| Parcours                 | Actions concernées                              | Volume | Mécanisme                                                                                                                                                                                                    | Touche aux SA ?                 |
| ------------------------ | ----------------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| **A — Fusion de SA**     | `fusionner_vers_terrain`                        |     98 | outil de fusion existant (`/structures-doublons/comparer`) : déplace les 7 FK (dont membre + utilisateur + contact) vers le _winner_, arbitre `denomination_antenne`, journalise `audit.structure_merge_log` | oui (soft-delete de l'absorbée) |
| **B — Re-rattachement**  | `corriger_entite` (dur) + `rattacher_canonique` |    ~20 | simple `UPDATE min.membre.structure_id` (+ utilisateur/contact) vers la SA de la **bonne entité**                                                                                                            | non                             |
| **C — Arbitrage métier** | `corriger_entite` (doux)                        |   ~120 | commune sur son propre CCAS/EPCI : décider si intentionnel                                                                                                                                                   | —                               |
| **—**                    | `ok` / `ok_canonique`                           |   1949 | rien                                                                                                                                                                                                         | —                               |

> Pourquoi pas tout en fusion : pour le parcours B, l'entité actuelle (ex. CCAS de Créteil) est
> **juridiquement distincte** de la bonne (commune de Créteil). Les fusionner serait faux — on
> re-pointe le membre, on ne fusionne pas.

### 2. État de l'outillage

- ✅ **Dry-run** : `migration-membres-gouvernance-candidats.csv` (2188 lignes, colonnes
  `action` / `cible_proposee` / `confiance`).
- ✅ **Prototype parcours A** : écran admin **`/membres-a-consolider`** qui détecte les 98 cas
  (signal _gouvernance sur antenne sans terrain_, angle mort de la détection doublons existante)
  et renvoie vers l'outil de fusion `/structures-doublons/comparer`. Aucun nouveau moteur de fusion.
  - Worktree `min-wt-membres-consolider`, branche `prototype-membres-a-consolider`
    (basée sur `structures-doublons-fusion-sa`). Typecheck + lint OK.
  - 5 fichiers : query `RechercherMembresAConsolider`, loader `PrismaMembresAConsoliderLoader`,
    presenter, composant `MembresAConsolider`, page.
- ⏳ **Reste à faire** sur le prototype : tests (loader/presenter/composant), `pnpm db:sync-dataspace`
  pour le faire tourner en local (la base min locale n'a pas `main.structure_administrative`),
  puis PR.
- ⏳ **Parcours B** : 2e écran « membres mal rattachés » (re-rattachement) — non prototypé.

### 3. Ordre de traitement suggéré

1. **Lot sûr d'abord** : les 43 `fusionner_vers_terrain` en `confiance = haute` (terrain = similarité)
   via l'écran de fusion.
2. **Arbitrages** : les 55 `fusionner_vers_terrain` en `a_revoir` (terrain ≠ similarité — ex. PEMB,
   préf. Lozère), un par un.
3. **Parcours B dur** : les ~20 `corriger_entite` d'un autre territoire (Angers→Bonifacio…).
4. **Arbitrage métier** : trancher les ~120 communes→CCAS/EPCI (intentionnel ou non ?).
5. **Nettoyage d'affichage** : à chaque fusion, mettre `denomination_antenne = NULL` sur le winner
   (→ affichage = `denomination_sirene`), via l'arbitrage `ChampsRetenus` de l'outil.
