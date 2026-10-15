# Proposition à l'équipe Coop : MIN modifie les lieux Coop par double écriture

> **Statut** : figé · **Public** : tech · **Mis à jour** : 2026-10-15 · **Tickets** : #2101

> **Réponse reçue le 15/10/2026 : la double écriture n'est pas retenue.** MIN écrit le registre seul, et le dataspace retire son filet. Voir le §8 et la [conception](conception-lieux-coop-modifiables.md).

Ce document est à faire valider par l'équipe de développement de la Coop numérique. **Rien ne sera développé côté MIN sans votre accord.** L'analyse complète se trouve dans [conception-lieux-coop-modifiables.md](conception-lieux-coop-modifiables.md).

## 1. Le besoin

Les gestionnaires de MIN (administrateurs, gestionnaires de région, de département et de structure) corrigent les lieux de leur territoire : nom, horaires, services, publics, adresse, visibilité sur la carte.

Aujourd'hui, un lieu géré par la Coop (`main.lieu_inclusion.structure_coop_id` non nul) est **en lecture seule dans MIN**. La raison : MIN n'écrit que dans `main.lieu_inclusion`. Le filet quotidien du dataspace (`registre_lieux_coop.py`, 08:00) réaligne le registre sur `coop.lieu_inclusion` par valeurs, donc toute correction MIN disparaît le lendemain.

Nous voulons lever ce blocage sans créer de deuxième vérité.

## 2. Ce que nous avons compris de votre code

Merci de nous corriger si une de ces lectures est fausse. Elles portent sur `origin/main` au 14/10, commit `0b453a1ca`.

1. **Double écriture.** Chaque écriture de lieu touche `coop.lieu_inclusion` **et** `main.lieu_inclusion` dans une transaction, section par section. La correspondance des colonnes est dans `modifier-la-fiche-du-lieu/implementation/prisma/colonnes-par-section.ts`, et l'écriture dans `enregistrer-les-sections.ts`.
2. **Signature au registre** : `source='Coop numérique'`, `edited_by='coop'`, `updated_at_coop`, `deleted_at=NULL` (`signature-coop.ts`).
3. **Lecture.** La fiche affichée vient du registre (`fiche-du-registre.ts`). La « dernière modification » prend en compte `updated_at_min` et `source`.
4. **Flux national.** `/api/v1/lieux-activite` publie depuis `coop.lieu_inclusion` (`lieux-publies.query.ts`).
5. **Adresse.** On passe par `main.trouver_ou_creer_adresse_lieu(...)`, et on n'en modifie jamais une en place.
6. **Suppression** (`supprimer-le-lieu.mutation.ts`) : `suppression` côté Coop, `deleted_at` et visibilité à false au registre, **et fermeture des `mediateurs_en_activite` du lieu**.
7. **Règle opératoire** (`CONTRIBUTING.md:703-706`, ADR-003) : tout SQL sur `coop.lieu_inclusion` passe par l'application ou se signale au dataspace.

## 3. Ce que nous proposons

**Pour un lieu Coop, MIN fait exactement ce que fait la Coop** : il écrit, dans **une seule transaction**, les colonnes modifiées de `main.lieu_inclusion` **et** les colonnes correspondantes de `coop.lieu_inclusion` (`id = structure_coop_id`).

Conséquences :

- les deux tables restent égales ;
- le filet du dataspace ne trouve aucun écart et n'écrase rien ;
- votre fiche et votre flux national montrent immédiatement la correction.

Ce mode de fonctionnement a déjà un précédent : MIN écrit en SQL dans `coop.activites` et `coop.employes_structures` lors de la fusion de structures administratives, avec des droits accordés par le dataspace (migration V142).

### 3.1 Colonnes écrites par MIN

Notre découpage suit votre `colonnes-par-section.ts`.

