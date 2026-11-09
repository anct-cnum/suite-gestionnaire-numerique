# Pré-audit RGAA 4.1 du site vitrine Inclusion Numérique

> **Statut** : brouillon · **Public** : tech | métier · **Mis à jour** : 2026-11-05 · **Tickets** : #2238 (chapeau), #2239 à #2256

Auto-évaluation préalable à un audit RGAA 4.1 du site vitrine `inclusion-numerique.anct.gouv.fr`, c'est-à-dire tout ce qui est rendu sous `src/app/vitrine`. Elle ne remplace pas un audit complet. Elle sert à corriger avant l'audit tout ce qui peut l'être, et à préparer l'échantillon.

**Conditions du pré-audit**

- Code de la branche au commit `18f306df`, servi en local en mode vitrine, avec la base de données de développement.
- Navigateur Chrome 154, sous Linux.
- Scan automatique avec axe-core 4.14, règles WCAG 2.0/2.1/2.2 A et AA + bonnes pratiques.
- Inspection du DOM.
- Parcours au clavier.
- Espacement du texte (critère 10.12) injecté en CSS.
- Balayage de 15 largeurs, de 320 à 1920 px.
- Zoom 200 % simulé.
- Calcul des contrastes.
- Lecture du code source.

**Ce qui n'a pas été fait** : test avec un lecteur d'écran, désactivation du CSS, test sur mobile réel.

**Légende des constats**

| Marque       | Signification                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **[mesuré]** | Observé dans le navigateur : sortie d'axe, valeur du DOM, dimension, ratio de contraste calculé, comportement au clavier. |
| **[code]**   | Lu dans le code source, pas observé en navigateur.                                                                        |
| **[estimé]** | Jugement qui relève de l'auditeur : pertinence d'une alternative, caractère décoratif d'une image, etc.                   |

**Statuts** : **C** conforme · **NC** non conforme · **NA** non applicable · **AV** à vérifier manuellement. Tous les statuts sont des estimations : seul l'audit les établit.

---

## 1. Échantillon

### 1.1 Pages retenues

Les URL sont celles du domaine public, sans le préfixe `/vitrine` que le proxy ajoute en interne.

| #   | Page                               | URL                                                             | Gabarit                                 | Prérequis                               |
| --- | ---------------------------------- | --------------------------------------------------------------- | --------------------------------------- | --------------------------------------- |
| 1   | Accueil                            | `/`                                                             | Page éditoriale « hero »                | —                                       |
| 2   | Lieux                              | `/lieux`                                                        | Page éditoriale « hero »                | —                                       |
| 3   | Dispositifs                        | `/dispositifs`                                                  | Page éditoriale « hero »                | —                                       |
| 4   | Outils numériques                  | `/outils-numeriques`                                            | Page éditoriale « hero » + cartes outil | —                                       |
| 5   | Mon Inclusion Numérique            | `/outils-numeriques/min`                                        | Page outil avec fil d'Ariane            | —                                       |
| 6   | Données territoriales (accueil)    | `/donnees-territoriales`                                        | Recherche de territoire + carte         | Données en base                         |
| 7   | Synthèse et indicateurs, national  | `/donnees-territoriales/synthese-et-indicateurs/national`       | Gabarit « données »                     | Données en base                         |
| 8   | Synthèse et indicateurs, Rhône     | `/donnees-territoriales/synthese-et-indicateurs/departement/69` | Gabarit « données »                     | Données en base                         |
| 9   | Lieux d'inclusion, national        | `/donnees-territoriales/lieux-inclusion/national`               | Gabarit « données »                     | Données en base                         |
| 10  | Lieux d'inclusion, Rhône           | `/donnees-territoriales/lieux-inclusion/departement/69`         | Gabarit « données »                     | Données en base                         |
| 11  | Médiateurs numériques, national    | `/donnees-territoriales/mediateurs-numeriques/national`         | Gabarit « données » + statistiques      | Données en base (statistiques Coop)     |
| 12  | Médiateurs numériques, Rhône       | `/donnees-territoriales/mediateurs-numeriques/departement/69`   | Gabarit « données » + statistiques      | Données en base (statistiques Coop)     |
| 13  | Gouvernances, Rhône                | `/donnees-territoriales/gouvernances/departement/69`            | Gabarit « données » + tableau           | Données en base                         |
| 14  | Feuille de route, Rhône            | `/donnees-territoriales/feuille-de-route/departement/69`        | Gabarit « données » + tiroir + PDF      | Données en base, stockage des documents |
| 15  | Déclaration d'accessibilité        | `/accessibilite`                                                | Page légale                             | —                                       |
| 16  | Mentions légales                   | `/mentions-legales`                                             | Page légale                             | —                                       |
| 17  | Conditions générales d'utilisation | `/conditions-generales-utilisation`                             | Page légale                             | —                                       |
| 18  | Politique de confidentialité       | `/politique-confidentialite`                                    | Page légale + tableaux                  | —                                       |
| 19  | Page d'erreur 404                  | `/page-inexistante`                                             | Page d'erreur                           | —                                       |

**Choix des niveaux territoriaux.** Les rubriques Gouvernances et Feuille de route n'ont pas de niveau national : `/…/gouvernances/national` et `/…/feuille-de-route/national` redirigent (HTTP 307) vers la synthèse nationale **[mesuré]**. Pour ces deux rubriques, seul le niveau département a donc été retenu. Les niveaux région et intercommunalité utilisent le même gabarit. À ajouter à l'échantillon d'audit si l'auditeur le demande, l'intercommunalité de préférence : son titre est complété côté client (`Header.tsx`).

**Données et authentification.**

- Aucune page de la vitrine ne demande d'authentification.
- Les pages 6 à 14 lisent la base de données ; elles ont été évaluées avec la base de développement. Le rendu dépend du volume de données : nombre de membres, longueur des noms, nombre d'actions. L'audit doit donc se faire sur un environnement aux données réalistes, recette ou production.
- Le PDF de la feuille de route (page 14) renvoie une erreur 500 en local, car le stockage des documents n'y est pas configuré **[mesuré]**. Il n'a pas pu être évalué.

### 1.2 Pages obligatoires absentes

| Page                | État                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan du site        | Absente : `/plan-du-site` renvoie 404 **[mesuré]**. Aucun lien dans le pied de page.                                                                      |
| Contact             | Absente : `/contact` renvoie 404 **[mesuré]**. Le seul contact est le lien « Aide » de l'en-tête (`mailto:`) et l'adresse électronique de la déclaration. |
| Aide                | Pas de page : « Aide » est un lien `mailto:`.                                                                                                             |
| Gestion des cookies | Pas de lien. La politique de confidentialité déclare une mesure d'audience exemptée de consentement **[code]**.                                           |

### 1.3 Documents téléchargeables

| Document                                               | Où                                            | État                                                                                                                                                              |
| ------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF des feuilles de route, déposés par les territoires | Page 14, lien « Ouvrir le pdf »               | Contenu fourni par les utilisateurs, nombre variable. Non évalué en local. Le lien n'indique ni le poids ni la langue ; le format n'apparaît que dans l'intitulé. |
| PDF « DPA Scaleway »                                   | Politique de confidentialité, lien externe    | Document tiers. À sortir de l'échantillon et à signaler à l'auditeur.                                                                                             |
| Images PNG des graphiques                              | Page 10, boutons « Télécharger le graphique » | Image générée du graphique, sans alternative ; format non indiqué.                                                                                                |
| Fichiers de `public/vitrine`                           | —                                             | Uniquement des images (`.png`, `.svg`). Aucun document **[mesuré]**.                                                                                              |

Le bouton « Exporter » (pages 9 et 10) n'a pas d'action associée **[code]** : `LieuxInclusionVitrine.tsx:32`.

---

## 2. Synthèse

**Scan automatique [mesuré]**

axe ne trouve que 3 règles en violation sur les 19 pages :

