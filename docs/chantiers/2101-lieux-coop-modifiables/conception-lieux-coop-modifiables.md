# Rendre modifiables dans MIN les lieux gérés dans la Coop numérique

> **Statut** : brouillon · **Public** : tech · **Mis à jour** : 2026-10-15 · **Tickets** : #2101, #2102 à #2108

Investigation et proposition de conception. Aucun code applicatif n'est modifié par ce chantier.

Sources lues :

- Coop numérique : `origin/main` au 14/10/2026 (`0b453a1ca`).
- Dataspace : `origin/main` au 14/10/2026 (`4a4fd91`), plus `contrat_coop_lieux_v2_20260909.md`, qui n'est pas versionné.
- MIN : `main` (`7800c882`).
- Ordres de grandeur, droits et colonnes : base de dev locale du dataspace.
- **Réponse de l'équipe Coop du 15/10/2026** à la [proposition de double écriture](proposition-coop-double-ecriture-min.md) (§8 de ce document). Elle fixe le scénario retenu.

## 0. En bref

- **Le registre `main.lieu_inclusion` est la source de vérité d'un lieu**, comme décidé avec la Coop. Celle-ci y écrit déjà en même temps que dans sa table (double écriture en production), et **lit dans le registre** ce qu'y écrivent les sources externes, MIN compris.
- **Scénario retenu : MIN écrit seulement dans le registre**, pour les lieux Coop comme pour les autres. MIN n'écrit jamais `coop.lieu_inclusion`.
  - La Coop affiche partout les valeurs écrites par MIN.
  - Dans son interface d'édition, la modale d'écart présente la différence aux médiateurs du lieu. Ils n'ont pas besoin d'une autre notification.
- **Prérequis bloquant : le dataspace arrête de réaligner le registre sur `coop.lieu_inclusion`** (`etl/load/registre_lieux_coop.py`). Tant que ce filet tourne, les corrections MIN sont effacées chaque matin à 08:00.
- **Ce que MIN doit respecter**
  - Signer le registre : `updated_at_min`, `source='Mon Inclusion Numérique'`, `edited_by='min'`. C'est déjà le cas.
  - **Ne jamais toucher à `updated_at_coop`**, qui dit quand la Coop a écrit.
  - **Appliquer les règles de validation de la bibliothèque `@gouvfr-anct/lieux-de-mediation-numerique`**, celle de la Coop. MIN est en 2.3.0 et la Coop en 4.4.0 : il faut monter de version.
- **Ce que la Coop n'a pas à faire** : rien. Elle est prévue pour cela.
- **Sujet à part : le flux national.** Il fusionne et déduplique les sources externes, Coop comprise, mais pas MIN. Une correction MIN n'y figure donc pas, avec ou sans ce chantier. Deux pistes sont évoquées avec la Coop (§6, T7).

## 1. Corrections au cadrage du ticket

| Hypothèse du ticket                                                                                                         | Constat                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jobs Coop `update-structures-cartographie-nationale`, `deduplicate-lieux`, `apply-fusionner-lieux`, `apply-supprimer-lieux` | **Supprimés** sur `origin/main` :<br>• `a460cd4dc` (04/09) supprime 27 jobs ; la campagne de déduplication de juillet « n'a jamais tourné en production » ;<br>• `0dfd4cf2d` (09/09) supprime la réconciliation carto.<br>Il ne reste aucun cron Coop sur les lieux. |
| `apps/web/src/structure`                                                                                                    | N'existe plus. Tout est dans `apps/web/src/features/lieux-activite`.                                                                                                                                                                                                 |
| « Réalignement nocturne par valeurs »                                                                                       | Filet **quotidien à 08:00** (`ci-cd-coop-import`, `ci-cd-dag.py:34-37`). Il fait partie de `coop-dag.py`, qui n'appelle plus l'API Coop pour les lieux : il lit `coop.lieu_inclusion` en SQL, dans le même cluster.                                                  |
| `contrat_coop_lieux_v2_20260909.md`                                                                                         | Présent à la racine du checkout dataspace, mais **non versionné**. `docs/reference/regles/cycle-de-vie-lieux-personnes.md:313` y renvoie : le lien est cassé pour tout le monde.                                                                                     |
| Décision Coop du 23/07 (« MIN consommateur »)                                                                               | Il s'agit du point 6 de `docs/adr/adr-002-reconciliation-dataspace.md` (l.276-293) : un cadrage de périmètre de la PR Coop #575, pas une décision sur la propriété des lieux. La réponse de la Coop du 15/10 confirme que le registre fait foi.                      |