| Écran MIN                              | `main.lieu_inclusion`                                                                             | `coop.lieu_inclusion`                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Informations générales                 | `nom`, `adresse_id`, `complement_adresse`, `siret_a_l_enrichissement`, `itinerance`, `typologies` | `nom`, `adresse`, `commune`, `code_postal`, `code_insee`, `latitude`, `longitude`, `ban_id`, `complement_adresse`, `siret`, `itinerance`, `typologies` |
| Description                            | `presentation_resume`, `presentation_detail`, `typologies`                                        | mêmes colonnes                                                                                                                                         |
| Informations pratiques                 | `horaires`, `prise_rdv`, `itinerance`, `contact.site_web`                                         | `horaires`, `prise_rdv`, `itinerance`, `site_web`                                                                                                      |
| Modalités d'accès                      | `modalites_acces`, `frais_a_charge`, `contact.telephone`, `contact.courriels.email`               | `modalites_acces`, `frais_a_charge`, `telephone`, `courriels`                                                                                          |
| Types d'accompagnement                 | `services`, `modalites_acces`, `modalites_accompagnement`                                         | mêmes colonnes                                                                                                                                         |
| Publics                                | `publics_specifiquement_adresses`, `prise_en_charge_specifique`                                   | mêmes colonnes                                                                                                                                         |
| Visibilité cartographique (étape 2)    | `visible_pour_cartographie_nationale`                                                             | `visible_pour_cartographie_nationale` (+ `services` si le socle par défaut s'applique)                                                                 |
| Suppression (étape 2, voir question 1) | `deleted_at`, visibilité à false                                                                  | `suppression`, visibilité à false (+ `mediateurs_en_activite` selon votre réponse)                                                                     |

MIN ne touche à rien d'autre : ni `id`, ni `creation*`, ni `rna`, ni les référents, ni `activites_count`, ni les colonnes `v1_*`. Il ne fait **jamais d'INSERT** dans `coop.lieu_inclusion` : MIN ne crée pas de lieu Coop.

### 3.2 Signature

- **Registre**, comme aujourd'hui : `source='Mon Inclusion Numérique'`, `edited_by='min'`, `updated_at_min=now()`.
- **`coop.lieu_inclusion`**
  - `modification = now()` ;
  - `derniere_modification_source = 'Mon Inclusion Numérique'` ;
  - `derniere_modification_par_id = NULL`, car un agent MIN n'est pas un utilisateur Coop (clé étrangère vers `coop.users`).
- **Registre, `updated_at_coop = now()`**. Sans lui, l'étape 3 du filet (`cl.modification > updated_at_coop`) recalculerait l'adresse et repasserait la ligne en `edited_by='coop'`. Voir la question 3.

### 3.3 Vos règles, appliquées par MIN

MIN écrit votre vérité. Pour un lieu Coop, il appliquera donc vos règles en plus des siennes :

- **adresse** : le résultat doit venir de la BAN (`ban_id`, coordonnées), puis on appelle `main.trouver_ou_creer_adresse_lieu` comme vous le faites. Le chemin MIN qui reprend l'adresse depuis SIRENE sera refusé ou passera par la BAN ;
- au moins une typologie ;
- SIRET à 14 chiffres avec clé de Luhn ;
- horaires au format OSM : MIN utilise déjà `@gouvfr-anct/timetable-to-osm-opening-hours` ;
- téléphone et courriel exigés selon les modalités d'accès ;
- publication (`domain/publication.ts`) : un lieu visible annonce au moins un service, avec le socle `SERVICES_PAR_DEFAUT` quand on rend visible un lieu sans service ; on ne retire pas le dernier service d'un lieu visible ; rendre visible exige une adresse BAN.

Si une règle manque à cette liste, dites-le-nous.

## 4. Ce que cela change pour vous

**Rien dans votre code n'est obligatoire.** Ce que nous vous demandons :

1. **Valider le principe** : MIN devient le deuxième écrivain de `coop.lieu_inclusion`, limité aux colonnes du §3.1. Si vous êtes d'accord, il faudrait l'inscrire dans ADR-003 et dans `CONTRIBUTING.md` (règle « tout SQL sur `coop.lieu_inclusion`… »).
2. **Ajouter le libellé « Mon Inclusion Numérique »** à `libraries/cartographie-nationale/sources.ts`. Sinon la valeur s'affiche brute.
3. **Nous prévenir avant toute migration de `coop.lieu_inclusion`** qui renomme ou change le type d'une colonne du §3.1. Exemple : le passage de `site_web` en `text[]` (V176). De notre côté, un test d'intégration MIN tournera sur le schéma `coop` réel pour détecter une rupture.

Côté dataspace (pas chez vous), une migration accordera à `min_scalingo` le droit `UPDATE` sur les seules colonnes du §3.1, sur le modèle de V142.

## 5. Questions pour vous

1. **Suppression d'un lieu qui a des médiateurs actifs.** Vous fermez leurs rattachements. Laquelle de ces options préférez-vous ?
   - (a) MIN fait comme vous, avec un droit `UPDATE` sur `coop.mediateurs_en_activite` ;
   - (b) MIN refuse la suppression tant que le lieu a des médiateurs actifs ;
   - (c) MIN ne supprime jamais un lieu Coop.

   Nous penchons pour (b).

2. **Prévenir les médiateurs.** Comme les deux tables restent égales, votre bandeau de reprise externe ne s'affichera pas. Seule la « dernière modification : Mon Inclusion Numérique » sera visible. Est-ce suffisant, ou voulez-vous une notification ? Si oui, laquelle, et lisez-vous `updated_at_min` / `source` pour la déclencher ?
3. **Horodatages.** Est-ce que les écritures suivantes vous conviennent, ou faussent-elles une de vos lectures (inventaire, tri, reprise, filtre `modification.depuis` de `/api/v1/structures`) ?
   - `modification = now()` et `derniere_modification_source` côté Coop ;
   - `updated_at_coop = now()` au registre.
4. **`derniere_modification_par_id = NULL`.** Est-ce acceptable, ou un écran suppose-t-il un auteur non nul quand la source est absente ?
5. **Vos lectures du registre.** En dehors de `fiche-du-registre.ts`, `derniere-ecriture.ts` et `modification-du-registre.ts`, y a-t-il un endroit où une ligne signée MIN serait mal interprétée ?
6. **Concurrence.** Si un médiateur et un agent MIN modifient la même section, la dernière écriture gagne, comme entre deux médiateurs aujourd'hui. Avez-vous un verrou optimiste ou un contrôle de version que nous devrions respecter ?
7. **Valeurs des enums.** Nous écrirons les nomenclatures en convertissant le texte vers vos enums (`::text[]::coop.service[]`). Confirmez-vous que les valeurs de `coop.*` et de `main.*` sont identiques et le resteront ?
8. **Évolution de `site_web`.** Le passage en `text[]` est-il déployé en production ?

## 6. Calendrier envisagé

1. Votre validation, et les réponses aux questions 1 à 8.
2. Dataspace : droit `UPDATE` par colonne et mise à jour de sa documentation.
3. MIN, étape 1 : double écriture des **données** (toutes les sections du §3.1, adresse comprise).
4. MIN, étape 2 : visibilité cartographique et suppression, selon vos réponses aux questions 1 et 2.
5. De votre côté, quand vous le souhaitez : libellé de source et mise à jour d'ADR-003 et de `CONTRIBUTING.md`.

## 7. Alternatives écartées

| Alternative                                                                       | Pourquoi nous l'écartons                                                                                                                                               |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Une API d'écriture Coop appelée par MIN                                           | Vous auriez une API entière à construire et à maintenir, pour relier deux schémas d'une même base.                                                                     |
| MIN écrit le registre seul, le filet l'épargne, le médiateur arbitre dans la Coop | Les deux tables divergent jusqu'à l'arbitrage, et votre flux national resterait sur l'ancienne valeur. Il faudrait aussi modifier le filet et votre détection d'écart. |
| Bascule de propriété du lieu vers MIN                                             | Les médiateurs perdraient la main sur leur lieu, et les trois dépôts devraient ignorer les lieux basculés.                                                             |
| MIN n'édite que ce que le filet ne réaligne pas                                   | Il ne resterait que le complément d'adresse et le SIRET : cela ne répond pas au besoin.                                                                                |

## 8. Réponse de l'équipe Coop (15/10/2026)

**Sur le principe**

- MIN _peut_ écrire `coop.lieu_inclusion`, mais ce n'est pas utile, et ne pas le faire simplifie beaucoup le code de MIN.
- Sans double écriture, la Coop récupère de toute façon les données du registre et affiche partout les valeurs mises à jour par MIN. La seule différence se voit dans l'interface d'édition : la modale présente aux médiateurs du lieu la différence avec ce qui a été saisi dans MIN.

**Ce qui est important**

- Signer le registre avec la date et la source de la modification : `updated_at_min`, `source`, `edited_by`.
- Ne pas toucher à `updated_at_coop`, qui doit continuer à dire quand la Coop a écrit.
- Appliquer les mêmes règles de validation, sans les réécrire : tout est dans la bibliothèque `@gouvfr-anct/lieux-de-mediation-numerique`.
- **Prérequis : le dataspace arrête de réaligner le registre sur `coop.lieu_inclusion`** (`registre_lieux_coop.py`). Ce réalignement n'a plus lieu d'être : la Coop fait déjà la double écriture, et le registre est la source de vérité, comme décidé ensemble. S'il y a une mise à jour dans le registre, c'est lui qui a raison.

**Flux national (sujet à part).** Il récupère toutes les sources externes, dont la Coop, les fusionne et les déduplique. Il exclut donc les modifications de MIN, qui ne partage pas ses données dans ce flux. Deux pistes :

1. ajouter à mednum-cli une source qui ne contient que les lieux dont la source est MIN ;
2. produire une sortie qui ne contient que les sources qui ne sont ni la Coop ni MIN, et laisser l'Entrepôt faire une fusion et une déduplication supplémentaires.

**Réponses aux questions du §5**

1. **Suppression** : sans écriture MIN dans la Coop, la suppression côté MIN n'a pas d'impact sur la Coop. Si le médiateur met à jour son lieu, celui-ci revient dans le registre, ce qui est légitime.
2. **Notification** : c'est la modale d'écart de l'interface d'édition qui prévient le médiateur. Pas besoin de notification supplémentaire.
3. **Horodatages** : ne pas toucher à `modification` ni à `derniere_modification_source` côté Coop. Au registre, poser uniquement `updated_at_min`, pas `updated_at_coop`.
4. **Auteur vide** : la question ne se pose plus.
5. **Lectures du registre** : non, la Coop est prévue pour lire les informations du registre qui viennent des sources externes.
6. **Verrou** : non.
7. **Enums** : oui, les valeurs sont identiques (alignement sur le schéma mednum).
8. **`site_web` en `text[]`** : oui, c'est déployé en production.