| Règle axe                                                                                        | Pages  | Nœuds          |
| ------------------------------------------------------------------------------------------------ | ------ | -------------- |
| `skip-link` : le lien d'évitement « Menu utilisateur » vise une ancre `#menuUtilisateur` absente | toutes | 1 par page     |
| `role-img-alt` : icônes `role="img"` sans nom                                                    | 7 à 10 | 4 à 6 par page |
| `landmark-unique` : plusieurs régions « Map »                                                    | 6, 7   | 1              |

Aucune violation de contraste, mais 16 à 56 éléments par page relèvent de la vérification manuelle : texte posé sur une image de fond, non calculable automatiquement.

Ce faible nombre de violations ne doit pas rassurer. Les écarts les plus lourds sortent du champ d'axe.

**Écarts les plus lourds**

1. **La déclaration d'accessibilité ne porte pas sur le site vitrine.**
   - Elle déclare « Mon Inclusion Numérique (`https://mon.inclusion-numerique.anct.gouv.fr/`) » **[mesuré]**.
   - Elle ne donne ni taux, ni échantillon, ni environnement de test.
   - Ses trois liens « Schéma pluriannuel », « Plan 2025 » et « Bilan 2024 » pointent vers la même adresse **[code]**.
2. **La carte de l'indice de fragilité numérique** (synthèse) **transmet l'information par la seule couleur.**
   - Elle a 7 classes, et la légende n'en nomme que 2 : « Risque faible » et « Risque fort ».
   - Elle n'a ni alternative textuelle ni tableau.
   - Les classes voisines contrastent entre elles de 1,16:1 à 1,9:1 **[mesuré]**.
3. **Contenu rogné à 320 px et avec l'espacement du texte.**
   - Médiateurs : les nombres et pourcentages des thématiques sont coupés au bord droit à 320 px.
   - Gouvernance : la 2ᵉ carte chiffrée et la colonne « Rôle » du tableau sont rognées avec l'espacement 10.12 **[mesuré]**.
4. **Infobulles « i » accessibles à la souris seulement.**
   - Les icônes de la synthèse et des lieux d'inclusion sont des `span role="img"` sans nom ni `tabindex`.
   - L'infobulle s'affiche au survol uniquement **[mesuré]**.
5. **Liens du logo.**
   - Le logo du pied de page pointe vers `/tableau-de-bord`, qui renvoie 404 sur le domaine vitrine **[mesuré]**.
   - Les deux liens du logo ont un `title="Accueil"` qui ne reprend pas l'intitulé visible.
   - Le lien « Accéder à la plateforme » de l'accueil pointe vers `#`.
6. **Images décoratives avec un `alt` non vide.**
   - 13 sur l'accueil, une quinzaine sur Lieux, plus Dispositifs, Outils numériques et les pages de données **[mesuré]** pour la valeur, **[estimé]** pour le caractère décoratif.
7. **Un seul système de navigation** : menu principal, sans plan du site ni recherche (12.1).

**Points positifs mesurés**

- `lang="fr"`.
- Titre de page unique et pertinent sur chaque page.
- Un seul `h1` par page, sans saut de niveau de titre.
- `header`, `nav`, `main` et `footer` présents partout.
- Aucun identifiant dupliqué.
- Focus visible partout : contour DSFR de 2 px `#0a76f6`, y compris sur les liens « bloc ».
- Aucun défilement horizontal de page de 320 à 1920 px, ni au zoom 200 %.
- Menu mobile et tiroir des actions conformes au motif modal : focus envoyé dans la fenêtre et piégé, Échap ferme, focus rendu au déclencheur.
- Tableaux de la politique de confidentialité et de la gouvernance avec `caption` et `th scope="col"`.

---

## 3. Critères RGAA : statut estimé, constat, correction

Pages : numéros de l'échantillon (§ 1.1). « Toutes » = les 19 pages.

### Thème 1 : Images

| Critère                                                                             | Statut | Pages     | Constat                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Correction proposée                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 Chaque image porteuse d'information a-t-elle une alternative textuelle ?        | **NC** | 7–12      | **[mesuré]** Icônes d'information `span.fr-icon-information-line role="img"` sans nom : 6 par page en synthèse, 4 en lieux d'inclusion (composant `Information`). Graphique « Accompagnements des 6 derniers mois » : `canvas role="img"` sans nom (pages 7, 8). Graphiques des médiateurs : SVG `role="application"` sans nom (4 par page, pages 11, 12).                                                                                                           | Faire de l'icône un `<button>` nommé (« Plus d'information sur l'indice de fragilité numérique »), sur le modèle des infobulles de la page médiateurs, qui sont conformes. Donner un nom aux graphiques (`aria-label` ou `aria-labelledby` vers le titre). |
| 1.2 Chaque image de décoration est-elle ignorée par les technologies d'assistance ? | **NC** | 1–6, 7–10 | **[mesuré]** Valeurs relevées : accueil, 13 illustrations et pictogrammes (« Inégalités numériques », « Icône Territorialiser », « Accompagner acteurs »…) ; Lieux, 16 (« Icône Orientation », « Icône exemples »…) ; Dispositifs, 4 ; Outils, 5 icônes « Icône … » qui doublent le titre ; synthèse, « Aperçu cartographie » ; données territoriales, « Carte de France miniature ». **[estimé]** Ces images n'apportent pas d'information au-delà du texte voisin. | `alt=""` + `aria-hidden="true"` sur ces images. Corriger aussi `ToolCard`, qui génère `alt="Icône {titre}"` pour tous les outils.                                                                                                                          |
| 1.3 Alternative pertinente ?                                                        | **AV** | 1, 4, 6   | **[mesuré]** Logos des partenaires correctement nommés. La carte « La cartographie des lieux d'inclusion » (Outils) réutilise l'icône de MIN avec l'alt « Icône La cartographie… » : l'image ne correspond pas à son alternative. Lien « Télécharger le graphique » : nom calculé « Télécharger le graphiqueLieux d'inclusion numérique », sans espace.                                                                                                              | Vérification humaine des alternatives qui restent après le 1.2 ; corriger l'espace manquant.                                                                                                                                                               |
| 1.4, 1.5 (captcha, image-test)                                                      | NA     | —         | Aucun captcha.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                                                                                                                                                                                                                                          |
| 1.6, 1.7 Image complexe : description détaillée pertinente ?                        | **NC** | 6–12      | **[mesuré]** Carte choroplèthe de l'indice de fragilité (7 classes, valeur visible au survol seulement). Graphique en barres sur 6 mois (aucune valeur affichée). Graphiques des médiateurs : évolution des accompagnements par mois ou par jour (pas de tableau). Rien ne décrit ces images.                                                                                                                                                                        | Proposer un tableau de données équivalent, au moins pour la carte (département → indice) et l'histogramme (mois → nombre). Il peut être replié dans un `<details>` ou une modale, ou placé juste sous le graphique.                                        |
| 1.8 Image texte remplaçable par du texte stylé                                      | **AV** | 1, 2      | **[estimé]** Certaines illustrations (`carte-france-logos.png`, `illustration-visuel-bleu.png`) semblent contenir des logos ou du texte.                                                                                                                                                                                                                                                                                                                             | Contrôle visuel de chaque illustration.                                                                                                                                                                                                                    |
| 1.9 Légende d'image                                                                 | NA     | —         | Aucun `figure`/`figcaption`.                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                                                                                                                                          |

### Thème 2 : Cadres

| Critère  | Statut | Constat                                        |
| -------- | ------ | ---------------------------------------------- |
| 2.1, 2.2 | NA     | Aucun `iframe` sur l'échantillon **[mesuré]**. |

### Thème 3 : Couleurs