## 2. État des lieux

### 2.1 Côté Coop

**Modèle et lien avec le registre**

- La Coop tourne dans la base de l'Entrepôt (`infrastructure/locals.tf:23`). Un seul client Prisma porte les schémas `coop`, `public` et `main` (`apps/web/prisma/schema.prisma:14-20`).
- `coop.lieu_inclusion` (`schema.prisma:747-856`) : `id` uuid, `modification`, `suppression`, adresse en colonnes avec `ban_id` et les coordonnées, `visible_pour_cartographie_nationale`, nomenclatures du standard.
- Clé de jointure : `main.lieu_inclusion.structure_coop_id` (uuid, UNIQUE) = `coop.lieu_inclusion.id`. Il n'y a pas de clé étrangère.

**Double écriture** (série du 08 au 11/09, en production)

- Chaque création, modification, adoption, fusion ou reprise écrit les deux tables dans une transaction, **section par section** (`colonnes-par-section.ts`, `enregistrer-les-sections.ts`).
- Signature au registre (`signature-coop.ts`) : `source='Coop numérique'`, `edited_by='coop'`, `updated_at_coop=now`, et `deleted_at=NULL`. Une écriture Coop « relève » donc un lieu supprimé, ce que la Coop juge légitime : si le médiateur met son lieu à jour, il revient dans le registre.
- Adresse : `main.trouver_ou_creer_adresse_lieu(...)` puis on repointe `adresse_id`. Une adresse n'est jamais modifiée en place.

**Lecture du registre et modale d'écart**

- La fiche affichée dans la Coop est **celle du registre** (`lieu.transfer.ts:223-246`, `fiche-du-registre.ts:95-172`). Le formulaire d'édition est composé à partir du registre : une valeur MIN est donc reprise quand un médiateur réenregistre la section.
- La « dernière modification » est calculée à partir de `updated_at_*` et de `source`.
- **Modale d'écart** (`modification-du-registre.ts`, `BandeauRepriseExterne.tsx`, `domain/differences.ts`) : elle présente au médiateur, champ par champ, la différence entre la table Coop et le registre. C'est elle qui l'informe d'une correction MIN.

**Règles de saisie et de publication**

- Validations par section (`modifier-la-fiche-du-lieu.validation.ts:43-171`) : adresse BAN, au moins une typologie, SIRET avec clé de Luhn, horaires OSM, téléphone et courriel exigés selon les modalités d'accès.
- Publication (`domain/publication.ts`) : un lieu visible annonce au moins un service (socle `SERVICES_PAR_DEFAUT`) ; rendre visible exige une adresse BAN.
- Ces règles reposent sur `@gouvfr-anct/lieux-de-mediation-numerique` (4.4.0), que **la Coop désigne comme la référence pour MIN**.

**API exposée : lecture seule.** `/api/v1/*` n'expose que des `GET`. Avec le scénario retenu, MIN n'a besoin d'aucune API d'écriture.

**Flux national.** Il fusionne et déduplique les sources externes, dont la Coop (`/api/v1/lieux-activite`, lu dans la table Coop). MIN n'est pas une source de ce flux. C'est un sujet indépendant de ce chantier (T7).

### 2.2 Côté dataspace

**Le filet** : `etl/load/registre_lieux_coop.py`, lancé par `coop-dag.py` (`schedule=None`), déclenché chaque jour à 08:00 par `ci-cd-coop-import`. Il tourne en une transaction :

