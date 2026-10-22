# ADR-006 : MIN modifie les lieux gérés dans la Coop au registre seul

**Date** : 2026-10-15
**Statut** : Accepté
**Décideurs** : équipe MIN, équipe Coop numérique, équipe dataspace
**Périmètre** : transverse (min, dataspace, coop)
**Tickets / MR** : #2101, #2102, #2103, #2105, #2106, dataspace !1029
**Décision d'entrepôt liée** : [DS-ADR-002 — Le registre des lieux fait foi](https://gitlab.com/incubateur-territoires/startups/data-space-societe-numerique/scripts/-/blob/main/docs/adr/002-registre-lieux-fait-foi.md) (ajouté le 2026-10-20, contenu inchangé)

## Contexte

Un lieu d'inclusion vit dans le registre partagé `main.lieu_inclusion`. Les lieux gérés par les médiateurs dans la Coop numérique (`structure_coop_id` non nul, environ 12 800 lieux vivants) étaient en lecture seule dans MIN depuis #1951 : le filet quotidien du dataspace (`etl/load/registre_lieux_coop.py`) réalignait chaque matin le registre sur `coop.lieu_inclusion` et aurait effacé toute correction faite dans MIN.

Or la Coop écrit déjà chaque modification de lieu dans sa table et dans le registre, dans une même transaction, et elle affiche la fiche lue dans le registre. Elle présente à ses médiateurs, dans une modale d'écart, ce qui a été modifié ailleurs.

L'analyse complète, avec les scénarios étudiés, est dans [`docs/archive/2101-lieux-coop-modifiables/`](../archive/2101-lieux-coop-modifiables/conception-lieux-coop-modifiables.md). La réponse de l'équipe Coop du 15/10/2026 est consignée au §8 de la [proposition](../archive/2101-lieux-coop-modifiables/proposition-coop-double-ecriture-min.md).

## Décision

**Le registre `main.lieu_inclusion` fait foi.** MIN modifie les lieux gérés dans la Coop comme les autres lieux, dans le registre seul :

- MIN signe ses écritures : `updated_at_min`, `source = 'Mon Inclusion Numérique'`, `edited_by = 'min'` ;
- MIN n'écrit jamais `updated_at_coop`, qui dit quand la Coop a écrit, ni le schéma `coop`, et ne vide jamais `structure_coop_id` ;
- MIN valide ses écritures avec la bibliothèque du standard `@gouvfr-anct/lieux-de-mediation-numerique`, comme la Coop (#2103) ;
- toutes les actions sont ouvertes, avec les droits du rôle comme pour tout lieu : données, adresse, visibilité cartographique et suppression (#2105) ;
- le dataspace ne réaligne plus le registre sur `coop.lieu_inclusion` (#2102, !1029).

## Alternatives envisagées

- **MIN écrit via une API de la Coop** : elle n'existe pas ; il faudrait la construire pour relier deux schémas d'une même base.
- **Bascule de propriété du lieu vers MIN** : les médiateurs perdraient la main sur leur lieu, et il faudrait une colonne de propriété et des changements dans les trois dépôts.
- **MIN n'édite que les colonnes que le filet ignore** : ne répond pas au besoin (complément d'adresse et SIRET seulement).
- **MIN double-écrit `coop.lieu_inclusion` et le registre** : proposé à la Coop, qui l'a jugé inutile (elle lit déjà le registre) et plus complexe pour MIN (droits sur `coop`, couplage au schéma Coop).

## Conséquences

- Une correction MIN est affichée par la Coop et présentée à ses médiateurs, qui peuvent la reprendre. Une écriture Coop d'une section écrase la correction MIN de cette section : c'est voulu.
- Une suppression MIN est sans effet dans la Coop. Si un médiateur met à jour le lieu, la Coop remet `deleted_at` à NULL et le lieu revient. La Coop juge ce retour légitime ; la modale de suppression de MIN le dit.
- Le filet ne rattrape plus une écriture Coop qui oublierait le registre (script, backfill). La vue `main.lieu_divergences_coop` montre désormais des écarts légitimes, et non plus des anomalies.
- Prérequis de déploiement : le retrait du réalignement (!1029) est en production avant l'ouverture dans MIN (#2105).
- Les règles du cycle de vie des lieux sont documentées côté dataspace (`docs/reference/regles/cycle-de-vie-lieux-personnes.md`).
- Hors périmètre : le flux national des lieux ne reprend pas encore les corrections MIN (#2108).
- Signal de réexamen : la Coop cesse de lire le registre ou de double-écrire, ou une écriture MIN doit être tracée côté Coop.
