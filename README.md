# Suite gestionnaire numérique

**Sur ce projet, `yarn` est le gestionnaire de paquets utilisé**

## 🛠️ Prérequis

Avoir la version LTS de Node décrite dans le fichier `.nvmrc`.

```bash
nvm install v20.x.x
```

## 🚀 Démarrage

D'abord, installez les dépendances

```bash
yarn install
```

Remplissez les variables d'environnement en copiant `.env` en `.env.local`.
Pour `NEXTAUTH_SECRET`, lancer la commande `openssl rand -base64 32`.

Ensuite, lancez le serveur de développement

```bash
yarn dev
```

Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000) pour voir le résultat

## 🧪 Tests

Pour lancer les tests une fois, exécutez :

```bash
yarn test
```

Pour lancer les tests en continu, exécutez :

```bash
yarn test:watch
```

Pour lancer les tests avec le coverage, exécutez :

```bash
yarn test:coverage
```

## ⬆️ Mise à jour du DSFR

Ne pas oublier de copier/coller le fichier JS et les pictos dans `/public`.

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

- Permet de formatter le CSS
- Permet de réduire l'écriture de bug
- Permet d'avoir un feedback rapide d'erreur
- Configurer en strict pour avoir une haute qualité de développement
- Ajout de quelques plugins pour renforcer

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

## Arboresence

```text
📦 Suite gestionnaire numérique
 ┣ 📂 .github/workflows           -> Configuration de CodeQL et dependabot
 ┣ 📂 .husky/workflows            -> Configuration du pre-push
 ┣ 📂 public                      -> Assets statiques dont le dsfr.js
 ┣ 📂 src
 ┃  ┣ 📂 app                      -> Les controllers
 ┃  ┣ 📂 components
 ┃  ┃  ┣ 📂 [UnComposant]         -> Un composant de type page et ses enfants qui en découlent
 ┃  ┃  ┣ 📂 shared                -> Les composants partagés par toute l'application (LienExterne...)
 ┃  ┃  ┗ 📂 transverse            -> Les composants transverses à toute l'application (EnTete, PiedDePage...)
 ┃  ┣ 📂 domain                   -> Les objets métier
 ┃  ┣ 📂 gateways                 -> Les repositories, queries et gateways
 ┃  ┣ 📂 presenters               -> Les presenters
 ┃  ┗ 📂 use-cases                -> Les use cases, queries et commands
 ┣ 📜 .env                        -> Valeurs par défaut des variables d'environnement
 ┣ 📜 .env.local                  -> Variables d'environnement locale
 ┣ 📜 .eslintrc                   -> Configuration ESLint
 ┣ 📜 .gitignore                  -> Fichiers à ne pas commiter
 ┣ 📜 .nvmrc                      -> La version de Node à utiliser
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

### Controller

- Définition : la porte d'entrée d'un utilisateur : une page au sens Next ou une route API et font office d'orchestrateur pour séparer les responsabilités
- Convention : PascalCase (fonction), avec comme suffixe `Controller` (ex : `AccueilController`)
- Test : à définir

### Component

- Définition : un composant TSX
- Convention : PascalCase (classe) et aucune logique dedans (ex : `MesInformationsPersonnelles`), elle est dans un hook custom à côté pour séparer les responsabilités
- Test : on teste la sémantique et les actions utilisateur

### Domain

- Définition : c'est le métier, agnostisque de l'infrastructure
- Convention : PascalCase (classe) (ex : `Utilisateur`)
- Test : test unitaire classique

### Gateway

- Définition : manipulation de données
  - Query : lecture de données qui retourne du métier (ex : `InMemoryMesInformationsPersonnellesQuery`)
  - Repository : écriture de données qui retourne rien
  - Gateway : lecture de données qui retourne autre chose que du métier (DTO) (ex : `ProConnectAuthentificationGateway`)
- Convention : PascalCase (classe), avec comme préfixe son implémentation et comme suffixe son type de gateway
- Test : à définir

### Presenter

- Définition : transforme les données venant d'une query de manière à ce qu'un component puisse l'afficher (DTO)
- Convention : camelCase (fonction) (ex : `mesInformationsPersonnellesPresenter`)
- Test : à définir
