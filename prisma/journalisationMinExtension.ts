import { Prisma } from '@prisma/client'

import {
  ContexteJournalisationMin,
  contexteJournalisationMin,
  EvenementMin,
  EvenementMinComplet,
} from '../src/gateways/shared/contexteJournalisationMin'

// Extension Prisma qui journalise toute mutation (create/update/delete) dans
// source.min__evenements, dès lors qu'un contexte de journalisation est présent
// (posé par avecJournalisationMin dans les server actions).
//   - create/delete : value = snapshot complet de la ligne (noms de colonnes)
//   - update : value = { new, old } limités aux colonnes modifiées
// Les tables purement techniques (déjà des journaux) sont exclues.

const modelesExclus: ReadonlySet<string> = new Set(['MembreTransfertLogRecord'])

// Colonnes ignorées dans les diffs : si seules ces colonnes changent, aucun événement n'est émis.
// derniere_connexion est mise à jour à chaque login : la journaliser noierait les vrais événements.
const colonnesIgnorees: Readonly<Record<string, ReadonlySet<string>>> = {
  'min.utilisateur': new Set(['derniere_connexion']),
}

export const extensionJournalisationMin = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'journalisationMin',
    query: {
      async $allOperations({ args, model, operation, query }) {
        const meta = model === undefined ? undefined : metaSiJournalisable(model)
        if (meta === undefined) {
          return query(args)
        }
        // Dans une transaction journalisée, les lectures auxiliaires (snapshots, relectures,
        // résolution de l'acteur) passent par le client de transaction : une seule connexion
        // du pool et visibilité des écritures non commitées.
        const clientContextuel = contexteJournalisationMin.getStore()?.clientTransaction ?? client
        switch (operation) {
          case 'create':
            return traiterCreate(clientContextuel, meta, args, query)
          case 'createMany':
            return traiterCreateMany(clientContextuel, meta, args, query)
          case 'createManyAndReturn':
            return traiterCreateManyAndReturn(clientContextuel, meta, args, query)
          case 'delete':
            return traiterDelete(clientContextuel, meta, args, query)
          case 'deleteMany':
            return traiterDeleteMany(clientContextuel, meta, args, query)
          case 'update':
            return traiterUpdate(clientContextuel, meta, args, query)
          case 'updateMany':
            return traiterUpdateMany(clientContextuel, meta, args, query)
          case 'upsert':
            return traiterUpsert(clientContextuel, meta, args, query)
          default:
            return query(args)
        }
      },
    },
  })
)

type Requete = (args: unknown) => Promise<unknown>

async function traiterCreate(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const resultat = await query(args)
  const ligne = (await relire(client, meta, resultat as Ligne)) ?? (resultat as Ligne)
  await emettre(client, [evenementSnapshot('create', meta, ligne)])
  return resultat
}

async function traiterCreateMany(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const resultat = await query(args)
  const donnees = (args as Readonly<{ data: Ligne | ReadonlyArray<Ligne> }>).data
  const lignes = Array.isArray(donnees) ? (donnees as ReadonlyArray<Ligne>) : [donnees as Ligne]
  const evenements: Array<EvenementMin> = []
  for (const donnee of lignes) {
    // Seules les lignes dont la clé primaire est fournie sont relisibles, donc journalisables
    const ligne = await relire(client, meta, donnee)
    if (ligne !== null) {
      evenements.push(evenementSnapshot('create', meta, ligne))
    }
  }
  await emettre(client, evenements)
  return resultat
}

async function traiterCreateManyAndReturn(
  client: unknown,
  meta: MetaModele,
  args: unknown,
  query: Requete
): Promise<unknown> {
  const resultat = await query(args)
  const evenements: Array<EvenementMin> = []
  for (const cree of resultat as ReadonlyArray<Ligne>) {
    const ligne = (await relire(client, meta, cree)) ?? cree
    evenements.push(evenementSnapshot('create', meta, ligne))
  }
  await emettre(client, evenements)
  return resultat
}