| Critère                                                      | Statut | Pages  | Constat                                                                                                                                                                                                                                                                                                                                                                            | Correction proposée                                                                                                                                                 |
| ------------------------------------------------------------ | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 L'information n'est pas donnée uniquement par la couleur | **NC** | 6–8    | **[mesuré]** Sur la carte de l'indice de fragilité, la classe d'un département n'est donnée que par sa couleur. La légende est un dégradé avec deux libellés. **[code]** Dans l'histogramme, le mois en cours se distingue des autres par la couleur seule (`#6A6AF4` contre `#CACAFB`).                                                                                           | Légende avec la valeur ou la tranche de chaque classe ; tableau de données (voir 1.6) ; valeur de chaque barre affichée en texte.                                   |
| 3.2 Contraste du texte                                       | **AV** | Toutes | **[mesuré]** Aucune violation calculable par axe. 16 à 56 éléments par page sont sur une image de fond : textes des en-têtes « hero », bloc d'intégration de `/lieux` (texte `#3a3a3a` sur `background-integration.png`). **[mesuré]** Couleurs codées en dur : `#666` sur blanc = 5,74:1 ; `#000091` sur `#f5f5fe` = 13,75:1 ; `#000091` sur `#e3e3fd` = 11,83:1. Toutes ≥ 4,5:1. | Pipette sur les textes posés sur une image, à toutes les largeurs : le guide de conformité montre qu'un chevauchement n'apparaît parfois qu'entre deux breakpoints. |
| 3.3 Contraste des composants et éléments graphiques (≥ 3:1)  | **NC** | 6–12   | **[mesuré]** Barres de l'histogramme `#CACAFB` sur `#f5f5fe` : 1,45:1. Classes de la carte de fragilité contre le fond (opacité 1) : 1,21:1 à 4,84:1 ; à l'opacité 0,7 utilisée sur la carte : 1,14:1 à 2,8:1. Pastille `#fbb8f6` sur blanc : 1,58:1. Pastille `#00a95f` sur blanc : 3,07:1 (limite). **[code]** Grille de graphique `#ddd` sur blanc : 1,36:1.                    | Foncer les teintes porteuses d'information, ou doubler l'information par un texte (valeurs, motifs) pour la sortir du champ du critère.                             |

### Thème 4 : Multimédia

| Critère    | Statut | Constat                                 |
| ---------- | ------ | --------------------------------------- |
| 4.1 à 4.13 | NA     | Aucune vidéo ni aucun son **[mesuré]**. |

### Thème 5 : Tableaux

| Critère                                             | Statut | Pages  | Constat                                                                                                                                                                                                                                                                                            | Correction proposée                                                                                          |
| --------------------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 5.4 Titre de tableau de données ; 5.6, 5.7 en-têtes | **C**  | 13, 18 | **[mesuré]** Tableau des membres : `caption` « Membres » (masqué visuellement) et 4 `th scope="col"`. Politique de confidentialité : 2 tableaux avec `caption` et `th scope="col"`.                                                                                                                | —                                                                                                            |
| 5.1, 5.2, 5.3, 5.5, 5.8                             | **AV** | 11–13  | **[code]** En mobile, le tableau des membres passe en `display: block` et masque les colonnes Type et Rôle : sémantique et information perdues. Les listes « libellé / nombre / % » des médiateurs (`ProgressItemList`, `QuantifiedShareLegend`) sont des données tabulaires construites en `div`. | Conserver la sémantique de tableau en mobile. Rendre les listes chiffrées en `table` ou en liste structurée. |

### Thème 6 : Liens

| Critère                              | Statut | Pages                      | Constat                                      | Correction proposée             |
| ------------------------------------ | ------ | -------------------------- | -------------------------------------------- | ------------------------------- |
| 6.1 Chaque lien est-il explicite ?   | **NC** | Toutes ; 1–5, 7–10, 14, 15 | **[mesuré]** Voir le détail sous le tableau. | Voir le détail sous le tableau. |
| 6.2 Chaque lien a-t-il un intitulé ? | **C**  | Toutes                     | **[mesuré]** Aucun lien vide.                | —                               |

**Détail du critère 6.1**

Constats **[mesuré]** :

- **Logos.**
  - Lien du nom de service de l'en-tête : intitulé « Inclusion Numérique », `title="Accueil"`.
  - Lien du logo du pied de page : intitulé « République Française », `title="Accueil"`, cible `/tableau-de-bord`, qui renvoie **404** sur le domaine vitrine.
  - Dans les deux cas, le `title` ne reprend pas l'intitulé visible.
- **Lien vide de sens** : « Accéder à la plateforme » → `href="#"` (accueil).
- **Intitulés génériques.** Le contexte (titre de la carte voisine) rend la plupart conformes au sens strict. L'auditeur du site Conseiller numérique les a pourtant relevés.
  - « En savoir plus » : 5 sur Outils numériques, 2 sur Dispositifs, 1 sur la page MIN.
  - « Voir la ressource » : 3, sur Lieux.
  - « Voir la cartographie » et « La cartographie ».
  - « Ouvrir le pdf ».
- **URL brute** comme intitulé dans la déclaration, avec un `title` « Mon Inclusion Numérique - nouvelle fenêtre » qui ne reprend pas l'URL.

Corrections proposées :

- **Logos.** `aria-label="Retour à l'accueil Inclusion Numérique"` sur le `<a>`, sans `title`. `alt=""` sur les images du logo et `aria-hidden="true"` sur le texte du logo. Le pied de page doit pointer vers `/`.
- **Lien « Accéder à la plateforme »** : vers l'adresse de MIN, ou suppression.
- **Intitulés génériques.** Un texte visible explicite (« Découvrir La Coop de la médiation numérique », « Ouvrir la feuille de route de la Métropole de Lyon (PDF) »). À défaut, un complément en `fr-sr-only`.

### Thème 7 : Scripts

