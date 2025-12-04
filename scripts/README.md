# Scripts utilitaires

Ce répertoire contient des scripts utilitaires pour la gestion des données et des assets de l'application MIN.

## Script d'optimisation des images

### Description

Le script `optimize-images.sh` permet d'optimiser les images (PNG, JPEG) pour le web. Il utilise des outils CLI performants pour réduire la taille des fichiers sans perte de qualité visible.

### Prérequis

Les outils suivants doivent être installés. Ils sont disponibles via **devbox** :

```bash
devbox shell
```

Outils utilisés (configurés dans `devbox.json`) :

- `optipng` : Optimisation PNG sans perte
- `pngquant` : Optimisation PNG avec perte (très efficace)
- `jpegoptim` : Optimisation JPEG
- `libwebp` : Conversion WebP (cwebp)

### Utilisation

#### Option 1 : Scripts yarn

```bash
# Optimiser les images de public/vitrine (par défaut)
yarn optimize:images

# Optimiser et générer des versions WebP
yarn optimize:images:webp

# Mode dry-run (voir ce qui serait fait sans modifier)
yarn optimize:images:dry-run
```

#### Option 2 : Exécution directe

```bash
# Optimiser le répertoire par défaut (public/vitrine)
./scripts/optimize-images.sh

# Optimiser un répertoire spécifique
./scripts/optimize-images.sh public/images

# Avec génération de WebP
./scripts/optimize-images.sh --webp

# Mode dry-run
./scripts/optimize-images.sh --dry-run

# Combiner les options
./scripts/optimize-images.sh --webp --dry-run public/vitrine
```

### Options

| Option      | Description                                           |
| ----------- | ----------------------------------------------------- |
| `--dry-run` | Affiche ce qui serait fait sans modifier les fichiers |
| `--webp`    | Génère également des versions WebP des images         |
| `--help`    | Affiche l'aide                                        |

### Ce que fait le script

1. **PNG** :

   - Optimisation avec perte via `pngquant` (qualité 65-80%)
   - Optimisation sans perte supplémentaire via `optipng`
   - Ne remplace que si le fichier optimisé est plus petit

2. **JPEG** :

   - Optimisation via `jpegoptim` (qualité max 80%)
   - Suppression des métadonnées (EXIF, etc.)

3. **WebP** (optionnel) :
   - Conversion des PNG et JPEG en WebP
   - Qualité 80%
   - Ne régénère pas si le WebP existe déjà et est plus récent

### Exemple de sortie

```
═══════════════════════════════════════════════════════════
  Optimisation des images pour le web
═══════════════════════════════════════════════════════════

Répertoire: public/vitrine

▶ Optimisation des fichiers PNG...
  ✓ public/vitrine/lieux/illustration-cartographie.png: 877 Ko → 234 Ko (-73.3%)
  ✓ public/vitrine/accueil/carte-france-logos.png: 171 Ko → 89 Ko (-47.9%)
  ⊘ public/vitrine/outils/icon-min.png: déjà optimisé (8.8 Ko)

▶ Optimisation des fichiers JPEG...
  (aucun fichier JPEG trouvé)

═══════════════════════════════════════════════════════════
  Résumé
═══════════════════════════════════════════════════════════
  PNG optimisés:     45
  JPEG optimisés:    0
  Fichiers ignorés:  12 (déjà optimisés)

  Taille originale:  4.2 Mo
  Taille optimisée:  1.8 Mo
  Économie totale:   2.4 Mo (-57.1%)
```

### Bonnes pratiques

1. **Avant de committer** : Lancez `yarn optimize:images` pour optimiser les nouvelles images
2. **Vérification** : Utilisez `--dry-run` pour voir l'impact avant d'optimiser
3. **WebP** : Utilisez `--webp` si votre application supporte le format WebP (meilleure compression)

### Intégration avec Next.js

Next.js optimise automatiquement les images via le composant `<Image>`. Ce script est utile pour :

- Réduire la taille du dépôt Git
- Optimiser les images utilisées en dehors du composant `<Image>`
- Préparer des versions WebP statiques

---

## Script de détection des assets inutilisés

### Description

Le script `find-unused-assets.sh` permet de détecter les fichiers dans `public/` qui ne sont pas référencés dans le code source. Utile pour nettoyer les assets orphelins et réduire la taille du dépôt.

### Utilisation

#### Scripts yarn

```bash
# Analyser public/ et lister les fichiers inutilisés
yarn assets:unused

# Analyser et supprimer (avec confirmation)
yarn assets:unused:delete

# Sortie JSON (pour intégration CI)
yarn assets:unused:json
```