| Étape | SQL                                 | Effet sur une ligne coop                                                                                                                                                                        | Garde                                          | Sort proposé (T1)                                                                    |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1     | `SQL_INSERER_MANQUANTS` (l.57-69)   | INSERT d'identité                                                                                                                                                                               | aucune ligne n'a ce `structure_coop_id`        | à trancher (filet d'identité, n'écrase rien)                                         |
| 2     | `SQL_COMPLETER_ADRESSES`            | `adresse_id`                                                                                                                                                                                    | `adresse_id IS NULL`                           | **retirer** (réalignement)                                                           |
| 3     | `SQL_RAFRAICHIR*` (l.87-110)        | `adresse_id` re-résolue, `edited_by='coop'`, `updated_at_coop`                                                                                                                                  | par date : `cl.modification > updated_at_coop` | **retirer** (réalignement)                                                           |
| 4     | `SQL_RAFRAICHIR_COMPTEURS`          | `mediateurs_en_activite`                                                                                                                                                                        | `IS DISTINCT FROM`                             | **garder** : compteur calculé par le dataspace, la Coop n'a pas le droit de l'écrire |
| 5     | `SQL_RAFRAICHIR_METIER` (l.145-228) | **21 champs réécrits ensemble** : `nom`, `deleted_at = cl.suppression`, visibilité, présentation, horaires, `prise_rdv`, fiche Acceslibre, les 11 nomenclatures, `contact` (fusion clé par clé) | par valeurs, sans date, sur le tuple entier    | **retirer** : c'est lui qui efface MIN                                               |
| 7     | `SQL_RETIRER_ORPHELINS` (l.239-247) | `deleted_at=now()`                                                                                                                                                                              | lieu Coop physiquement disparu                 | à trancher (n'écrase aucune valeur)                                                  |

- Aucun trigger sur `main.lieu_inclusion`. `updated_at` est générée : `GREATEST(updated_at_carto, updated_at_coop, updated_at_min)` (V116).
- La vue `main.lieu_divergences_coop` (V161) liste les écarts entre la table Coop et le registre. Après le retrait du filet, elle montrera les corrections MIN que les médiateurs n'ont pas encore reprises. Ce n'est plus une anomalie.
- `carto-dag` n'écrit sur une ligne coop que le lien `structure_cartographie_nationale_id`.
- Documentation à mettre à jour : `cycle-de-vie-lieux-personnes.md` §1.2 (« lieux coop : lecture seule ») et §2.3 (filet quotidien).

**Sort d'une écriture MIN au registre**

| Colonne                                                                                                                                           | Aujourd'hui                                   | Après retrait des étapes 2, 3 et 5                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `nom`, présentation, horaires, `prise_rdv`, `itinerance`, `typologies`, `services`, modalités, publics, prise en charge, `frais_a_charge`, labels | écrasée le lendemain à 08:00                  | **conservée** jusqu'à une écriture Coop de la même section |
| `visible_pour_cartographie_nationale`, `deleted_at`                                                                                               | écrasée                                       | **conservée** jusqu'à une écriture Coop                    |
| `contact`                                                                                                                                         | partiellement écrasée                         | **conservée**                                              |
| `adresse_id`                                                                                                                                      | survit jusqu'à la prochaine modification Coop | **conservée** jusqu'à une écriture Coop de l'adresse       |
| `complement_adresse`, `siret_a_l_enrichissement`, `nom_usage`                                                                                     | survit au filet                               | **conservée**                                              |
| `structure_coop_id`                                                                                                                               | interdite                                     | **interdite** : MIN n'y touche pas                         |

**Consommateurs en aval** : `api.carto` et opendata lisent le registre et montrent donc la correction MIN. Le flux national est hors périmètre (T7).

### 2.3 Côté MIN

**Règle actuelle** (#1951, commit `c19c3a8d`) :

- `src/app/api/actions/shared/verifierDroitsLieu.ts:42-44` refuse avec `MESSAGE_LIEU_GERE_PAR_LA_COOP` **avant** de vérifier le rôle, donc même pour un administrateur. Le motif est écrit l.14-16 : l'écrasement par le filet.
- `estLieuCoop` vaut `structure_coop_id !== null`. Il est calculé :
  - dans `PrismaRecupererLieuDetailsLoader.ts:134,405` pour la fiche et les actions ;
  - dans `listeLieuxInclusionPresenter.ts:14,57`, à partir de `PrismaListeLieuxInclusionLoader.ts:143`, pour la liste.
- Affichage : bannière `LieuInclusionDetails.tsx:93-98` ; bascule de visibilité désactivée et suppression masquée dans `ListeLieuxInclusion.tsx:717-720,742` ; `peutModifier` et `peutSupprimer` calculés dans `lieu/[id]/page.tsx:40-52,59,80`.

**Écritures MIN sur un lieu** : toutes passent par `PrismaLieuInclusionRepository`, sont journalisées par `avecJournalisationMin`, et posent `edited_by='min'` et `updated_at_min`. Les mises à jour de données posent aussi `source='Mon Inclusion Numérique'`. MIN ne pose jamais `updated_at_coop`.

| Action                                            | Colonnes du registre                                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modifierLieuInclusionInformationsGenerales`      | `nom`, `adresse_id` (+ `main.adresse`), `complement_adresse`, `siret_a_l_enrichissement`, `itinerance`, `typologies`. Avec un SIRET, nom et adresse sont recalculés via l'API Entreprise (#1498) |
| `modifierLieuInclusionDescription`                | `presentation_*`, `typologies` (+ `horaires`, `prise_rdv`, `itinerance`, `contact.site_web`)                                                                                                     |
| `modifierLieuInclusionInformationsPratiques`      | `horaires`, `itinerance`, `prise_rdv`, `contact.site_web`                                                                                                                                        |
| `modifierLieuInclusionServicesModalite`           | `modalites_acces`, `frais_a_charge`, `contact.telephone`, `contact.courriels.contact_public`                                                                                                     |
| `modifierLieuInclusionServicesTypeAccompagnement` | `services`, `modalites_acces`, `modalites_accompagnement`                                                                                                                                        |
| `modifierLieuInclusionServicesTypePublic`         | `publics_specifiquement_adresses`, `prise_en_charge_specifique`                                                                                                                                  |
| `modifierLieuInclusionVisibiliteCartographie`     | `visible_pour_cartographie_nationale`, sans `source`                                                                                                                                             |
| `supprimerUnLieuInclusion`                        | `deleted_at`, visibilité = false, sans `source`                                                                                                                                                  |

Le code d'écriture **ne change pas** : on lève seulement le refus pour les lieux Coop, et on renforce la validation.

**Bibliothèque de validation.** MIN dépend de `@gouvfr-anct/lieux-de-mediation-numerique` en 2.3.0, et ne s'en sert que pour l'affichage (`LieuInclusionDetailsAccueilDescription.tsx`, `LieuInclusionDetailsInformationsGenerales.tsx`, `presenters/shared/typologie.ts`). La Coop est en 4.4.0. Il faut monter de version (deux versions majeures : vérifier les ruptures) et valider avec la bibliothèque **avant** chaque écriture.

**`structure_coop_id` sert aussi de clé de jointure** dans MIN (accompagnements `PrismaListeLieuxInclusionLoader.ts:161`, périmètre et droits `shared/lieuxDansScope.ts:136`, statistiques `PrismaLieuxCoopLoader.ts:61-67`, historique `PrismaLieuHistoriqueLoader.ts:99-111`). Le scénario retenu n'y touche pas.

**Tests gardiens de la règle actuelle**, à réécrire : `verifierDroitsLieu.test.ts:114-124` ; les tests des actions Informations générales, Visibilité et Suppression ; `PrismaRecupererLieuDetailsLoader.test.ts:47-71` ; les deux presenters ; `LieuInclusionDetails.test.tsx:20-48` ; `ListeLieuxInclusion.test.tsx:76-100`.

**Défaut indépendant constaté** : MIN écrit et lit le courriel dans `contact.courriels.contact_public` (`PrismaLieuInclusionRepository.ts:141-145`, `PrismaRecupererLieuDetailsLoader.ts:241-242`). La Coop et `api.carto` utilisent `courriels.email`. Le courriel saisi dans MIN n'est donc ni publié ni vu par la Coop.

## 3. Scénarios étudiés

| Scénario                                                                        | Verdict                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — MIN écrit via une API Coop                                                  | Écarté : il n'en existe pas, il faudrait la construire, pour relier deux schémas d'une même base.                                                                                                                             |
| B — MIN n'édite que les colonnes que le filet ignore                            | Écarté : ne répond pas au besoin (complément d'adresse et SIRET seulement).                                                                                                                                                   |
| C — bascule de propriété du lieu vers MIN                                       | Écarté : les médiateurs perdraient la main ; il faudrait une colonne de propriété et des changements dans les trois dépôts.                                                                                                   |
| E — MIN double-écrit `coop.lieu_inclusion` et le registre                       | Proposé à la Coop le 15/10. **Non retenu** par la Coop : possible, mais inutile, puisque la Coop lit déjà le registre, et plus complexe pour MIN (droits sur `coop`, couplage au schéma Coop, règles de signature côté Coop). |
| **D′ — le registre fait foi : MIN écrit le registre seul, le filet est retiré** | **Retenu**, sur réponse de la Coop.                                                                                                                                                                                           |

### D′ en détail

- **MIN** : écrit le registre comme aujourd'hui, avec la même signature. Il lève le refus `estLieuCoop` et valide avec la bibliothèque du standard.
- **Dataspace** : retire le réalignement (étapes 2, 3 et 5), garde le compteur (étape 4), tranche les étapes 1 et 7, et met la documentation à jour.
- **Coop** : rien. La modale d'écart informe les médiateurs, et une écriture Coop d'une section reprend la main sur cette section. C'est la règle « le plus frais gagne », section par section.

**Risques et limites**

1. **Retrait du filet.** Il ne détecte plus un chemin d'écriture Coop qui oublierait le registre. La Coop écrit les deux tables dans une même transaction et sa règle opératoire interdit le SQL hors application, donc le risque est faible. La vue `lieu_divergences_coop` reste disponible pour un contrôle ponctuel.
2. **Écritures concurrentes.** Une écriture Coop d'une section écrase la correction MIN de cette section, après que la modale l'a présentée au médiateur. C'est voulu.
3. **Suppression par MIN.** Elle est sans effet côté Coop. Si un médiateur met à jour son lieu, la Coop remet `deleted_at` à NULL et le lieu revient au registre. La Coop juge ce retour légitime, mais il faut le dire à l'agent MIN dans la confirmation.
4. **Visibilité et adresse.** Voir les questions 1 et 2 (§5).
5. **Montée de version de la bibliothèque** (2.3 → 4.4) : elle peut modifier des nomenclatures affichées dans MIN.

## 4. Recommandation

**Scénario D′**, dans cet ordre :

1. **Dataspace (T1, #2102)** : retirer le réalignement de `registre_lieux_coop.py`. C'est un prérequis : livrer MIN avant ferait perdre les corrections le lendemain matin.
2. **MIN (T2, #2103)** : monter la bibliothèque du standard et valider les écritures avec elle.
3. **MIN (T3, #2105)** : lever la lecture seule des lieux Coop pour toutes les actions (données, adresse, visibilité, suppression) et reformuler la bannière.
4. **MIN (T5, #2106)** : corriger la clé du courriel, sans quoi la correction de courriel reste invisible pour la Coop.
5. **Hors chantier (T7, #2108)** : faire figurer les modifications MIN dans le flux national.

## 5. Questions encore ouvertes

Réponses de la Coop du 15/10 : voir la [proposition](proposition-coop-double-ecriture-min.md), §8.

1. **Visibilité cartographique.** La Coop lit-elle la visibilité dans sa table (ADR-003 l.60-67, `lieu.transfer.ts:252-257`) ou dans le registre ? Si c'est dans sa table, un masquage MIN est respecté par `api.carto`, mais la Coop affiche toujours « visible ». La modale d'écart couvre-t-elle ce champ ? À poser à la Coop.
2. **Adresse.** La modale d'écart exclut l'adresse (`domain/differences.ts`), et la Coop garde sa propre localisation (`ban_id`, coordonnées). Une nouvelle adresse MIN est-elle bien affichée dans la Coop, et le médiateur en est-il prévenu ? À poser à la Coop.
3. **Étapes 1 et 7 du filet** : faut-il les garder comme filets d'identité, ou les retirer avec le reste ? À trancher côté dataspace.
4. **Rôles MIN** autorisés à modifier un lieu Coop : les mêmes que pour un lieu non Coop (`LieuInclusion.peutEtreModifiePar`) ?
5. **Champ de la validation** : appliquer la bibliothèque du standard à tous les lieux, ou seulement aux lieux Coop ? La recommandation est tous les lieux, puisque c'est le standard.

## 6. Tickets

Créés le 15/10/2026, tous en P1, type Tech, statut Backlog sur le board SEPT.

### T1 (#2102) — dataspace — Arrêter de réaligner le registre des lieux sur `coop.lieu_inclusion`

- **Contexte** : #2101. Le registre fait foi ; la Coop double-écrit et lit le registre (réponse de la Coop du 15/10). Le filet efface chaque matin les corrections MIN.
- **À faire**
  - Retirer de `etl/load/registre_lieux_coop.py` les étapes 2, 3 et 5 (`SQL_COMPLETER_ADRESSES`, `SQL_RAFRAICHIR*`, `SQL_RAFRAICHIR_METIER`) et leur bilan.
  - Garder l'étape 4 (`mediateurs_en_activite`).
  - Trancher les étapes 1 et 7.
  - Ajouter un test : une ligne coop modifiée par MIN n'est plus réécrite par le DAG.
  - Mettre à jour `cycle-de-vie-lieux-personnes.md` §1.2 et §2.3, ainsi que la description de `main.lieu_divergences_coop`.
  - Versionner `contrat_coop_lieux_v2_20260909.md` (lien cassé), ou retirer la référence.
- **Prérequis** de T3.

### T2 (#2103) — MIN — Valider les lieux avec la bibliothèque du standard

- **À faire**
  - Monter `@gouvfr-anct/lieux-de-mediation-numerique` de 2.3.0 à la version utilisée par la Coop (4.4.0), et corriger les ruptures (nomenclatures, libellés).
  - Valider chaque écriture de lieu avec la bibliothèque, avant le repository : nomenclatures, SIRET, horaires, contact, localisation, et règles de publication si la bibliothèque les porte.
  - Tests gardiens par règle.

### T3 (#2105) — MIN — Rendre modifiables les lieux gérés dans la Coop

- **Dépend de** : T1 en production, T2.
- **À faire**
  - Retirer le refus `estLieuCoop` de `verifierDroitsLieu` et de `lieu/[id]/page.tsx`.
  - Réactiver la bascule de visibilité et la suppression dans `ListeLieuxInclusion` et sur la fiche, selon les réponses aux questions 1 et 2.
  - Remplacer la bannière par une information, par exemple : « Lieu géré dans la Coop numérique : vos modifications seront présentées à ses médiateurs, qui pourront les reprendre. »
  - Dans la confirmation de suppression, prévenir qu'une mise à jour par un médiateur fera revenir le lieu.
  - Garder la signature actuelle (`updated_at_min`, `source`, `edited_by`), et ajouter un test qui garantit que MIN n'écrit jamais `updated_at_coop` ni le schéma `coop`.
  - Réécrire les tests gardiens listés au §2.3 et mettre à jour les stories.

### T4 (#2104) — Coop (questions, pas de développement demandé) — Visibilité et adresse modifiées par MIN

- Poser à l'équipe Coop les questions 1 et 2 du §5. Leur réponse décide du périmètre de T3 pour la visibilité et l'adresse.

### T5 (#2106) — MIN — Le courriel d'un lieu est écrit sous une clé que personne ne lit

- **Constat** : MIN écrit et lit `contact.courriels.contact_public` ; la Coop et `api.carto` utilisent `courriels.email`.
- **À faire** : aligner MIN sur `courriels.email` en écriture comme en lecture ; mesurer le stock concerné et proposer un script de reprise à faire lancer par l'utilisateur.

### T6 (#2107) — MIN — ADR : le registre fait foi, MIN modifie les lieux Coop au registre

- **À faire** : rédiger `docs/adr/NNN-registre-source-de-verite-lieux.md` : le registre fait foi ; MIN écrit le registre seul, sans `updated_at_coop` ; la Coop informe ses médiateurs par la modale d'écart ; filet retiré. Renvoyer à la documentation du dataspace.

### T7 (#2108) — transverse (hors #2101) — Faire figurer les modifications MIN dans le flux national

- **Contexte** : le flux national fusionne et déduplique les sources externes, dont la Coop, mais pas MIN. Les corrections MIN n'y figurent donc pas.
- **Deux pistes évoquées avec la Coop**
  1. Ajouter à mednum-cli une source qui ne contient que les lieux dont la source est MIN.
  2. Produire une sortie qui ne contient que les sources ni Coop ni MIN, et laisser l'Entrepôt faire une fusion et une déduplication supplémentaires.
- **À faire** : instruire et choisir.
