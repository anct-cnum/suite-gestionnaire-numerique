# Suite gestionnaire numérique

**Sur ce projet, `yarn` est le gestionnaire de paquets utilisé**

## 🛠️ Prérequis

Avoir la version LTS de Node décrite dans le fichier `.nvmrc`.

```bash
nvm install v20.x.x
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

Pour accéder à la base de données selon un environnement :

```bash
yarn psql:local
yarn psql:production (il faut avoir installer la CLI de Scalingo au préalable)
yarn psql:test
```

Quand le schéma de SGN est modifié, regénérer les tables à partir des schémas Prisma, créer les migrations au besoin et générer les types pour Prisma Client :

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