#### Exécution directe

```bash
# Analyser public/ (par défaut)
./scripts/find-unused-assets.sh

# Analyser un répertoire spécifique
./scripts/find-unused-assets.sh public/vitrine

# Supprimer avec confirmation
./scripts/find-unused-assets.sh --delete

# Supprimer sans confirmation
./scripts/find-unused-assets.sh --delete --force

# Sortie JSON
./scripts/find-unused-assets.sh --json
```

### Options

| Option     | Description                                     |
| ---------- | ----------------------------------------------- |
| `--delete` | Supprime les fichiers inutilisés (confirmation) |
| `--force`  | Avec --delete, supprime sans confirmation       |
| `--json`   | Sortie au format JSON                           |
| `--help`   | Affiche l'aide                                  |

### Ce que fait le script

1. Liste tous les fichiers assets dans le répertoire cible (images, fonts, vidéos, etc.)
2. Pour chaque fichier, recherche des références dans :
   - Le code source (`src/`) : `.tsx`, `.ts`, `.css`, `.scss`, `.json`, `.md`
   - Les fichiers de configuration dans `public/` : `.json`, `.html`, `.xml`
3. Identifie les fichiers sans référence
4. Affiche un rapport groupé par répertoire

### Fichiers exclus automatiquement

Certains fichiers sont exclus de l'analyse car ils sont utilisés par convention :

- `favicon*` - Icônes de navigateur
- `apple-touch-icon*` - Icônes iOS
- `dsfr*` - Assets du Design System FR
- `matomo*` - Scripts d'analytics
- `robots.txt`, `sitemap*` - SEO
- `.well-known/` - Fichiers de vérification

### Exemple de sortie

```
═══════════════════════════════════════════════════════════
  Analyse des assets inutilisés
═══════════════════════════════════════════════════════════

Répertoire analysé: public/vitrine
Assets analysés:    65 utilisés, 12 inutilisés

Assets potentiellement inutilisés :

  📁 public/vitrine/accueil/
    ✗ logo-coop-vector.svg (2.9 Ko)
    ✗ logo-aidants-connect.svg (5.7 Ko)

  📁 public/vitrine/lieux/
    ✗ illustration-cartographie.png (877 Ko)

───────────────────────────────────────────────────────────
  Total inutilisé: 12 fichiers (1.2 Mo)
───────────────────────────────────────────────────────────

Conseil: Utilisez --delete pour supprimer ces fichiers
```

### Limitations

- **Références dynamiques** : Le script ne détecte pas les fichiers référencés via des template strings (`/vitrine/${name}.png`)
- **Faux positifs possibles** : Vérifiez manuellement avant de supprimer en production

### Intégration CI

Le script retourne un code d'erreur si des fichiers inutilisés sont trouvés :

```bash
# Dans un workflow CI
yarn assets:unused:json || echo "Des assets inutilisés ont été trouvés"
```

---

## Script de test du cache API Coop

### Description

Le script `test-cache-api-coop.ts` permet de tester le système de cache pour l'API Coop Numérique.

### Usage

```bash
# Avec yarn
yarn tsx scripts/test-cache-api-coop.ts

# Avec npx
npx tsx scripts/test-cache-api-coop.ts

# Directement (si le fichier est exécutable)
./scripts/test-cache-api-coop.ts
```

### Prérequis

- **Token API valide** : Configurez `COOP_TOKEN` dans `.env.local` avec un vrai token (pas `FAKE_TOKEN`)
- **Connexion internet** : Pour les appels API réels

### Ce que teste le script

1. **Cache MISS** : Premier appel lent (~7 secondes)
2. **Cache HIT** : Appels répétés instantanés (0ms)
3. **Cache par département** : Chaque territoire a son cache séparé
4. **Accélération** : Mesure l'amélioration de performance (>1000x)
5. **Statistiques** : Affiche l'état du cache (nombre d'entrées, âge)
6. **Vidage du cache** : Test après suppression du cache

### Exemple de sortie

```
📊 Test 1: Premier appel France entière (devrait être un MISS)...
🌐 Cache MISS pour: france_entiere - Appel API en cours...
✅ Données mises en cache pour: france_entiere
   ⏱️ Temps: 7864ms
   📊 Bénéficiaires: 1 027 790

📊 Test 2: Deuxième appel France entière (devrait être un HIT)...
📦 Cache HIT pour: france_entiere (âge: 8s)
   ⏱️ Temps: 0ms
   ✅ Accélération: >1000x plus rapide!
```

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
