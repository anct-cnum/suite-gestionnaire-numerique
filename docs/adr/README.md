# Décisions d'architecture (ADR)

Une décision actée = un fichier `NNN-titre-kebab.md`, numéroté en continu. Même format que les ADR du dataspace (`docs/adr/` du dépôt dataspace). Modèle : [000-modele.md](000-modele.md).

## Règles

- **Une décision par ADR**, rédigée au moment où elle est prise.
- **Un ADR accepté ne se réécrit pas.** Si la décision change, on écrit un nouvel ADR qui le remplace et on passe l'ancien en « Remplacé par ADR-XXX ».
- **Statuts** : `Proposé` (en discussion) → `Accepté` (en vigueur) → `Remplacé par ADR-XXX` ou `Abandonné`.
- **Périmètre transverse** (MIN + dataspace, coop…) : l'ADR vit dans le dépôt propriétaire de l'objet concerné, l'autre dépôt y renvoie par un lien ([DS-ADR-001](https://gitlab.com/incubateur-territoires/startups/data-space-societe-numerique/scripts/-/blob/main/docs/adr/001-entrepot-plateforme-applications-au-dessus.md) : l'entrepôt est la plateforme, MIN une application au-dessus) :
  - données partagées et leurs règles (`main`, `admin`, `reference`…), qui fait foi, contrat entre l'entrepôt et MIN → **dataspace** ;
  - écrans, outillage, schéma `min` et stockage propre de MIN (S3) → **MIN**.

  Une décision qui touche les deux s'écrit en deux ADR liés : la règle de données dans le dataspace, la mise en œuvre applicative ici.

- **Renvoi entre dépôts** : préfixer le numéro par le dépôt (`MIN-ADR-006`, `DS-ADR-002`), les deux dépôts numérotant chacun à partir de 001.
- Un ADR décrit le **pourquoi**. Le **comment** à jour vit dans la doc de référence (`docs/`), qui cite l'ADR.
- Pas de données personnelles.

## Index

| N°                                            | Décision                                     | Statut           | Date       |
| --------------------------------------------- | -------------------------------------------- | ---------------- | ---------- |
| [001](001-mise-en-place-ci-github-actions.md) | CI GitHub Actions                            | En discussion ⚠️ | 2026-03-25 |
| [002](002-lint-staged-et-hooks-pre-commit.md) | lint-staged et hooks pre-commit avec autofix | En discussion ⚠️ | 2026-03-25 |
| [003](003-migration-yarn-vers-pnpm.md)        | Migration de Yarn vers pnpm                  | En discussion ⚠️ | 2026-03-25 |
| [004](004-rationalisation-eslint.md)          | Rationalisation de la configuration ESLint   | En discussion ⚠️ | 2026-03-25 |
| [005](005-commitlint-conventional-commits.md) | CommitLint pour les Conventional Commits     | En discussion ⚠️ | 2026-03-25 |
| [006](006-lieux-coop-modifies-au-registre.md) | MIN modifie les lieux Coop au registre seul  | Accepté          | 2026-10-15 |

⚠️ Les cinq décisions sont en œuvre dans le dépôt : passage en « Accepté » prévu à l'étape 7 de #2058.