async function traiterDelete(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const avant = await lecteur(client, meta).findFirst({ where: (args as ArgsAvecWhere).where })
  const resultat = await query(args)
  if (avant !== null) {
    await emettre(client, [evenementSnapshot('delete', meta, avant)])
  }
  return resultat
}

async function traiterDeleteMany(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const avant = await lecteur(client, meta).findMany({ where: (args as ArgsAvecWhere).where })
  const resultat = await query(args)
  await emettre(
    client,
    avant.map((ligne) => evenementSnapshot('delete', meta, ligne))
  )
  return resultat
}

async function traiterUpdate(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const avant = await lecteur(client, meta).findFirst({ where: (args as ArgsAvecWhere).where })
  const resultat = await query(args)
  if (avant !== null) {
    await emettreDifference(client, meta, avant)
  }
  return resultat
}

async function traiterUpdateMany(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const avant = await lecteur(client, meta).findMany({ where: (args as ArgsAvecWhere).where })
  const resultat = await query(args)
  for (const ligne of avant) {
    await emettreDifference(client, meta, ligne)
  }
  return resultat
}

async function traiterUpsert(client: unknown, meta: MetaModele, args: unknown, query: Requete): Promise<unknown> {
  const avant = await lecteur(client, meta).findFirst({ where: (args as ArgsAvecWhere).where })
  const resultat = await query(args)
  if (avant === null) {
    const ligne = (await relire(client, meta, resultat as Ligne)) ?? (resultat as Ligne)
    await emettre(client, [evenementSnapshot('create', meta, ligne)])
  } else {
    await emettreDifference(client, meta, avant)
  }
  return resultat
}

export async function insererEvenementsMin(
  client: ClientExecuteur,
  runId: string,
  evenements: ReadonlyArray<EvenementMinComplet>
): Promise<void> {
  for (const evenement of evenements) {
    /* eslint-disable camelcase */
    const donnee = JSON.stringify({
      action: evenement.action,
      entity_id: evenement.entityId,
      user_id: evenement.userId,
      value: evenement.value,
    })
    /* eslint-enable camelcase */
    await client.$executeRaw`
      INSERT INTO source.min__evenements (run_id, source_key, donnee)
      VALUES (${runId}, ${evenement.sourceKey}, ${donnee}::jsonb)`
  }
}

export async function resoudreActeurMin(client: unknown, contexte: ContexteJournalisationMin): Promise<null | number> {
  if (contexte.actorId !== undefined) {
    return contexte.actorId
  }
  const sub = await contexte.resoudreSub()
  if (sub === undefined) {
    contexte.actorId = null
    return null
  }
  const utilisateur = await (
    client as Readonly<Record<'utilisateurRecord', LecteurModele>>
  ).utilisateurRecord.findFirst({
    where: { ssoId: sub },
  })
  contexte.actorId = utilisateur === null ? null : (utilisateur.id as number)
  return contexte.actorId
}

type ArgsAvecWhere = Readonly<{ where: Ligne }>

export type ClientExecuteur = Readonly<{
  $executeRaw(chaines: TemplateStringsArray, ...valeurs: ReadonlyArray<unknown>): Promise<number>
}>

type LecteurModele = Readonly<{
  findFirst(args: Readonly<{ where: Ligne }>): Promise<Ligne | null>
  findMany(args: Readonly<{ where: Ligne }>): Promise<Array<Ligne>>
}>

type Ligne = Record<string, unknown>

type MetaModele = Readonly<{
  champsCles: ReadonlyArray<string>
  colonneParChamp: Readonly<Record<string, string>>
  delegue: string
  sourceKey: string
}>

