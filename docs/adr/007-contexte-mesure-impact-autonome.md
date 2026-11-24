# ADR-007 : La mesure d'impact est un contexte autonome, rattaché au back-office par la seule structure

**Date** : 2026-11-10
**Statut** : Accepté
**Décideurs** : CTO MIN
**Périmètre** : min, dataspace (schéma `mesure_impact` créé en production par la migration Flyway V199)
**Tickets / MR** : #2263 à #2268 (questionnaire usager), #2302 à #2304 (espace de la structure, saisie, résultats)

## Contexte

La mesure d'impact interroge les personnes accompagnées sur ce que les accompagnements au numérique ont changé pour elles : un questionnaire public et anonyme (socle v22, 26 questions en 3 parties), rempli en ligne, ou saisi par la collectivité depuis le papier ou par téléphone, puis des résultats agrégés. Le pilote se fait avec le Sicoval.

Ce besoin n'a rien de commun avec le reste de MIN (gouvernances, feuilles de route, lieux, postes) : c'est une collecte publique de données d'enquête, sans compte, appelée à servir une consolidation nationale. Le seul point de contact avec le back-office est l'organisation qui porte la campagne et les personnes qui la pilotent.

Deux contraintes pèsent sur le modèle :

- les libellés du questionnaire vont changer (passe FALC prévue), alors que les réponses doivent rester lisibles et agrégeables ;
- les règles du parcours (questions conditionnelles, options filtrées, réponses exclusives, précisions) doivent être identiques à l'écran et au serveur, qui ne fait pas confiance à l'envoi d'un formulaire public.

## Décision

