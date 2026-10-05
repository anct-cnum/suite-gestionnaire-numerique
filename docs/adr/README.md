# Décisions d'architecture (ADR)

Une décision actée = un fichier `NNN-titre-kebab.md`, numéroté en continu. Même format que les ADR du dataspace (`docs/adr/` du dépôt dataspace). Modèle : [000-modele.md](000-modele.md).

## Règles

- **Une décision par ADR**, rédigée au moment où elle est prise.
- **Un ADR accepté ne se réécrit pas.** Si la décision change, on écrit un nouvel ADR qui le remplace et on passe l'ancien en « Remplacé par ADR-XXX ».
- **Statuts** : `Proposé` (en discussion) → `Accepté` (en vigueur) → `Remplacé par ADR-XXX` ou `Abandonné`.
- **Périmètre transverse** (MIN + dataspace, coop…) : l'ADR vit dans le dépôt propriétaire de l'objet concerné, l'autre dépôt y renvoie par un lien. Les données et le schéma partagés (`main.*`, `admin.*`) relèvent du dataspace ; le schéma `min` et l'interface relèvent de MIN.
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

⚠️ Les cinq décisions sont en œuvre dans le dépôt : passage en « Accepté » prévu à l'étape 7 de #2058.
