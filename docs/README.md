# Documentation — index

Point d'entrée unique de la documentation de MIN. Tout document versionné doit y figurer.

> Réorganisation en cours (#2058) : les documents sont rangés ; restent la fusion des doublons avec le dataspace et la réécriture des documents dépassés. ⚠️ signale un document connu comme dépassé.

## Organisation

Même arborescence que le dépôt dataspace :

```
docs/
  README.md          cet index
  guides/            faire quelque chose : installer, déployer, diagnostiquer
  reference/         ce qui est vrai aujourd'hui : écrans, règles de calcul, intégrations
  architecture/      principes et organisation du code
  adr/               décisions actées, une par fichier (voir adr/README.md)
  chantiers/
    <ticket>-<sujet>/  documents de travail d'un chantier : constats, analyses, plans
  archive/           chantiers clos et documents remplacés
```

À la racine du dépôt, seulement `README.md`, `CONTRIBUTING.md` et `CLAUDE.md`.

## Cycle de vie d'un document

| Sorte                                       | Où                                       | Cycle                                                                                       |
| ------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Référence** : ce qui est vrai aujourd'hui | `guides/`, `reference/`, `architecture/` | **Vivant.** Un seul document par sujet, mis à jour dans la PR qui change le comportement    |
| **Décision** : pourquoi on a choisi X       | `adr/`                                   | **Figée.** Remplacée par un nouvel ADR, jamais réécrite                                     |
| **Travail** : constat, analyse, plan        | `chantiers/<ticket>-<sujet>/`            | **Temporaire.** À la clôture : décisions → ADR, référence mise à jour, dossier → `archive/` |

## Conventions

- **Nommage** : `kebab-case.md`, en français.
- **En-tête** obligatoire sous le titre :

  ```markdown
  > **Statut** : vivant | brouillon | figé | obsolète · **Public** : tech | métier · **Mis à jour** : AAAA-MM-JJ · **Tickets** : #… · **Remplacé par** : … (si obsolète)
  ```

- **Pas de données personnelles**, versionnées ou non : pas de liste nominative, pas d'email ou de téléphone de personne, même en exemple.
- **Pas d'information d'accès** (liens de partage, procédures d'accès à la production) : le dépôt est public ; les secrets vivent dans le gestionnaire de secrets.
- **Sujet transverse** : le document vit dans le dépôt propriétaire de l'objet. Les règles des données partagées (postes CN, structures, membres de gouvernance, droits de la base) sont documentées côté dataspace ; MIN documente ses écrans et renvoie par un lien.

## Guides

| Document                                                    | Pour quoi                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [../CONTRIBUTING.md](../CONTRIBUTING.md)                    | Installation, commandes, outils, ProConnect                                             |
| [integration-dataspace.md](guides/integration-dataspace.md) | Partage de la base avec le dataspace, migration Prisma miroir, `pnpm db:sync-dataspace` |
| [../scripts/README.md](../scripts/README.md)                | Scripts utilitaires                                                                     |

## Référence

| Document                                                                                    | Pour quoi                                                                                                       |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [postes-conseiller-numerique.md](reference/postes-conseiller-numerique.md) ⚠️               | Écran des postes CN et vue `min.postes_conseiller_numerique_synthese` (le SQL cité ne correspond plus à la vue) |
| [couche-anticorruption-statistiques.md](reference/couche-anticorruption-statistiques.md) ⚠️ | Couche d'anticorruption des statistiques coop (cite des tables supprimées)                                      |
| [api-coop-statistiques.md](reference/api-coop-statistiques.md)                              | Gateway de l'API coop pour les statistiques                                                                     |
| [seo-vitrine.md](reference/vitrine/seo-vitrine.md)                                          | Métadonnées SEO du site vitrine                                                                                 |

## Décisions

[adr/](adr/README.md) — index des ADR.

## Chantiers en cours

| Chantier                             | Documents                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Membres de gouvernance mal rattachés | [constat-membres-gouvernance-mal-raccroches.md](chantiers/membres-gouvernance/constat-membres-gouvernance-mal-raccroches.md) |

## Documentation dans les autres dépôts

| Dépôt                        | Sujets                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dataspace (`docs/README.md`) | Sources de données, règles des données partagées (postes CN, subventions, structures, cycle de vie des lieux et des personnes), API PostgREST, propriété des schémas et consommateurs |