| Critère                                                       | Statut | Pages | Constat                                                                                                                                                                                             | Correction proposée                                                                                                                                |
| ------------------------------------------------------------- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Composants compatibles avec les technologies d'assistance | **NC** | 6–12  | **[mesuré]** Voir le détail sous le tableau.                                                                                                                                                        | Voir le détail sous le tableau.                                                                                                                    |
| 7.2 Alternative de script pertinente                          | **AV** | 6–12  | **[estimé]** La recherche de territoire est l'alternative au clic sur la carte. Elle convient pour l'accueil des données. Elle ne remplace pas la lecture de la carte.                              | —                                                                                                                                                  |
| 7.3 Composants contrôlables au clavier                        | **NC** | 7–12  | **[mesuré]** Voir le détail sous le tableau.                                                                                                                                                        | Voir le détail sous le tableau.                                                                                                                    |
| 7.4 Changement de contexte annoncé                            | **AV** | 6–14  | **[code]** Choisir un territoire dans la recherche déclenche une navigation immédiate (`router.push` dans `onSelectionner`).                                                                        | Avis de l'auditeur. Si demandé, ajouter un bouton de validation explicite ou un texte d'aide (« La page du territoire s'ouvrira à la sélection »). |
| 7.5 Messages de statut                                        | **NC** | 6–14  | **[code]** Le message d'erreur de la recherche n'est pas annoncé. La fin du rechargement des statistiques après un changement de période n'est pas annoncée. Seul le spinner porte `role="status"`. | `role="status"` sur le résultat du rechargement (« Statistiques mises à jour pour la période du … au … ») et sur le message d'erreur.              |

**Détail du critère 7.1**

Constats **[mesuré]** :

- **Cartes MapLibre.** Les 6 canvas (carte principale + 5 encarts d'outre-mer) sont des régions focalisables nommées « Map ». Les boutons de zoom s'appellent « Zoom in » et « Zoom out ».
- **Graphiques recharts** : `role="application"` sans nom.
- **Sélecteur de période** : le bouton « Période » a `aria-expanded`, mais pas d'`aria-controls`, et le panneau n'a pas de rôle (`SelecteurRangeDates`).
- **Recherche de territoire** : le composant de liste déroulante produit ses annonces en anglais **[code]**.

Corrections proposées :

- **Cartes.** Rendre les cartes non focalisables et `aria-hidden` quand leur contenu est restitué ailleurs (tableau, recherche). Sinon : nom français explicite, et localisation des contrôles (option `locale` de MapLibre).
- **Graphiques** : `aria-hidden` sur le SVG, avec un tableau de données à côté.
- **Sélecteur de période** : motif « disclosure » ou dialogue (`role="dialog"`, `aria-controls`, focus envoyé dans le panneau).
- **Recherche de territoire** : traduire les messages d'annonce (`ariaLiveMessages`, `screenReaderStatus`).

**Détail du critère 7.3**

Constats **[mesuré]** :

- **Infobulles « i »** (synthèse, lieux d'inclusion) : non focalisables, affichées au survol seulement.
- **Sélecteur de période.**
  - Échap ne ferme pas le panneau : il reste ouvert, `aria-expanded="true"`, le focus reste dans le calendrier.
  - Chaque jour du calendrier est un arrêt de tabulation : environ 30 arrêts. Il n'y a pas de navigation aux flèches, alors que le conteneur porte `role="grid"`.
  - La fermeture par clic extérieur n'existe qu'à la souris.
- **Carte de l'accueil des données** : le clic sur un département ou un encart est réservé à la souris **[code]**.
- **Sous-menu « Études et enquêtes »** : Échap pressé depuis l'intérieur rend le focus au bouton, mais laisse le menu ouvert.

Corrections proposées :

- **Infobulles** : bouton déclencheur (motif DSFR « tooltip » sur bouton).
- **Sélecteur de période** : fermeture par Échap avec retour du focus sur « Période » ; navigation aux flèches dans la grille (un seul jour dans l'ordre de tabulation).

### Thème 8 : Éléments obligatoires

| Critère                                                     | Statut | Pages          | Constat                                                                                                                                                                                                                                                                                                                                                                 | Correction proposée                                                                                           |
| ----------------------------------------------------------- | ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 8.1 Type de document                                        | C      | Toutes         | **[mesuré]** `<!DOCTYPE html>`.                                                                                                                                                                                                                                                                                                                                         | —                                                                                                             |
| 8.2 Code valide                                             | **AV** | 7–18           | **[mesuré]** Aucun identifiant dupliqué. `aria-labelledby` pointe vers des identifiants absents : `donnees-territoriales-menu` (menu latéral), `sources-donnees`, `declaration-accessibilite-title` et les titres des pages légales (`PageTitle` ne pose pas d'`id`). **[code]** Les identifiants `breadcrumb-1`, `table-sm` et `table-sm-component` sont codés en dur. | Poser les `id` référencés ; passer le code au validateur W3C.                                                 |
| 8.3, 8.4 Langue par défaut                                  | C      | Toutes         | **[mesuré]** `<html lang="fr">`.                                                                                                                                                                                                                                                                                                                                        | —                                                                                                             |
| 8.5, 8.6 Titre de page présent et pertinent                 | C      | Toutes         | **[mesuré]** Titres uniques, par exemple « Gouvernance - Rhône (69) - Inclusion Numérique ». Seule la page 404 n'a que « Page non trouvée », sans le nom du site.                                                                                                                                                                                                       | Ajouter « - Inclusion Numérique » au titre de la 404.                                                         |
| 8.7 Changements de langue                                   | **NC** | 6–14           | **[mesuré]** Textes anglais restitués sans `lang="en"` : régions « Map », boutons « Zoom in » / « Zoom out ». **[code]** Annonces de la liste déroulante de recherche.                                                                                                                                                                                                  | Traduire ces textes (solution préférable à `lang="en"`).                                                      |
| 8.8                                                         | NA     | —              | Aucun changement de langue balisé.                                                                                                                                                                                                                                                                                                                                      | —                                                                                                             |
| 8.9 Balises utilisées uniquement à des fins de présentation | **NC** | 1, 2, 7–14, 18 | **[code]** Voir le détail sous le tableau.                                                                                                                                                                                                                                                                                                                              | `<ul>`/`<li>` pour les suites d'éléments, `<p>` pour les paragraphes, `<dl>` pour les couples libellé/valeur. |
| 8.10 Sens de lecture                                        | NA     | —              | —                                                                                                                                                                                                                                                                                                                                                                       | —                                                                                                             |

**Détail du critère 8.9 [code]**

- **Listes en `div`**, sans `ul`/`li` :
  - Lieux : exemples d'intégration, avantages, ressources ;
  - logos des partenaires ;
  - cartes chiffrées de la synthèse, de la gouvernance et des médiateurs.
- **Notes de bas de page** séparées par `<br>` dans un seul `<p>` (accueil).
- **Politique de confidentialité** : puces « - » tapées dans des `li`, `<br>` de mise en page.
- **Feuille de route** : couples libellé/valeur en `div` (« Porteur de l'action », « Budget total »).
- **Bug de contenu** : `action.description` est affichée deux fois, sous « Contexte » et sous « Description ».

### Thème 9 : Structuration

| Critère                                   | Statut | Pages      | Constat                                                                                                                                                                         | Correction proposée                                                   |
| ----------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 9.1 Information structurée par des titres | **NC** | 7–14       | **[mesuré]** Un seul `h1` partout, sans saut de niveau. Les problèmes sont listés sous le tableau.                                                                              | Voir le détail sous le tableau.                                       |
| 9.2 Structure du document cohérente       | **AV** | 7–14       | **[mesuré]** Le menu latéral des données est un `nav` sans nom (`aria-labelledby` cassé), placé dans un `aside`.                                                                | Nommer le `nav` : `aria-label="Rubriques des données territoriales"`. |
| 9.3 Listes correctement structurées       | **NC** | 1, 2, 7–15 | **[code]** Listes en `div` (voir 8.9). Le bloc contact de la déclaration est fait de deux `<p>` dans un `div` : le guide de conformité indique que l'auditeur attend une liste. | `<ul>` pour le bloc contact et pour les suites d'éléments.            |
| 9.4 Citations                             | NA     | —          | —                                                                                                                                                                               | —                                                                     |

**Détail du critère 9.1 [mesuré]**

- **Faux titre** : « Voir tous les lieux sur la cartographie » est un `span.fr-h2` sur les lieux d'inclusion, alors que le même bloc est un `h2` sur la synthèse.
- **Titres de graphique en `div`**, alors qu'ils introduisent un bloc : « Indice de Fragilité numérique », « Lieux en territoires prioritaires » **[code]**.
- **Gouvernance** : le `h2` « Gouvernances » apparaît deux fois de suite.
- **Feuille de route** :
  - le titre du document PDF est un `h2` imbriqué dans la feuille de route : il devrait être un `h3` ;
  - il manque un `h2` de rubrique.
- **`h1` des rubriques.** Les 5 rubriques ont le même `h1` : « Données de l'inclusion numérique » puis un `<br>` et le territoire. Le nom de la rubrique n'y figure pas, et le nom calculé colle les deux parties (« numériqueFrance »).

Corrections proposées :

- **Faux titres** : vrais titres de niveau adapté, ou fusion en un seul titre mis en forme en CSS (méthode du guide de conformité).
- **`h1` des rubriques** : y faire figurer la rubrique, sur le modèle du `<title>` (« Gouvernance – Rhône (69) »).

### Thème 10 : Présentation de l'information

| Critère                                                            | Statut | Pages         | Constat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Correction proposée                                                                                                                                   |
| ------------------------------------------------------------------ | ------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10.1, 10.2, 10.3 CSS, contenu sans CSS, ordre de lecture           | **AV** | Toutes        | Non testé (CSS désactivé). **[code]** Nombreux styles en ligne, mais pas d'attribut de présentation HTML.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Test avec le CSS désactivé.                                                                                                                           |
| 10.4 Texte lisible à 200 %                                         | **NC** | 13            | **[mesuré]** Pas de défilement horizontal au zoom 200 %. Les noms de membres de la gouvernance sont tronqués par des points de suspension (largeur maximale 300 px, sans `title`) : « CENTRE REGIONAL INFORMATION JEUNESSE AUVERGNE RHONE ALPES » perd la moitié de son texte.                                                                                                                                                                                                                                                                                                                                  | Retirer `nowrap` et l'ellipse, laisser le texte passer à la ligne.                                                                                    |
| 10.5 Couleurs de fond et de police déclarées ensemble              | **AV** | —             | **[code]** Couleurs codées en dur (`#000091`, `#666`, `#161616`…) hors jetons DSFR, donc non adaptées au thème sombre.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Utiliser les variables DSFR.                                                                                                                          |
| 10.6 Liens distinguables du texte                                  | C      | Toutes        | **[mesuré]** Liens soulignés (DSFR).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                                                                                                     |
| 10.7 Focus visible                                                 | **C**  | Toutes        | **[mesuré]** Contour 2 px `#0a76f6` sur chaque arrêt de tabulation. Sur les liens « bloc » (`fr-enlarge-link`), il est porté par le pseudo-élément : vérifié par capture. Le champ de recherche a un contour de 2 px.                                                                                                                                                                                                                                                                                                                                                                                           | —                                                                                                                                                     |
| 10.8 Contenus cachés                                               | C      | Toutes        | **[mesuré]** Sur mobile, la carte est en `visibility: hidden` et sort de l'ordre de tabulation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                     |
| 10.9, 10.10 Information pas uniquement par la forme ou la position | **AV** | 7–14          | **[mesuré]** Aucun état courant dans le menu latéral ni dans le menu principal des pages de données : pas d'`aria-current`, pas de bordure. **[code]** La comparaison de chemin attend le préfixe `/vitrine`, que la réécriture d'URL retire. Même défaut sur le menu principal hors accueil (`/lieux`, `/dispositifs`…).                                                                                                                                                                                                                                                                                       | Comparer le chemin sans le préfixe. Bordure de l'élément actif d'au moins 4 px en mobile (point du guide de conformité).                              |
| 10.11 Pas de défilement en deux dimensions à 320 px                | **NC** | 11, 12        | **[mesuré]** Le contenu de `main` fait 676 px de large pour 320 px de viewport, rogné par `overflow: hidden`. Le titre « Thématiques des accompagnements de médiation numérique » (`nowrap`, 478 px) et les colonnes nombre / % des thématiques sont coupés au bord droit : seuls « 1 », « 10 »… restent visibles.                                                                                                                                                                                                                                                                                              | Retirer `fr-text--nowrap` et `oneLineLabel` (`StatistiquesActivites`, `ProgressItemList`, `QuantifiedShareLegend`). Grille qui se replie sous 576 px. |
| 10.12 Espacement du texte                                          | **NC** | 9, 10, 13, 14 | **[mesuré]** Avec l'interligne 1,5, l'espacement des lettres 0,12 em et des mots 0,16 em : sur la gouvernance (1280 px), `main` fait 1584 px pour 1280 px, la 2ᵉ carte chiffrée et le badge « Co-porteur » sont rognés ; sur la feuille de route, le contenu déborde de 63 px et le titre du PDF est tronqué ; sur les lieux d'inclusion, 4 libellés de légende sont tronqués (« En zone France Ruralités Revitalisation (FRR) »). **[code]** Hauteurs fixes sur des conteneurs de texte : `SectionCartographie` (256 px + `overflow: hidden`), `LieuxInclusionVitrine` (20 rem), hero de la page MIN (720 px). | `min-height` au lieu de `height`. Suppression des ellipses sur les libellés. Grilles qui se replient.                                                 |
| 10.13 Contenus additionnels au survol ou au focus                  | **NC** | 7–10          | **[mesuré]** Les infobulles des icônes « i » n'apparaissent qu'au survol de la souris, sur un élément non focalisable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Voir 7.3.                                                                                                                                             |
| 10.14 Contenus additionnels CSS                                    | C      | —             | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                                                                                                                                                     |

### Thème 11 : Formulaires

L'échantillon ne contient pas de formulaire de saisie. Les champs présents sont la recherche de territoire, les contrôles segmentés et le sélecteur de période des médiateurs.

| Critère                                     | Statut | Pages  | Constat                                                                                                                                                                                                                                          | Correction proposée                                                                          |
| ------------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 11.1, 11.2 Étiquettes                       | **C**  | 6–14   | **[mesuré]** « Rechercher un territoire » est associé par `for`/`id`. Les boutons radio segmentés ont leur `label`. Le texte d'exemple (« Région, département, intercommunalité, … ») est tronqué à 320 px, mais il ne remplace pas l'étiquette. | —                                                                                            |
| 11.5, 11.6 Groupes et légendes              | **C**  | 11, 12 | **[mesuré]** `fieldset`/`legend` sur les contrôles segmentés. Coquille dans la légende : « Bascule entre entre les périodes ».                                                                                                                   | Corriger la coquille.                                                                        |
| 11.9 Intitulé des boutons                   | **C**  | 6–14   | **[mesuré]** Tous les boutons ont un nom : « Effacer la recherche », « Plus d'information à propos des … ».                                                                                                                                      | Corriger l'espace manquant de « Télécharger le graphique… » (1.3).                           |
| 11.10 Contrôle de saisie                    | **NC** | 6–14   | **[code]** Le message d'erreur de la recherche (`fr-error-text`) n'est relié par aucun `aria-describedby`, et le champ n'a pas d'`aria-invalid`.                                                                                                 | Identifiant unique sur le message, `aria-describedby` et `aria-invalid="true"` sur le champ. |
| 11.3, 11.4, 11.7, 11.8, 11.11, 11.12, 11.13 | NA     | —      | Aucune saisie de données personnelles, aucune liste de choix groupée. Le champ de recherche a `autocomplete="off"`, ce qui est légitime ici.                                                                                                     | —                                                                                            |

### Thème 12 : Navigation

| Critère                                   | Statut | Pages  | Constat                                                                                                                                                                                                                                                                    | Correction proposée                                                                                                                                                                                  |
| ----------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 Au moins deux systèmes de navigation | **NC** | Toutes | **[mesuré]** Menu principal seulement : pas de plan du site, pas de moteur de recherche du site. La recherche de territoire ne couvre que les données.                                                                                                                     | Créer une page « Plan du site » liée depuis le pied de page.                                                                                                                                         |
| 12.2 Menu et navigation à la même place   | C      | Toutes | **[mesuré]** En-tête, menu et pied de page identiques sur l'échantillon.                                                                                                                                                                                                   | —                                                                                                                                                                                                    |
| 12.3, 12.4 Plan du site                   | NA     | —      | Pas de plan du site (voir 12.1).                                                                                                                                                                                                                                           | —                                                                                                                                                                                                    |
| 12.5 Moteur de recherche                  | NA     | —      | —                                                                                                                                                                                                                                                                          | —                                                                                                                                                                                                    |
| 12.6 Zones de regroupement                | **NC** | 6–18   | **[mesuré]** Les canvas de carte sont des régions (`role="region"`) qui portent toutes le même nom, « Map » (axe `landmark-unique`). Le `nav` latéral n'a pas de nom. Des sections (`sources-donnees`) et les articles des pages légales référencent des titres sans `id`. | Supprimer le rôle « région » des canvas (voir 7.1). Nommer le `nav`. Réparer les `aria-labelledby`.                                                                                                  |
| 12.7 Lien d'évitement                     | **NC** | Toutes | **[mesuré]** « Contenu » est bien le premier arrêt et vise `#content`, qui existe. Le 2ᵉ lien, « Menu utilisateur », vise `#menuUtilisateur`, qui n'existe pas sur la vitrine (axe `skip-link`, 19/19 pages).                                                              | Remplacer par « Menu » → `#navigation` (ou l'`id` du menu principal), ou supprimer le lien. Les liens d'évitement viennent d'un composant partagé avec l'application : prévoir une variante vitrine. |
| 12.8 Ordre de tabulation cohérent         | **AV** | 6–12   | **[mesuré]** Ordre logique. Arrêts sans fonction : 6 canvas « Map » sur l'accueil des données et la synthèse nationale, environ 30 jours de calendrier dans le sélecteur de période.                                                                                       | Voir 7.1 et 7.3.                                                                                                                                                                                     |
| 12.9 Pas de piège au clavier              | **C**  | Toutes | **[mesuré]** Menu mobile, tiroir des actions, sélecteur de période : il est toujours possible d'en sortir.                                                                                                                                                                 | —                                                                                                                                                                                                    |
| 12.10, 12.11                              | C / NA | —      | Pas de raccourci clavier. Contenus additionnels : voir 10.13.                                                                                                                                                                                                              | —                                                                                                                                                                                                    |

### Thème 13 : Consultation

| Critère                                                            | Statut                | Pages  | Constat                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Correction proposée                                                                                                                                                                                                                |
| ------------------------------------------------------------------ | --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13.1 Limite de temps                                               | NA                    | —      | Pas de session sur la vitrine.                                                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                                                                                                                                                                                  |
| 13.2 Ouverture de nouvelle fenêtre à l'initiative de l'utilisateur | **C** (avec remarque) | Toutes | **[mesuré]** Aucune ouverture automatique. Mais plusieurs liens `target="_blank"` ne signalent pas la nouvelle fenêtre : menu « Études » et « Labo Société Numérique », « Programme Société Numérique », « France Numérique Ensemble », « En savoir plus » des outils et dispositifs, « Voir la cartographie », « La cartographie », « Se connecter ». **[code]** `ToolCard` ouvre même un lien interne (`/outils-numeriques/min`) dans un nouvel onglet. | Signaler la nouvelle fenêtre dans l'intitulé ou le `title` (« … - nouvelle fenêtre »), comme le fait déjà le composant `ExternalLink`. Ouvrir les liens internes dans le même onglet. Obligation DSFR, attendue par les auditeurs. |
| 13.3 Document bureautique : version accessible                     | **AV**                | 14     | PDF des feuilles de route : non évalué (non servi en local). Contenu déposé par les territoires, accessibilité inconnue. La page donne déjà un résumé des actions en HTML.                                                                                                                                                                                                                                                                                | Vérifier les PDF en recette. Ajouter poids et langue au lien. Clarifier ce qui relève de l'éditeur et ce qui relève du territoire déposant ; les contenus tiers peuvent figurer en dérogation dans la déclaration.                 |
| 13.4 Version accessible équivalente                                | AV                    | 14     | —                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                                                                                                                  |
| 13.5, 13.6 Contenu cryptique                                       | NA                    | —      | —                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                                                                                                                  |
| 13.7 Flashs                                                        | C                     | —      | Aucun.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                                                                                                                  |
| 13.8 Contenus en mouvement                                         | **AV**                | 7–12   | **[code]** Animations courtes des graphiques et barres de progression, rotation du spinner, sans prise en compte de `prefers-reduced-motion`. Les animations de moins de 5 secondes sont admises.                                                                                                                                                                                                                                                         | Désactiver les animations sous `prefers-reduced-motion: reduce`.                                                                                                                                                                   |
| 13.9 Orientation                                                   | C                     | —      | **[mesuré]** Rendu correct de 320 à 1920 px.                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                                                                                                                                                                                  |
| 13.10 à 13.12                                                      | NA                    | —      | Pas de geste complexe, pas de mouvement de l'appareil.                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                                                                                                                  |

### Hors critère, mais à corriger avant l'audit

- **Page 404, menu mobile inopérant [mesuré].** À 375 px, le bouton « Menu » n'ouvre rien : le script DSFR n'est pas chargé sur la page d'erreur (`src/app/not-found.tsx`). Sur mobile, la navigation y est inutilisable.
- **En-tête sans bloc Marque [mesuré].** L'en-tête n'a pas de Marianne (« République Française ») : il affiche un pictogramme SVG maison. Le bloc Marque est obligatoire dans la charte de l'État et présent dans le pied de page. C'est une obligation DSFR, pas RGAA.
- **Incohérences de contenu des pages légales [code].**
  - Mentions légales et CGU décrivent la plateforme authentifiée Mon Inclusion Numérique, pas le site vitrine.
  - Le directeur de publication diffère entre mentions légales et politique de confidentialité, de même que l'hébergeur.

---

## 4. Obligations légales : déclaration et pied de page

Confrontation avec la checklist « Obligations légales » du guide de conformité.

| Exigence                                                                      | État                              | Constat                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mention de pied de page reflétant la réalité                                  | **Conforme sur le fond, fragile** | « Accessibilité : non conforme » **[mesuré]**, cohérent avec l'absence d'audit. La mention est codée en dur dans un pied de page partagé avec l'application connectée **[code]** : elle ne pourra pas évoluer séparément quand l'un des deux sites sera audité. |
| Déclaration complète au modèle officiel                                       | **Non conforme**                  | **[mesuré]** Voir le détail sous le tableau.                                                                                                                                                                                                                    |
| Contact de la déclaration en liste                                            | **Non conforme**                  | **[code]** Deux `<p>` dans un `div.fr-highlight`.                                                                                                                                                                                                               |
| Lien vers le schéma pluriannuel et les plans annuels, titres exacts et à jour | **Non conforme**                  | **[code]** Les liens « Schéma pluriannuel », « Plan 2025 » et « Bilan 2024 » pointent vers la même URL. Il n'y a pas de plan 2026.                                                                                                                              |
| Voies de recours                                                              | Conforme                          | **[code]** Liste de trois voies.                                                                                                                                                                                                                                |

**Détail : déclaration au modèle officiel [mesuré]**

- La déclaration porte sur « Mon Inclusion Numérique (`https://mon.inclusion-numerique.anct.gouv.fr/`) », pas sur le site vitrine.
- Elle est datée du 24 juillet 2026.
- Elle donne l'état « non conforme… Le site n'a encore pas été audité » :
  - sans taux de conformité ni taux moyen ;
  - sans nombre de critères ;
  - sans échantillon ;
  - sans environnement de test ni outils.
- Les « contenus non accessibles » listés concernent l'application connectée.
- Il n'y a pas de rubrique « dérogations » ni « contenus non soumis ».

**Proposition**

- Une déclaration propre au site vitrine (même composant, paramétré par site), avec l'échantillon du § 1.1.
- Une mention de pied de page paramétrée par site.
- Après l'audit, la mise à jour suit le § 3 du guide de conformité.

---

## 5. Points que seul un test au lecteur d'écran ou un auditeur pourra trancher

1. **Caractère décoratif des illustrations** (1.2) et **pertinence des alternatives conservées** (1.3) : logos des partenaires, captures d'écran des outils.
2. **Restitution des cartes et graphiques** une fois les corrections faites : le tableau de données est-il trouvé et compris ? Les SVG et canvas masqués le sont-ils vraiment ?
3. **Restitution de la recherche de territoire** avec NVDA et VoiceOver : nombre de résultats, sélection, navigation déclenchée. Avis de l'auditeur sur le critère 7.4.
4. **`h1` des rubriques** : la lecture « Données de l'inclusion numérique / France » est-elle jugée pertinente si le nom de la rubrique n'y figure pas ?
5. **Liens « En savoir plus »** dont le contexte est le titre de la carte : conformes au sens strict, mais l'auditeur peut demander un intitulé visible explicite.
6. **Contraste des textes posés sur des images de fond**, à toutes les largeurs (3.2).
7. **Lecture avec le CSS désactivé** (10.1 à 10.3).
8. **Accessibilité des PDF de feuilles de route** et traitement en dérogation des documents déposés par les territoires (13.3).
9. **Tableau des membres en mobile** : est-il encore restitué comme un tableau (5.x) ?
10. **Comportement réel sur mobile** (TalkBack, VoiceOver iOS) du menu, du tiroir et du sélecteur de période.

---

## 6. Proposition de tickets

Sévérité :

- **Bloquant** : empêche l'accès à une information ou une fonction, ou bloque une obligation légale.
- **Majeur** : non-conformité certaine sur plusieurs pages.
- **Mineur** : non-conformité ponctuelle ou probable.

Coût : **S** < 1 jour · **M** 1 à 3 jours · **L** > 3 jours.

Tickets triés par sévérité, puis par coût :

| #          | Titre                                                                                   | Critères                 | Sévérité    | Coût | Contenu                                                                                                                                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------ | ----------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (#2239)  | [Vitrine MIN] Déclaration d'accessibilité propre au site vitrine                        | Obligations légales, 9.3 | Bloquant    | S    | Déclaration paramétrée par site (périmètre, échantillon, environnement de test, dérogations). Contact en `<ul>`. Liens distincts et à jour vers le schéma pluriannuel, le plan annuel et le bilan. Mention de pied de page paramétrée.                                                                    |
| 2 (#2240)  | [Vitrine MIN] Liens du logo et liens morts                                              | 6.1                      | Bloquant    | S    | Logo du pied de page vers `/` (aujourd'hui 404). `aria-label="Retour à l'accueil Inclusion Numérique"` sur les deux logos, sans `title`. `alt=""` et `aria-hidden` sur le contenu du logo. « Accéder à la plateforme » : lien réel.                                                                       |
| 3 (#2241)  | [Vitrine MIN] Carte de l'indice de fragilité et histogramme : alternative et contrastes | 1.1, 1.6, 3.1, 3.3       | Bloquant    | L    | Tableau de données équivalent (département → indice ; mois → accompagnements). Légende avec les 7 classes. Teintes ≥ 3:1 ou information doublée en texte. Nom des graphiques.                                                                                                                             |
| 4 (#2242)  | [Vitrine MIN] Lien d'évitement « Menu utilisateur » cassé                               | 12.7                     | Majeur      | S    | Variante vitrine du composant `LienEvitement` : « Menu » → `id` du menu principal.                                                                                                                                                                                                                        |
| 5 (#2243)  | [Vitrine MIN] Infobulles « i » accessibles au clavier                                   | 1.1, 7.3, 10.13          | Majeur      | S    | Composant partagé `Information` : bouton nommé déclencheur de l'infobulle DSFR, comme sur la page médiateurs.                                                                                                                                                                                             |
| 6 (#2244)  | [Vitrine MIN] Images décoratives                                                        | 1.2, 1.3                 | Majeur      | S    | `alt=""` + `aria-hidden` sur les illustrations et pictogrammes de l'accueil, de Lieux, de Dispositifs et des données ; correction de `ToolCard` ; bonne icône pour la carte « cartographie ».                                                                                                             |
| 7 (#2245)  | [Vitrine MIN] Titres, faux titres et zones nommées                                      | 9.1, 9.2, 12.6, 8.2      | Majeur      | S    | Vrais titres pour « Voir tous les lieux… », « Indice de Fragilité numérique » et les titres de graphiques. Doublon « Gouvernances » supprimé. Hiérarchie de la feuille de route corrigée. Rubrique ajoutée au `h1`. `id` posés pour les `aria-labelledby` cassés. `nav` latéral nommé.                    |
| 8 (#2246)  | [Vitrine MIN] Reflow 320 px et espacement du texte sur les pages de données             | 10.4, 10.11, 10.12       | Majeur      | M    | Suppression des `nowrap` et des ellipses (statistiques des médiateurs, membres de la gouvernance, légendes des lieux, titre du PDF). `min-height` au lieu de `height` (`SectionCartographie`, `LieuxInclusionVitrine`, hero MIN). Grilles qui se replient. Vérification sur tout le balayage de largeurs. |
| 9 (#2247)  | [Vitrine MIN] Cartes MapLibre au clavier et en français                                 | 7.1, 8.7, 12.6, 12.8     | Majeur      | M    | Canvas non focalisables et masqués quand le contenu est restitué ailleurs. Sinon nom français unique par carte. Contrôles de zoom localisés.                                                                                                                                                              |
| 10 (#2248) | [Vitrine MIN] Sélecteur de période des médiateurs                                       | 7.1, 7.3, 12.8           | Majeur      | M    | Échap ferme le panneau et rend le focus. `aria-controls`. Rôle du panneau. Navigation aux flèches dans la grille du calendrier.                                                                                                                                                                           |
| 11 (#2249) | [Vitrine MIN] Recherche de territoire : annonces, erreur, changement de contexte        | 7.4, 7.5, 8.7, 11.10     | Majeur      | S    | Messages d'annonce en français. Erreur reliée (`aria-describedby`, `aria-invalid`). Avis de l'auditeur sur la navigation à la sélection.                                                                                                                                                                  |
| 12 (#2250) | [Vitrine MIN] Plan du site et état courant de la navigation                             | 12.1, 10.10              | Majeur      | M    | Page « Plan du site » liée depuis le pied de page. `aria-current` et style actif corrigés derrière la réécriture d'URL (menu principal et menu latéral).                                                                                                                                                  |
| 13 (#2251) | [Vitrine MIN] Graphiques des médiateurs : alternative et statut                         | 1.1, 1.6, 7.1, 7.5       | Majeur      | M    | SVG des graphiques masqués et tableau de données. Listes chiffrées en tableau. Annonce de la mise à jour après un changement de période.                                                                                                                                                                  |
| 14 (#2252) | [Vitrine MIN] Intitulés de liens et nouvelles fenêtres                                  | 6.1, 13.2                | Mineur      | S    | Intitulés visibles explicites (« En savoir plus », « Voir la ressource », « Ouvrir le pdf »). Mention « nouvelle fenêtre » sur tous les `target="_blank"`. Lien interne de `ToolCard` dans le même onglet. URL brute de la déclaration.                                                                   |
| 15 (#2253) | [Vitrine MIN] Listes et paragraphes sémantiques                                         | 8.9, 9.3                 | Mineur      | M    | `ul`/`li` pour les suites de cartes, de logos et de ressources. `dl` pour les détails d'action. Notes de bas de page en paragraphes. Suppression du doublon Contexte/Description.                                                                                                                         |
| 16 (#2254) | [Vitrine MIN] Page 404                                                                  | 8.6, 12.x                | Mineur      | S    | Charger le script DSFR (menu mobile inopérant aujourd'hui). Titre « Page non trouvée - Inclusion Numérique ».                                                                                                                                                                                             |
| 17 (#2255) | [Vitrine MIN] Documents PDF des feuilles de route                                       | 13.3                     | À qualifier | M    | Vérification des PDF en recette. Poids et langue sur le lien. Position éditoriale (dérogation pour contenus tiers, ou alternative HTML).                                                                                                                                                                  |
| 18 (#2256) | [Vitrine MIN] Garde-fous d'accessibilité en intégration continue                        | Préventif                | —           | M    | Voir § 7.                                                                                                                                                                                                                                                                                                 |

Ordre conseillé : 1, 2, 4, 5 et 6 d'abord. Ils coûtent peu et lèvent les écarts les plus visibles. Viennent ensuite 7, 8 et 3, puis le reste. Le ticket 18 se fait en parallèle, pour ne pas réintroduire les écarts corrigés : les deux écarts trouvés au contre-audit du site Conseiller numérique étaient des régressions.

---

## 7. Garde-fous anti-régression en intégration continue

### 7.1 État actuel [code]

- **ESLint `jsx-a11y`.**
  - Il est actif en configuration `recommended` sur `src/**`.
  - `label-has-associated-control` est désactivée.
  - `no-interactive-element-to-noninteractive-role`, `no-aria-hidden-on-focusable` et `lang` sont en erreur.
  - `src/components/coop/**` est exclu de tout lint, alors que ce code est rendu sur la page médiateurs.
  - Le lint tourne en CI, avec 0 avertissement toléré.
- **Storybook `addon-a11y`.**
  - Il est déclaré, mais en mode `test: 'todo'` : les violations ne font pas échouer.
  - Il y a 6 stories au total, aucune pour un composant vitrine.
  - `addon-vitest` est déclaré, mais `vitest.config.ts` ne contient qu'un projet jsdom, sans projet navigateur.
  - Storybook n'est lancé ni par `pnpm check` ni par la CI.
- **Playwright.** Il figure en dépendance de développement, mais le dépôt n'a ni configuration, ni test, ni job CI qui l'utilise.
- **Vitest (jsdom).** Il sert aux tests unitaires de composants, sans assertion d'accessibilité.

### 7.2 Propositions

Classées par rapport coût / bénéfice. Toute modification de configuration (ESLint, Vitest, Storybook) est à valider explicitement.

1. **Test d'accessibilité des pages de l'échantillon** (Playwright + `@axe-core/playwright`). C'est la protection la plus efficace.
   - **Où** : un job CI dédié. L'application est construite en mode vitrine, sur une base de test alimentée par un jeu de données minimal : un département avec membres, feuille de route et statistiques.
   - **Liste des pages** : un fichier unique, l'échantillon du § 1.1. Toute nouvelle page doit y être ajoutée.
   - **Ce que le test vérifie sur chaque page** :
     - aucune violation axe WCAG A et AA, ni des règles `skip-link`, `landmark-unique`, `region` ;
     - un seul `h1` et aucun saut de niveau de titre ;
     - `main`, `header` et `footer` présents, chaque `nav` nommé ;
     - pas de lien `target="_blank"` sans mention de nouvelle fenêtre ;
     - pas de lien `href="#"` ;
     - à 320 px, `main.scrollWidth <= 320` (le débordement des médiateurs est masqué par `overflow: hidden` et ne crée pas de défilement : il faut tester `main`, pas seulement le document) ;
     - avec l'espacement 10.12 injecté, aucun conteneur de texte dont le contenu dépasse.
   - **Coût** : M, principalement pour le jeu de données.
2. **ESLint `jsx-a11y`.**
   - Déclarer `next/link` comme ancre (`settings['jsx-a11y'].components: { Link: 'a' }`), pour que `anchor-is-valid` attrape les `href="#"`.
   - Évaluer le passage en `strict` sur `src/components/vitrine/**` et `src/app/vitrine/**`.
   - Lever l'exclusion de `src/components/coop/**` pour les seules règles `jsx-a11y`.
   - **Coût** : S.
3. **Storybook.**
   - Passer `a11y.test` à `'error'`.
   - Écrire des stories pour les composants partagés à risque : `EnTeteVitrine`, `PiedDePage`, `LienEvitement`, `Information`, `Legend`, `RechercheTerritoire`, `ProgressItemList`, `SelecteurRangeDates`.
   - Brancher le projet navigateur `addon-vitest`, pour que ces stories tournent dans `pnpm check`.
   - Ainsi, une correction faite au niveau d'un composant protège toutes ses utilisations.
   - **Coût** : M.
4. **Tests unitaires ciblés** (Vitest jsdom), pour les règles qui ne dépendent pas de la mise en page :
   - `Information` rend un `button` nommé ;
   - les liens du logo ont l'`aria-label` attendu et visent `/` ;
   - la cible des liens d'évitement existe dans le layout vitrine ;
   - `aria-current` est posé sur l'URL publique sans préfixe.

   Un test gardien par règle corrigée, pour ne pas la perdre lors d'une évolution. **Coût** : S par règle.

5. **Checklist de PR** : « nouvelle page vitrine ⇒ `<main>`, `h1` unique, fil d'Ariane, ajout à l'échantillon du test d'accessibilité ; nouveau lien externe ⇒ mention de nouvelle fenêtre ; nouvelle image ⇒ décorative ou alternative justifiée ». **Coût** : S.

---

## Annexe : mesures

**Violations axe par page**, règles WCAG A/AA + bonnes pratiques, à 1280 px :

| Page                          | `skip-link` | `role-img-alt` | `landmark-unique` | Éléments de contraste à vérifier |
| ----------------------------- | ----------- | -------------- | ----------------- | -------------------------------- |
| 1 Accueil                     | 1           | —              | —                 | 25                               |
| 2 Lieux                       | 1           | —              | —                 | 31                               |
| 3 Dispositifs                 | 1           | —              | —                 | 22                               |
| 4 Outils numériques           | 1           | —              | —                 | 25                               |
| 5 MIN                         | 1           | —              | —                 | 26                               |
| 6 Données territoriales       | 1           | —              | 1                 | 19                               |
| 7 Synthèse nationale          | 1           | 6              | 1                 | 24                               |
| 8 Synthèse Rhône              | 1           | 6              | —                 | 30                               |
| 9 Lieux d'inclusion nationale | 1           | 4              | —                 | 26                               |
| 10 Lieux d'inclusion Rhône    | 1           | 4              | —                 | 30                               |
| 11 Médiateurs national        | 1           | —              | —                 | 52                               |
| 12 Médiateurs Rhône           | 1           | —              | —                 | 56                               |
| 13 Gouvernance Rhône          | 1           | —              | —                 | 51                               |
| 14 Feuille de route Rhône     | 1           | —              | —                 | 28                               |
| 15 Accessibilité              | 1           | —              | —                 | 33                               |
| 16 Mentions légales           | 1           | —              | —                 | 18                               |
| 17 CGU                        | 1           | —              | —                 | 16                               |
| 18 Confidentialité            | 1           | —              | —                 | 33                               |
| 19 404                        | 1           | —              | —                 | 17                               |

**Contrastes calculés** (WCAG 2.x) :

| Couleur   | Fond      | Ratio   | Usage                             |
| --------- | --------- | ------- | --------------------------------- |
| `#666`    | `#fff`    | 5,74:1  | Notes de bas de page de l'accueil |
| `#000091` | `#fff`    | 14,91:1 | Texte mis en avant                |
| `#000091` | `#f5f5fe` | 13,75:1 | Titres sur fond bleu clair        |
| `#a558a0` | `#fff`    | 4,66:1  | Pastille des lieux d'inclusion    |
| `#009081` | `#fff`    | 3,96:1  | Pastille des lieux d'inclusion    |
| `#00a95f` | `#fff`    | 3,07:1  | Pastille des lieux d'inclusion    |
| `#fbb8f6` | `#fff`    | 1,58:1  | Pastille des lieux d'inclusion    |
| `#6A6AF4` | `#f5f5fe` | 3,89:1  | Barre du mois courant             |
| `#CACAFB` | `#f5f5fe` | 1,45:1  | Barres de l'histogramme           |
| `#ddd`    | `#fff`    | 1,36:1  | Grille de graphique               |

**Classes de la carte de fragilité** (`#4A6BAE` → `#D95C5E`), contre le fond `#f5f5fe` :

| Opacité | Contre le fond                                 | Entre classes voisines                 |
| ------- | ---------------------------------------------- | -------------------------------------- |
| 1       | 4,84 · 3,13 · 1,65 · 1,21 · 1,63 · 2,81 · 3,43 | 1,54 · 1,9 · 1,37 · 1,35 · 1,73 · 1,22 |
| 0,7     | 2,8 · 2,13 · 1,41 · 1,14 · 1,4 · 2,03 · 2,35   | —                                      |

**Parcours clavier.**

- Premier arrêt : le lien d'évitement « Contenu » sur toutes les pages.
- Focus visible sur 100 % des arrêts.
- Menu mobile : focus sur « Fermer » à l'ouverture, cycle fermé dans la fenêtre, Échap ferme et rend le focus à « Menu ».
- Tiroir d'action de la feuille de route : même comportement, conforme.
- Sélecteur de période : Échap sans effet.

**Balayage des largeurs** (320, 360, 414, 576, 640, 768, 992, 1024, 1100, 1248, 1280, 1366, 1440, 1600, 1920 px) :

- aucun défilement horizontal du document sur aucune page ;
- pas de chevauchement de texte détecté sur les pages éditoriales ;
- débordements masqués : médiateurs à 320 px, gouvernance et feuille de route avec l'espacement 10.12 (voir 10.11 et 10.12).
