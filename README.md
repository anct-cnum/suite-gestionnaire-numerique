# Mon inclusion numérique

**Sur ce projet, `yarn` est le gestionnaire de paquets utilisé**

```bash
corepack enable
```

## ✅️ Prérequis

### En utilisant nvm

Avoir la version LTS de Node décrite dans le fichier `.nvmrc`.

```bash
nvm install
```

### En utilisant devbox

Pour installer devbox, suivre les instructions sur [devbox.sh](https://devbox.sh/docs/getting-started/installation).

Pour lancer l'environnement de développement, exécuter la commande suivante :

```bash
devbox shell
```

## 🚀 Démarrage

D'abord, installer les dépendances.

```bash
yarn
```

Remplacer les variables d'environnement affectées à "A_REMPLIR" dans `.env.local` en demandant à l'équipe en place. Les autres ne sont pas utiles au bon déroulement de l'application.

Lancer le serveur de développement

```bash
yarn db:start
yarn dev
```

Ouvrir le navigateur sur [http://localhost:3000](http://localhost:3000) pour voir le résultat.

Vous ne pourrez pas vous connecter car vous n'avez pas de données en base.
Il faut à minima un utilisateur et une gouvernance auquel il est raccroché.

### 📊 Import des données de base

#### Option 1 : Jeu de données MIN anonymisé (recommandé)

1. Récupérer un jeu de données anonymisées de la base MIN
2. Placer le fichier dans le répertoire `dbs/`
3. Exécuter la commande suivante :

```bash
docker compose exec postgres-dev psql -U min -1 -f /dbs/min.sql
```

#### Option 2 : Jeu de données du dataspace

```bash
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-data-01-admin-ref.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-data-02-main.sql
```

#### Minimum requis : Données MIN anonymisées

Pour pouvoir vous connecter, vous devez importer au minimum un jeu de données anonymisées de la base MIN :

1. Récupérer un jeu de données anonymisées de la base MIN
2. Placer le fichier dans le répertoire `dbs/`
3. Exécuter la commande suivante :

```bash
docker compose exec postgres-dev psql -U min -1 -f /dbs/min.sql
```

#### Extension optionnelle : Données du dataspace

Pour enrichir votre environnement avec des données supplémentaires du dataspace :

```bash
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-data-01-admin-ref.sql
docker compose exec postgres-dev psql -U min -1 -f /dbs/dataspace-data-02-main.sql
```

### 🔐 Configuration de l'authentification Pro-Connect

Le `sso_id` et `sso_email` de l'utilisateur avec lequel vous voulez vous connecter doivent être égaux à votre identifiant de connexion Pro-Connect.

**Exemple de mise à jour :**

```bash
docker compose exec postgres-dev psql -U min -1 -c "update utilisateur set sso_id='test@fia1.fr' where email_de_contact='compte.de.test@example.com';"
docker compose exec postgres-dev psql -U min -1 -c "update utilisateur set sso_email='test@fia1.fr' where email_de_contact='compte.de.test@example.com';"
```

> **Note :** Le compte Pro-Connect de développement est `test@fia1.fr`

## 📖 Storybook

Storybook est utilisé pour développer et tester les composants UI de manière isolée.

Pour lancer Storybook :

```bash
yarn storybook
```

Ouvrir le navigateur sur [http://localhost:6006](http://localhost:6006) pour voir les stories.

### Créer une nouvelle story

1. Créer un fichier `*.stories.ts` dans le répertoire `src/stories/`
2. Importer le composant à documenter
3. Définir les différents scénarios (stories) avec des props variées
4. Utiliser les contrôles Storybook pour rendre les props interactives

Exemple de structure d'une story :

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MonComposant from '@/components/MonComposant'

const meta: Meta<typeof MonComposant> = {
  title: 'Components/MonComposant',
  component: MonComposant,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    prop1: 'valeur',
    prop2: 123,
  },
}
```

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
yarn psql:test
```

Pour accéder à la base de données de production avec un outils, il faut lancer un tunnel SSH avant. Pour cela, il faut donner une clé SSH publique au DataSpace.
Une alternative est de se connecter au bastion Scalingo, d'ouvrir un tunnel SSH puis de lancer psql.

```bash
yarn bash:production
ssh -i .ssh/id_rsa -N -f -L $DS_BDD_IP $DS_BASTION_IP -p $DS_BASTION_PORT
psql "${DATABASE_URL/?schema=min/?options=--search_path%3dmin}"
```

Quand le schéma de MIN est modifié, regénérer les tables à partir des schémas Prisma, créer les migrations au besoin et générer les types pour Prisma Client :

```bash
yarn prisma:migrate
```

Quand tu veux ré-initialiser la base de données :

```bash
yarn prisma:drop:schema
```

Quand tu veux enchainer les deux dernières commandes d'affilé :

```bash
yarn prisma:reset
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
 ┃  ┣ 📂 shared                   -> Fonctions communes à tout le projet
 ┃  ┗ 📂 use-cases                -> Les use cases : queries et commands
 ┣ 📜 .buildpacks                 -> Container pour le deploy de Scalingo
 ┣ 📜 .editorconfig               -> Configuration de règles de formattage de base
 ┣ 📜 .env                        -> Valeurs par défaut des variables d'environnement
 ┣ 📜 .env.local                  -> Variables d'environnement locale
 ┣ 📜 .env.test                   -> Variables d'environnement pour les tests
 ┣ 📜 .eslintrc                   -> Configuration ESLint
 ┣ 📜 .gitignore                  -> Fichiers à ne pas commiter
 ┣ 📜 .nvmrc                      -> La version de Node à utiliser
 ┣ 📜 .prettierignore             -> Fichiers que Prettier ne traite pas
 ┣ 📜 .prettierrc                 -> Configuration Prettier
 ┣ 📜 .slugignore                 -> Les fichiers ignorés du containter Scalingo au deploy (étant limité à 1,5 Go)
 ┣ 📜 .stylelintrc                -> Configuration Stylelint
 ┣ 📜 build.sh                    -> Commande lancée au build du deploy chez Scalingo
 ┣ 📜 eslint.config.js            -> Configuration Eslint strict
 ┣ 📜 knip.json                   -> Configuration Knip
 ┣ 📜 next.config.js              -> Configuration de Next
 ┣ 📜 package.json                -> Configuration du projet Node
 ┣ 📜 post-install.sh             -> Actions effectuées après la première installation du projet
 ┣ 📜 Procfile                    -> Commande lancée pour démarrer l'application au deploy chez Scalingo
 ┣ 📜 scalingo.json               -> Configuration de Scalingo
 ┣ 📜 sentry.xxx.config.ts        -> Configuration de Sentry
 ┣ 📜 stryker-backend.conf.json   -> Configuration de Stryker
 ┣ 📜 stryker-frontend.conf.json  -> Configuration de Stryker
 ┣ 📜 tsconfig.json               -> Configuration de TypeScript strict
 ┣ 📜 vitest.config.js            -> Configuration de Vitest
 ┣ 📜 vitest.setup.js             -> Actions à exécuter avant tous les tests
```

Se référer à [cette page de dicussion](https://github.com/anct-cnum/suite-gestionnaire-numerique/discussions/202)
dédiée à une description exhaustive de l'architecture applicative en vigueur sur l'application.

### Pro connect

- Production:
  URLs de redirection post CONNEXION: https://mon-inclusion-numerique.osc-fr1.scalingo.io/api/auth/callback/pro-connect
  URLs de redirection post DÉCONNEXION: https://mon-inclusion-numerique.osc-fr1.scalingo.io/connexion
  Lien du dossier démarches-simplifiées: https://www.demarches-simplifiees.fr/dossiers/22822056

  Les client_id et client_secret de production à renseigner dans les variables d'environnement de Scalingo se trouve dans le vaultwarden
  PRO_CONNECT_CLIENT_ID = clientID
  PRO_CONNECT_CLIENT_SECRET = clienSecret
  PRO_CONNECT_URL = https://auth.agentconnect.gouv.fr/api/v2

- Développement:
  Les client_id et client_secret de dev à renseigner dans le .env.local se trouve dans le vaultwarden
  PRO_CONNECT_CLIENT_ID = clientID
  PRO_CONNECT_CLIENT_SECRET = clienSecret
  PRO_CONNECT_URL = https://fca.integ01.dev-agentconnect.fr/api/v2

  Compte Pro connect de dev: test@fia1.fr
