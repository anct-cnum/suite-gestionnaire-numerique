---
name: server-action
description: Pattern des server actions Next.js et journalisation obligatoire des mutations (audit trail source.min__evenements). Use when creating or modifying a server action in src/app/api/actions/, a mutating route, a Prisma transaction, or any raw SQL write in a gateway.
user-invocable: false
---

# Server actions et journalisation des mutations

## Server actions

Pattern strict dans `src/app/api/actions/` :
- `'use server'` en haut du fichier
- **Corps entier enveloppé dans `avecJournalisationMin(async () => { ... })`** (`./shared/journalisation`) — voir « Journalisation des mutations »
- Validation Zod avant toute logique
- Appel au gateway/repository (jamais Prisma directement)
- `revalidatePath(path)` après mutation
- Retour : `Promise<ReadonlyArray<string>>` (messages d'erreur Zod ou `['OK']`)
- Pour les commands complexes : `ResultAsync<ReadonlyArray<string>>`
- `type ActionParams = Readonly<{...}>` et `const validator = z.object({...})` en bas du fichier

## Journalisation des mutations (audit trail `source.min__evenements`)

**Toute mutation de données doit être journalisée — c'est implicite pour chaque nouvelle feature, sans qu'on ait à le demander.**

- Chaque écriture (create/update/delete) effectuée pendant une server action est tracée dans `source.min__evenements` (table hors Prisma, schéma `source`) : `run_id` (corrélation par action), `source_key` (`schema.table`), `donnee` = `{action, entity_id, user_id, value}` — create/delete : snapshot complet ; update : `{old, new}` limités aux colonnes modifiées.
- **Nouvelle server action ou route mutante** : envelopper le corps entier dans `avecJournalisationMin(async () => { ... })` (`src/app/api/actions/shared/journalisation.ts`). Les mutations Prisma sont alors interceptées automatiquement par l'extension (`prisma/journalisationMinExtension.ts`) — rien d'autre à faire.
- **Transaction contenant des mutations Prisma** : ne pas appeler `prisma.$transaction` directement — utiliser `journaliserTransaction(prisma, async (tx) => { ... })` (`src/gateways/shared/journalisationMin.ts`) qui ouvre la transaction lui-même : les événements sont écrits après commit, jetés si rollback, et les lectures auxiliaires de l'extension passent par le client de transaction (une seule connexion du pool).
- **Écritures en SQL brut (`$executeRaw` / `$queryRaw` INSERT…)** : non interceptables — utiliser les helpers de `src/gateways/shared/journalisationMin.ts` dans la transaction : `journaliserCreateBrut(tx, sourceKey, id)`, `journaliserUpdateBrut(tx, sourceKey, selectionAvant, mutation)`, `journaliserDeleteBrut(tx, sourceKey, selectionAvant, mutation)`, `selectionLigne(sourceKey, id)` pour les mono-lignes.
- Exclusions : les tables qui sont déjà des journaux (`audit.structure_merge_log`, `min.membre_transfert_log`) ; pas d'événement si seule `derniere_connexion` change sur `min.utilisateur`.
- Le `user_id` est l'id `min.utilisateur` résolu paresseusement depuis la session : sans session ni utilisateur connu, rien n'est journalisé (pas d'erreur).