1. **Contexte autonome.** Le code vit dans des sous-dossiers `mesure-impact/` de chaque couche (`src/domain`, `src/use-cases`, `src/gateways`, `src/presenters`, `src/components`). Deux zones ESLint `import/no-restricted-paths` l'imposent : le contexte ne dépend que de lui-même et des éléments partagés (`shared`, `CommandHandler`, `QueryHandler`), et le reste de l'application ne dépend pas de lui.
2. **Rattachement par la structure seule.** Une campagne appartient à une structure (`mesure_impact.campagne.structure_id`, clé étrangère vers `main.structure_administrative`). Le domaine ne connaît que cet identifiant, jamais le modèle Structure, Gouvernance ou Membre. Les personnes rattachées à la structure pilotent la campagne (lot 2).
3. **Schéma dédié `mesure_impact`.** Tables `campagne` et `reponse`. Une réponse est déposée une fois et n'est jamais modifiée ; son contenu est un JSON `code de question → réponse`, accompagné de la version du questionnaire et du canal (`en_ligne`, `papier`, `telephone`).
4. **Questionnaire versionné, écrit dans le code.** Chaque version (`socle-v22`) est une définition immuable avec des **codes stables** pour les questions et les options, et des règles déclaratives (conditions, options conditionnelles, lignes de grille, « Lequel ? »). Un changement de libellé ou de règle crée une nouvelle version. Le même module calcule les questions posées, nettoie le contenu après un retour en arrière et vérifie l'envoi côté serveur.
5. **Libellé du territoire porté par la campagne** (`libelle_territoire`) : la dénomination SIRENE ne se prête pas à l'affichage public, et la page publique n'a ainsi pas à lire le back-office.
6. **Anti-abus sans adresse IP** (décision du 16/11/2026, ticket #2268 RG6) : aucune adresse IP n'est lue, stockée ni hachée. Chaque envoi en ligne porte une preuve de travail ALTCHA (`altcha-lib`, MIT, hébergée par MIN) : le serveur signe un défi (HMAC, clé `ALTCHA_HMAC_KEY`) qui porte la campagne et une échéance d'une heure ; le navigateur le résout sans rien afficher, dès l'arrivée sur la dernière étape. La table `defi_consomme` garde chaque défi utilisé jusqu'à son échéance, pour qu'il ne serve qu'une fois. Le défi devient 16 fois plus coûteux quand la campagne a reçu 100 réponses depuis le début de l'heure.
7. **Heure de dépôt arrondie à l'heure** : précise, elle désignerait la séance de médiation, donc la personne pour qui y était. L'heure suffit à suivre l'arrivée des réponses et à repérer une rafale.
8. **Questionnaire publié sur le site vitrine, sans aucune trace de la personne qui répond** (décision du 16/11/2026, #2263) : adresse `inclusion-numerique.anct.gouv.fr/questionnaire/<campagne>`, que le proxy ne renvoie pas vers les routes de la vitrine. Le dépôt d'une réponse **n'est pas journalisé** dans `source.min__evenements`, par exception à la règle des mutations : depuis un navigateur connecté à MIN (un médiateur qui prête son appareil), le journal lierait la réponse complète au compte et à l'heure exacte. Ni Matomo ni les traces de performance Sentry ne tournent sur `/questionnaire/` ; seules les erreurs remontent.
9. **Espace de la structure** (#2302 à #2304, 17/11/2026) : l'entrée de menu « Mesure d'impact », la page de la campagne, la saisie et les résultats sont réservés aux personnes dont la structure de rattachement (`min.utilisateur.structure_id`) porte la campagne ; la règle est dans le domaine (`Campagne.estPiloteePar`). L'accès, d'abord réservé aux bêta-testeurs (`min.utilisateur.is_beta_testeur`), est ouvert à toutes les personnes de la structure depuis le 24/11/2026 ; la structure retenue reste calculée en un seul point côté application (`structureDeLaMesureDImpact`). Le menu du back-office ne connaît pas le contexte : la page lui passe un booléen. L'adresse diffusée (lien, QR code, « Faire répondre quelqu'un ») est celle du site vitrine en production, et celle de l'hôte de l'application ailleurs, pour qu'un essai en préproduction ne réponde jamais en production. La saisie papier ou téléphonique est **journalisée**, sans preuve de travail. Le questionnaire papier est un PDF généré à la demande depuis la définition versionnée du questionnaire (toutes les questions, conditions écrites en consignes, numérotation de la saisie et des résultats), sans fichier à tenir à jour. Chaque question des résultats est rapportée aux personnes qui y ont répondu, donc une question conditionnelle à celles à qui elle a été posée ; les réponses sont comptées par code d'option, stable d'une version à l'autre.

## Alternatives envisagées

- **Tables dans le schéma `min`** : pas de migration Flyway de schéma ni de droits à poser, mais la frontière ne se voit plus en base, et une consolidation nationale ou une extraction vers le dataspace devrait trier les tables.
- **Rattacher la campagne à la gouvernance départementale ou à un membre** : la gouvernance est départementale alors que le pilote est un EPCI, et un membre n'existe que dans une gouvernance. La structure est le seul objet stable commun à tous les porteurs possibles.
- **Référence sans clé étrangère vers la structure** : découplage plus fort, mais une campagne pourrait pointer vers une structure inexistante. La fusion de structures doit de toute façon traiter les campagnes.
- **Réponses stockées par libellé** (comme le prototype) : toute reformulation casserait les agrégats.
- **Limite d'envois par adresse IP** (Cloudflare devant le domaine, ou empreinte d'IP en base) : contraire à #2268 RG6, et les personnes répondent souvent à plusieurs depuis le Wi-Fi du lieu de médiation. Cloudflare aurait en plus déchiffré tout le trafic de MIN chez un prestataire américain.
- **Questionnaire en base** : utile quand les campagnes auront des questions complémentaires ; prématuré pour une définition unique dont les règles sont du code.

## Conséquences

- En production, le schéma `mesure_impact`, ses tables et ses droits (`min_scalingo` et `min_dev` en lecture et écriture, sans droit de création ; `app_python` en lecture) sont posés par la migration Flyway V199 du dataspace, miroir de la migration Prisma `20261110120000_creer_contexte_mesure_impact` (qui ne sert qu'aux bases locales et de test).
- La fusion et le transfert de structures doivent déplacer les campagnes : la clé étrangère `ON DELETE RESTRICT` empêche de supprimer une structure qui porte une campagne.
- La clé `ALTCHA_HMAC_KEY` doit être définie en production et en préproduction (les applications de revue la reçoivent de leur application parente à leur création) ; sans elle, aucun questionnaire en ligne ne peut être envoyé.
- La preuve de travail freine les envois en masse sans les empêcher : un script décidé paie le calcul. La surveillance après coup (réponses par heure et par campagne) reste le filet.
- Les réponses en ligne ne sont pas journalisées (décision 8) : un test gardien de `deposerUneReponseAction` l'impose. Les saisies papier et téléphone, faites par une personne connectée, le sont (décision 9).
- Le questionnaire reste joignable sur le domaine de MIN, qui sert aussi en préproduction et dans les applications de revue : rien n'y est journalisé non plus, mais le lien diffusé (QR code, back-office) doit être celui du site vitrine.
- Un résultat se calcule avec la version du questionnaire de chaque réponse : les agrégats devront regrouper les versions compatibles.
- Signal de réexamen : questions complémentaires par campagne (questionnaire en base), ou reprise de la collecte par une autre application.
