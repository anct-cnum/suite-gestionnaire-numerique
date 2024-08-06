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
yarn db:start
yarn dev
```

Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000) pour voir le résultat

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

Pour accéder à la base de données selon un environnement :

```bash
yarn psql:local
yarn psql:production (il faut avoir installer la CLI de Scalingo au préalable)
yarn psql:test
```

## ⬆️ Mise à jour du DSFR

Ne pas oublier de copier/coller le fichier JS et les pictos dans `/public`.