const metaParModele: ReadonlyMap<string, MetaModele> = new Map(
  Prisma.dmmf.datamodel.models.map((modele) => [
    modele.name,
    {
      champsCles: modele.primaryKey?.fields ?? modele.fields.filter((champ) => champ.isId).map((champ) => champ.name),
      colonneParChamp: Object.fromEntries(
        modele.fields
          .filter((champ) => champ.kind !== 'object')
          .map((champ) => [champ.name, champ.dbName ?? champ.name])
      ),
      delegue: modele.name.charAt(0).toLowerCase() + modele.name.slice(1),
      sourceKey: `${modele.schema ?? 'public'}.${modele.dbName ?? modele.name}`,
    },
  ])
)

function metaSiJournalisable(model: string): MetaModele | undefined {
  if (contexteJournalisationMin.getStore() === undefined || modelesExclus.has(model)) {
    return undefined
  }
  return metaParModele.get(model)
}

function lecteur(client: unknown, meta: MetaModele): LecteurModele {
  return (client as Readonly<Record<string, LecteurModele>>)[meta.delegue]
}

async function relire(client: unknown, meta: MetaModele, ligne: Ligne): Promise<Ligne | null> {
  const where: Ligne = {}
  for (const champ of meta.champsCles) {
    if (!(champ in ligne)) {
      return null
    }
    where[champ] = ligne[champ]
  }
  return lecteur(client, meta).findFirst({ where })
}

async function emettre(client: unknown, evenements: ReadonlyArray<EvenementMin>): Promise<void> {
  const contexte = contexteJournalisationMin.getStore()
  if (contexte === undefined || evenements.length === 0) {
    return
  }
  const userId = await resoudreActeurMin(client, contexte)
  if (userId === null) {
    return
  }
  const complets = evenements.map((evenement) => ({ ...evenement, userId }))
  if (contexte.bufferTransaction !== null) {
    contexte.bufferTransaction.push(...complets)
    return
  }
  await insererEvenementsMin(client as ClientExecuteur, contexte.runId, complets)
}

async function emettreDifference(client: unknown, meta: MetaModele, avant: Ligne): Promise<void> {
  const apres = await relire(client, meta, avant)
  if (apres === null) {
    return
  }
  const difference = differencier(meta, avant, apres)
  if (difference === null) {
    return
  }
  await emettre(client, [
    { action: 'update', entityId: cleEntite(meta, avant), sourceKey: meta.sourceKey, value: difference },
  ])
}

function evenementSnapshot(action: 'create' | 'delete', meta: MetaModele, ligne: Ligne): EvenementMin {
  return { action, entityId: cleEntite(meta, ligne), sourceKey: meta.sourceKey, value: snapshot(meta, ligne) }
}

function cleEntite(meta: MetaModele, ligne: Ligne): string {
  return meta.champsCles.map((champ) => String(ligne[champ] as number | string)).join(':')
}

function snapshot(meta: MetaModele, ligne: Ligne): Ligne {
  const resultat: Ligne = {}
  for (const [champ, colonne] of Object.entries(meta.colonneParChamp)) {
    if (champ in ligne) {
      resultat[colonne] = serialiserValeur(ligne[champ])
    }
  }
  return resultat
}

function differencier(meta: MetaModele, avant: Ligne, apres: Ligne): null | Readonly<{ new: Ligne; old: Ligne }> {
  const ignorees = colonnesIgnorees[meta.sourceKey] as ReadonlySet<string> | undefined
  const anciennes: Ligne = {}
  const nouvelles: Ligne = {}
  for (const [champ, colonne] of Object.entries(meta.colonneParChamp)) {
    if (ignorees?.has(colonne) === true || enJson(avant[champ]) === enJson(apres[champ])) {
      continue
    }
    anciennes[colonne] = serialiserValeur(avant[champ])
    nouvelles[colonne] = serialiserValeur(apres[champ])
  }
  if (Object.keys(nouvelles).length === 0) {
    return null
  }
  return { new: nouvelles, old: anciennes }
}

function enJson(valeur: unknown): string {
  return JSON.stringify(serialiserValeur(valeur)) ?? 'undefined'
}

function serialiserValeur(valeur: unknown): unknown {
  return valeur instanceof Date ? valeur.toISOString() : valeur
}
