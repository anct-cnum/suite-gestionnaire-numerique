# Scripts de mise à jour des données

Ce répertoire contient des scripts utilitaires pour la gestion des données de l'application MIN.

## Script de mise à jour des statuts de subventions

### Description

Le script `update-subvention-status.ts` permet de mettre à jour les statuts de subventions dans la base de données à partir d'un fichier CSV.

### Prérequis

1. **devbox** activé avec les packages suivants dans `devbox.json` :
   - `nodejs@22`
   - `minio-client`

2. **Base de données PostgreSQL** accessible (locale ou distante)

3. **Dépendances Node.js** installées :
   ```bash
   yarn install
   ```

### Installation

Le script utilise les dépendances déjà présentes dans le projet :

- `@prisma/client` : Client Prisma pour TypeScript
- `tsx` : Exécuteur TypeScript

Aucune installation supplémentaire n'est nécessaire.

### Configuration de la base de données

Le script utilise la variable d'environnement `DATABASE_URL` définie dans votre fichier `.env` à la racine du projet :

```bash
# Base de données locale (Docker)
DATABASE_URL=postgresql://min:min@localhost:5432/min

# Base de données de test (Docker)
# DATABASE_URL=postgresql://min:min@localhost:5434/min

# Base de données de production
# DATABASE_URL=postgresql://username:password@host:port/database
```

### Format du fichier CSV

Le script attend un fichier CSV avec le format suivant :

```csv
demande_subvention_id;statut;action_id;nom_action;feuille_route_id;nom_feuille_route;code_departement;montant_subvention;
39;acceptee;39;Déploiement de la feuille de route FNE dans l'Ain;49;France numérique ensemble Ain;1;25000;
99;acceptee;99;Appui à l'élaboration et la rédaction de la feuille de route;49;France numérique ensemble Ain;1;20350;
334;acceptee;334;Formation Aidant Connect;49;France numérique ensemble Ain;1;20000;
```

**Champs requis :**

- `demande_subvention_id` : ID de la demande de subvention (entier)
- `statut` : Nouveau statut à appliquer
- `action_id` : ID de l'action associée
- `nom_action` : Nom de l'action
- `feuille_route_id` : ID de la feuille de route
- `nom_feuille_route` : Nom de la feuille de route
- `code_departement` : Code du département
- `montant_subvention` : Montant de la subvention

### Statuts autorisés

Les statuts suivants sont acceptés :

- `acceptee` : Subvention validée
- `deposee` : Demande envoyée
- `enCours` : Demande en cours d'instruction
- `nonSubventionnee` : Non subventionnée
- `refusee` : Subvention refusée

### Utilisation

#### Option 1 : Script avec fichier personnalisé

```bash
# Depuis la racine du projet
yarn update-subventions <fichier_csv>
```

#### Option 2 : Script avec fichier d'exemple

```bash
# Utiliser le fichier d'exemple inclus
yarn update-subventions:example
```

#### Option 3 : Exécution directe avec tsx

```bash
# Exécution directe sans yarn
tsx scripts/update-subvention-status.ts <fichier_csv>
```

**Exemples :**

```bash
# Avec un fichier personnalisé
yarn update-subventions mon_fichier.csv

# Avec le fichier d'exemple
yarn update-subventions:example

# Exécution directe
tsx scripts/update-subvention-status.ts scripts/subventions_exemple.csv
```

### Fonctionnement

1. **Validation** : Le script vérifie la configuration et la validité des données
2. **Confirmation** : Demande confirmation avant de procéder aux mises à jour
3. **Mise à jour** : Met à jour chaque demande de subvention dans la base de données
4. **Rapport** : Affiche un résumé des opérations effectuées

### Exemple de sortie

```
Lecture du fichier subventions.csv...
Trouvé 3 lignes à traiter.
Statuts autorisés: acceptee, deposee, enCours, nonSubventionnee, refusee

Voulez-vous procéder à la mise à jour ? (oui/non): oui
Mise à jour en cours...
✓ Demande 39 mise à jour: deposee → acceptee
✓ Demande 99 mise à jour: enCours → acceptee
✓ Demande 334 mise à jour: deposee → acceptee

Résumé:
- Mises à jour réussies: 3
- Erreurs: 0
Terminé.
```

### Gestion des erreurs

Le script gère les erreurs suivantes :

- **Fichier CSV introuvable** : Vérifiez le chemin du fichier
- **Configuration manquante** : Vérifiez la variable `DATABASE_URL`
- **Statut invalide** : Vérifiez les valeurs dans le CSV
- **Demande inexistante** : L'ID de la demande n'existe pas en base
- **Erreur de connexion** : Vérifiez l'accessibilité de la base de données

### Sécurité

⚠️ **Attention :** Ce script modifie directement la base de données. Assurez-vous de :

- Faire une sauvegarde avant utilisation
- Tester sur un environnement de développement
- Vérifier les données avant et après la mise à jour

### Dépannage

**Erreur : "devbox n'est pas activé"**

```bash
devbox shell
```

**Erreur : "Cannot find module '@prisma/client'"**

```bash
# Générer le client Prisma
yarn prisma:generate
```

**Erreur : "La variable d'environnement DATABASE_URL n'est pas définie"**

```bash
# Vérifiez que le fichier .env existe à la racine du projet
# et contient la variable DATABASE_URL
```

**Erreur de connexion à la base de données**

- Vérifiez que PostgreSQL est démarré : `docker-compose up postgres-dev`
- Vérifiez les paramètres de connexion dans `.env`
- Testez la connexion avec `psql`

### Scripts disponibles

Le projet inclut les scripts suivants dans `package.json` :

- `yarn update-subventions <fichier>` : Mise à jour avec un fichier CSV personnalisé
- `yarn update-subventions:example` : Mise à jour avec le fichier d'exemple
- `yarn prisma:generate` : Génération du client Prisma
- `yarn prisma:migrate` : Exécution des migrations

### Structure des fichiers

```
min/
├── .env                    # Configuration de la base de données
├── devbox.json            # Configuration devbox
├── package.json           # Dépendances Node.js et scripts
├── prisma/
│   └── schema.prisma      # Schéma de base de données
└── scripts/
    ├── update-subvention-status.ts  # Script principal
    ├── subventions_exemple.csv      # Données d'exemple
    └── README.md          # Cette documentation
```
