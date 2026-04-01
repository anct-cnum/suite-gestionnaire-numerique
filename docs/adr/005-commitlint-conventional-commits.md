# ADR-005 : CommitLint pour les Conventional Commits

**Date** : 2026-03-25  
**Statut** : En discussion  
**Décideurs** : Marc Gavanier, Philippe Martinez, Adrien Turpin

## Contexte

Les messages de commit du projet n'avaient aucune contrainte de format. Cela rendait l'historique Git difficile à lire et empêchait l'automatisation de changelogs ou de releases sémantiques.

Les projets de référence (coop, les bases et la cartographie) utilisent CommitLint avec la convention Conventional Commits, ce qui structure les messages et facilite le travail en équipe.

## Décision

- **Installer `@commitlint/cli` et `@commitlint/config-conventional`**
- **Créer `.commitlintrc.mjs`** avec la configuration Conventional Commits
- **Créer le hook `.husky/commit-msg`** qui valide chaque message de commit via `pnpm exec commitlint --edit $1`

### Format imposé

```
type(scope?): description

[body]

[footer]
```

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Alternatives envisagées

- **Ne pas valider les messages** : le statu quo, mais l'historique reste incohérent et l'automatisation impossible
- **Validation uniquement en CI** : pas de feedback immédiat pour le développeur

## Conséquences

- Feedback immédiat au commit si le message ne respecte pas le format
- Historique Git lisible et structuré
- Prépare le terrain pour l'automatisation des changelogs et du semantic-release à terme
- Alignement avec les projets de référence
