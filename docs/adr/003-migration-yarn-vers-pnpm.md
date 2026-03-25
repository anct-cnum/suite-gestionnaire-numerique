# ADR-003 : Migration de Yarn vers pnpm

**Date** : 2026-03-25
**Statut** : Accepté
**Décideurs** : Marc Gavanier

## Contexte

Le projet utilisait Yarn 4.2.2 via Corepack. Trois raisons ont motivé la migration :

1. **Sécurité supply chain** : npm exécute les scripts postinstall de toutes les dépendances par défaut sans aucune protection. Yarn 4 offre un mécanisme opt-out (`enableScripts: false` dans `.yarnrc.yml`) mais celui-ci souffre d'une faille connue ([yarnpkg/berry#6258](https://github.com/yarnpkg/berry/issues/6258)) : les dépendances contenant un lockfile Yarn v1 exécutent leurs scripts même quand la protection est activée. pnpm v10+ adopte une approche fondamentalement différente : il **bloque les lifecycle scripts par défaut** et ne les autorise que pour les packages explicitement whitelistés via `onlyBuiltDependencies` dans `package.json`. Cette approche proactive (blocage par défaut, whitelist explicite) est la plus sûre face aux attaques type Shai-Hulud (septembre 2025, exfiltration de tokens via des postinstall hooks malveillants).
2. **Friction en CI** : Corepack nécessite une étape d'activation (`corepack enable`) qui a échoué lors de la première exécution du workflow GitHub Actions
3. **Alignement avec les projets de référence** : les projets coop, les bases et la cartographie utilisent pnpm, facilitant le partage de pratiques et de configuration

## Décision

Migrer de Yarn 4.2.2 vers pnpm 10.12.1 :

- Remplacer `yarn.lock` par `pnpm-lock.yaml`
- Mettre à jour `packageManager` dans `package.json`
- Adapter tous les scripts, hooks, workflows CI, Procfile, build.sh et documentation
- Supprimer `.yarnrc.yml`
- Utiliser `pnpm/action-setup@v5` en CI (pas de problème Corepack)
- Configurer les protections supply chain dans `pnpm-workspace.yaml` (aligné avec les projets de référence)
- Adapter `build.sh` et `build:dev` : le shim shell de `node_modules/.bin/next` n'est pas exécutable directement par Node.js avec pnpm, il faut cibler `node_modules/next/dist/bin/next` pour le flag `--stack-size`
- Exclure `scripts/` du `tsconfig.json` : le dossier contenait une dépendance fantôme (`dotenv`) exposée par la résolution stricte de pnpm

### Configuration de sécurité supply chain (`pnpm-workspace.yaml`)

- **`onlyBuiltDependencies`** : seuls `esbuild`, `prisma` et `@prisma/client` sont autorisés à exécuter des scripts postinstall (binaires natifs nécessaires au build). Toute autre dépendance est bloquée.
- **`ignoredBuiltDependencies`** : `sharp` et `unrs-resolver` sont ignorés (pas besoin de compiler leurs binaires natifs dans ce projet).
- **`minimumReleaseAge: 14400`** (10 jours) : quarantaine sur les nouvelles versions de packages. Une version publiée il y a moins de 10 jours ne sera pas installée, laissant le temps à la communauté de détecter un éventuel malware.
- **`minimumReleaseAgeExclude`** : `next`, `@next/*`, `react`, `react-dom` sont exemptés de la quarantaine (packages de confiance avec des cycles de release rapides).

## Alternatives envisagées

- **Rester sur Yarn 4** en corrigeant le problème Corepack : fonctionnel mais ne résout pas le désalignement avec les projets de référence, et la protection `enableScripts` reste fragile (faille connue sur les dépendances avec lockfile Yarn v1)
- **Migrer vers npm** : plus simple, mais moins performant, moins strict sur la résolution de dépendances, et surtout sans protection par défaut contre les scripts postinstall malveillants

## Conséquences

- **Sécurité renforcée** : les scripts postinstall sont bloqués par défaut, réduisant drastiquement la surface d'attaque supply chain
- **Résolution plus stricte** : pnpm n'autorise pas les phantom dependencies grâce à son node_modules isolé par liens symboliques. Une dépendance fantôme (`dotenv` importé dans `scripts/test-cache-api-coop.ts` sans être dans `package.json`) a été détectée et corrigée lors de la migration
- **CI simplifiée** : `pnpm/action-setup@v5` fonctionne sans configuration Corepack
- **Scalingo compatible** : le buildpack Node.js de Scalingo détecte automatiquement `pnpm-lock.yaml` et installe pnpm
- **Alignement** : mêmes outils que les projets de référence
