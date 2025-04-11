# Mon inclusion numérique

**Sur ce projet, `yarn` est le gestionnaire de paquets utilisé**

## ✅️ Prérequis

Avoir la version LTS de Node décrite dans le fichier `.nvmrc`.

```bash
nvm install v22.x.x
```

## 🚀 Démarrage

D'abord, installer les dépendances

```bash
yarn install
```

Remplir les variables d'environnement dans `.env.local`.

Lancer le serveur de développement

```bash
yarn db:start
yarn dev
```

Ouvrir le navigateur sur [http://localhost:3000](http://localhost:3000) pour voir le résultat

## 🧪 Tests

Pour lancer les tests une fois :

```bash
yarn test
```

Pour lancer les tests en continu :

```bash
yarn test:watch
```

Pour lancer les tests avec le coverage :

```bash
yarn test:coverage
```

Pour accéder à la base de données en CLI selon un environnement :

```bash
yarn psql:local
yarn psql:production (il faut avoir installer la CLI de Scalingo au préalable)
yarn psql:test
```

Pour accéder à la base de données de production avec un outils, il faut lancer un tunnel SSH avant :

```bash
scalingo -a mon-inclusion-numerique db-tunnel -i [CHEMIN_DE_TA_CLE_SSH_SCALINGO] [VAR_ENV_SCALINGO_POSTGRESQL_URL]
```

Ensuite, dans ton outils, tu configures avec 127.0.0.1:10000 et le reste grâce à la variable d'environnement SCALINGO_POSTGRESQL_URL utilisée juste au dessus.

Quand le schéma de MIN est modifié, regénérer les tables à partir des schémas Prisma, créer les migrations au besoin et générer les types pour Prisma Client :

```bash
yarn prisma:migrate
```

Quand tu veux ré-initialiser la base de données :

```bash
yarn prisma:drop:schema
```

Quand le schéma de FNE est modifié, regénérer les types FNE pour Prisma Client :

```bash
yarn prisma:generate:fne
```

Quand tu veux enchainer les trois dernières commandes d'affilé :

```bash
yarn prisma:reset
```

Quand tu veux importer les utilisateurs :

```bash
yarn migration:utilisateur
```

## ⬆️ Mise à jour du DSFR

Ne pas oublier de copier/coller le fichier JS et les pictos dans `/public`.

## ⬆️ Mise à jour Matomo

Ne pas oublier de changer la version du fichier `/public/matomo-vX.js` s'il vient à être modifié.
Les statistiques sont visible sur [https://stats.beta.gouv.fr/](https://stats.beta.gouv.fr/index.php?module=CoreHome&action=index&idSite=200&period=day&date=today&updated=1).

## 🛠️ Les outils

### TypeScript

- Permet d'avoir du typing pour minimiser l'écriture de bug
- Permet d'avoir un feedback rapide d'erreur
- Permet d'avoir la notion d'interface pour étendre des classes
- Configurer tout en strict pour avoir une haute qualité de développement

### ESLint

- Permet de formatter le JavaScript
- Permet de réduire l'écriture de bug
- Permet d'avoir un feedback rapide d'erreur
- Configurer en strict pour avoir une haute qualité de développement
- Ajout de quelques plugins pour renforcer

### Stylelint

- Permet de réduire l'écriture de bug
- Permet d'avoir un feedback rapide d'erreur
- Configurer en strict pour avoir une haute qualité de développement
- Ajout de quelques plugins pour renforcer

### Prettier

- Permet de formatter le CSS, JSON et markdown

### Depcheck

- Permet de détecter les modules inutilisés pour l'application et par conséquent réduire son déploiement

### Knip

- Permet de détecter le code mort et par conséquent réduire la charge cognitive

### Husky

- Permet de lancer la CI en local au pre-push plutôt que sur GitHub pour :
  - Avoir un feedback plus rapide
  - Consommer moins d'énergie car on ne retélécharge pas tout les node_modules
  - Gagner du temps

### Vitest

- Le meilleur framework de test actuellement dans l'éco-système JavaScript
- La configuration respecte [F.I.R.S.T.](https://openclassrooms.com/fr/courses/6100311-testez-votre-code-java-pour-realiser-des-applications-de-qualite/6440801-appliquez-le-principe-first-pour-ecrire-de-bons-tests) pour une meilleure robustesse
- Le coverage est configuré pour mettre en valeur si c'est en dessous de 90 %

### Testing library

- Le meilleur framework de test actuellement pour le frontend dans l'éco-système JavaScript

### Stryker

- Permet de lancer des tests de mutation
- Renforce la robutesse des tests

## 🧱 Architecture applicative

```text
📦 Mon inclusion numérique
 ┣ 📂 .github/workflows           -> Configuration de CodeQL et dependabot
 ┣ 📂 .husky/workflows            -> Configuration du pre-push
 ┣ 📂 public                      -> Assets statiques dont le dsfr.js
 ┣ 📂 src
 ┃  ┣ 📂 app                      -> Les controllers
 ┃  ┣ 📂 components
 ┃  ┃  ┣ 📂 [UnComposant]         -> Un composant de type page et ses enfants qui en découlent
 ┃  ┃  ┣ 📂 shared                -> Les composants partagés par toute l'application (ExternalLink...)
 ┃  ┃  ┗ 📂 transverse            -> Les composants transverses à toute l'application (EnTete, PiedDePage...)
 ┃  ┣ 📂 domain                   -> Les objets métier
 ┃  ┣ 📂 gateways                 -> Les repositories, loaders et gateways
 ┃  ┣ 📂 presenters               -> Les presenters
 ┃  ┗ 📂 use-cases                -> Les use cases, queries et commands
 ┣ 📜 .editorconfig               -> Configuration de règles de formattage de base
 ┣ 📜 .env                        -> Valeurs par défaut des variables d'environnement
 ┣ 📜 .env.local                  -> Variables d'environnement locale
 ┣ 📜 .eslintrc                   -> Configuration ESLint
 ┣ 📜 .gitignore                  -> Fichiers à ne pas commiter
 ┣ 📜 .nvmrc                      -> La version de Node à utiliser
 ┣ 📜 .prettierrc                 -> Configuration Prettier
 ┣ 📜 .slugignore                 -> Les fichiers ignorés de l'image Scalingo au build (étant limité à 1,5 Go)
 ┣ 📜 .stylelintrc                -> Configuration Stylelint
 ┣ 📜 knip.json                   -> Configuration Knip
 ┣ 📜 next.config.js              -> Configuration de Next
 ┣ 📜 package.json                -> Configuration du projet Node
 ┣ 📜 scalingo.json               -> Configuration de Scalingo
 ┣ 📜 sentry.xxx.config.ts        -> Configuration de Sentry
 ┣ 📜 stryker-backend.conf.json   -> Configuration de Stryker
 ┣ 📜 stryker-frontend.conf.json  -> Configuration de Stryker
 ┣ 📜 tsconfig.json               -> Configuration de TypeScript
 ┣ 📜 vitest.config.js            -> Configuration de Vitest
 ┣ 📜 vitest.setup.js             -> Actions à exécuter avant tous les tests
```

Se référer à [cette page de dicussion](https://github.com/anct-cnum/suite-gestionnaire-numerique/discussions/202)
dédiée à une description exhaustive de l'architecture applicative en vigueur sur l'application.

## ⚡ Production

### Importer les données FNE et CoNum (<ins>avant mise en service</ins>)

- Se connecter à un _one-off container_ Scalingo :  
  `yarn bash:production`  
  Il s'agit d'un environnement éphémère identique à celui de production et connecté à la même base de données.

- Installer **prisma** :  
  `yarn add @prisma/client`

- Si le déploiement inclut des migrations "cassantes", c'est à dire qui ne peuvent s'exécuter sans reconstruire
  intégralement la structure de la base de données, recréer la structure :  
  `yarn prisma:reset`

- Déclencher le déploiement (via un _commit_ ou _merge_ de branche sur **main**)

- Se connecter à nouveau à un _one-off container_ Scalingo :  
  `yarn bash:production`  
  et installer **prisma** :  
  `yarn add @prisma/client`

- Lancer le script d'import :  
  `yarn migration:all`

### Pro connect

- Production:
  URLs de redirection post CONNEXION: https://mon-inclusion-numerique.osc-fr1.scalingo.io/api/auth/callback/pro-connect
  URLs de redirection post DÉCONNEXION: https://mon-inclusion-numerique.osc-fr1.scalingo.io/connexion
  Lien du dossier démarches-simplifiées: https://www.demarches-simplifiees.fr/dossiers/22822056

  Les client_id et client_secret de production à renseigner dans les variables d'environnement de scalingo se trouve dans le vaultwarden
  PRO_CONNECT_CLIENT_ID = clientID
  PRO_CONNECT_CLIENT_SECRET = clienSecret
  PRO_CONNECT_URL = https://auth.agentconnect.gouv.fr/api/v2

- Développement:
  Les client_id et client_secret de dev à renseigner dans le .env.local se trouve dans le vaultwarden
  PRO_CONNECT_CLIENT_ID = clientID
  PRO_CONNECT_CLIENT_SECRET = clienSecret
  PRO_CONNECT_URL = https://fca.integ01.dev-agentconnect.fr/api/v2

  Compte Pro connect de dev: test@fia1.fr
