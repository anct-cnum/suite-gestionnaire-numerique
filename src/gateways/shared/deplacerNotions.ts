import { Prisma } from '@prisma/client'

import { NotionCle } from '@/use-cases/commands/TransfererNotionsStructure'

// Les 6 notions transférables — une fusion = déplacer la totalité.
export const TOUTES_NOTIONS: ReadonlyArray<NotionCle> = [
  'aidantsConnect',
  'contacts',
  'coop',
  'idposte',
  'lieuInclusion',
  'membre',
]

// Cœur transactionnel partagé entre le transfert (sous-ensemble de notions) et la fusion (les 6).
// Charge les structures, applique les gardes C1/C2 puis les mutations des notions choisies. Ne gère
// NI la transaction (fournie par l'appelant), NI le soft-delete, NI l'audit, NI le balayage résiduel
// — laissés à chaque repository selon sa sémantique.
export async function deplacerNotionsDansTransaction(
  tx: Prisma.TransactionClient,
  deplacement: Deplacement
): Promise<'OK' | DeplacementFailure> {
  const { idCible, idSource, notions } = deplacement
  function choisi(notion: NotionCle): boolean {
    return notions.includes(notion)
  }

  const lignes = await tx.$queryRaw<Array<LigneStructure>>`
    SELECT id, deleted_at, structure_coop_id, structure_tp_id, structure_ac_id, nb_mandats_ac
    FROM main.structure_administrative WHERE id IN (${idSource}, ${idCible})
  `
  const source = lignes.find((ligne) => ligne.id === idSource)
  const cible = lignes.find((ligne) => ligne.id === idCible)
  if (source === undefined || cible === undefined || source.deleted_at !== null || cible.deleted_at !== null) {
    return 'structureIntrouvable'
  }

  if (collisionIdentifiantSource(choisi, source, cible)) {
    return 'collisionIdentifiantSource'
  }
  if (choisi('membre') && (await collisionMembreGouvernance(tx, idSource, idCible))) {
    return 'collisionMembreGouvernance'
  }

  if (choisi('membre')) {
    await transfererMembre(tx, idSource, idCible)
  }
  if (choisi('contacts')) {
    await transfererContacts(tx, idSource, idCible)
  }
  if (choisi('coop')) {
    await transfererCoop(tx, idSource, idCible, source)
  }
  if (choisi('idposte')) {
    await transfererIdposte(tx, idSource, idCible, source)
  }
  if (choisi('aidantsConnect')) {
    await transfererAidantsConnect(tx, idSource, idCible, source)
  }
  if (choisi('lieuInclusion')) {
    await transfererLieuInclusion(tx, idSource, idCible)
  }

  return 'OK'
}

// La source ne porte plus rien = 0 ligne sur les 7 FK ET 0 id scalaire sortant (coop/tp/ac). Les
// champs d'identité (siret/ridet/rna) ne comptent pas : ce ne sont pas des vecteurs de resync.
export async function sourceEstVide(tx: Prisma.TransactionClient, idSource: number): Promise<boolean> {
  const lignes = await tx.$queryRaw<Array<{ vide: boolean }>>`
    SELECT NOT (
      EXISTS (SELECT 1 FROM min.utilisateur WHERE structure_id = ${idSource})
      OR EXISTS (SELECT 1 FROM min.membre WHERE structure_id = ${idSource})
      OR EXISTS (SELECT 1 FROM main.poste WHERE structure_id = ${idSource})
      OR EXISTS (SELECT 1 FROM main.contrat WHERE structure_id = ${idSource})
      OR EXISTS (SELECT 1 FROM main.personne_affectations_emploi WHERE structure_administrative_id = ${idSource})
      OR EXISTS (SELECT 1 FROM main.contact_structure_administrative WHERE structure_administrative_id = ${idSource})
      OR EXISTS (SELECT 1 FROM main.lieu_inclusion_structure_administrative WHERE structure_administrative_id = ${idSource})
      OR EXISTS (
        SELECT 1 FROM main.structure_administrative
        WHERE id = ${idSource}
          AND (structure_coop_id IS NOT NULL OR structure_tp_id IS NOT NULL OR structure_ac_id IS NOT NULL)
      )
    ) AS vide
  `

  return lignes.at(0)?.vide === true
}

export async function soumettreSoftDelete(
  tx: Prisma.TransactionClient,
  idSource: number,
  parUtilisateur: string
): Promise<void> {
  await tx.$executeRaw`
    UPDATE main.structure_administrative
    SET deleted_at = now(),
        deleted_by = array_append(COALESCE(deleted_by, '{}'), ${parUtilisateur}),
        updated_at = now()
    WHERE id = ${idSource}
  `
}

type DeplacementFailure = 'collisionIdentifiantSource' | 'collisionMembreGouvernance' | 'structureIntrouvable'

type Deplacement = Readonly<{
  idCible: number
  idSource: number
  notions: ReadonlyArray<NotionCle>
}>

interface LigneStructure {
  deleted_at: Date | null
  id: number
  nb_mandats_ac: null | number
  structure_ac_id: null | string
  structure_coop_id: null | string
  structure_tp_id: null | number
}

// Une notion source sélectionnée porte un id scalaire alors que la cible en porte déjà un autre.
function collisionIdentifiantSource(
  choisi: (notion: NotionCle) => boolean,
  source: LigneStructure,
  cible: LigneStructure
): boolean {
  function conflit(valeurSource: null | number | string, valeurCible: null | number | string): boolean {
    return valeurSource !== null && valeurCible !== null && valeurSource !== valeurCible
  }

  return (
    (choisi('coop') && conflit(source.structure_coop_id, cible.structure_coop_id)) ||
    (choisi('idposte') && conflit(source.structure_tp_id, cible.structure_tp_id)) ||
    (choisi('aidantsConnect') && conflit(source.structure_ac_id, cible.structure_ac_id))
  )
}

async function collisionMembreGouvernance(
  tx: Prisma.TransactionClient,
  idSource: number,
  idCible: number
): Promise<boolean> {
  const lignes = await tx.$queryRaw<Array<{ collision: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM min.membre source
      JOIN min.membre cible ON cible.gouvernance_departement_code = source.gouvernance_departement_code
      WHERE source.structure_id = ${idSource} AND cible.structure_id = ${idCible}
    ) AS collision
  `

  return lignes.at(0)?.collision === true
}

async function deplacerAffectations(
  tx: Prisma.TransactionClient,
  idSource: number,
  idCible: number,
  source: string
): Promise<void> {
  // personne_affectations_emploi : UNIQUE(personne_id, structure_administrative_id, source).
  await tx.$executeRaw`
    UPDATE main.personne_affectations_emploi e SET structure_administrative_id = ${idCible}
    WHERE e.structure_administrative_id = ${idSource} AND e.source = ${source}
      AND NOT EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi f
        WHERE f.structure_administrative_id = ${idCible} AND f.personne_id = e.personne_id AND f.source = e.source
      )
  `
  await tx.$executeRaw`
    DELETE FROM main.personne_affectations_emploi
    WHERE structure_administrative_id = ${idSource} AND source = ${source}
  `
}

async function transfererAidantsConnect(
  tx: Prisma.TransactionClient,
  idSource: number,
  idCible: number,
  source: LigneStructure
): Promise<void> {
  await deplacerAffectations(tx, idSource, idCible, 'aidants-connect')
  if (source.structure_ac_id === null) {
    return
  }
  await tx.$executeRaw`
    UPDATE main.structure_administrative SET structure_ac_id = NULL, nb_mandats_ac = NULL WHERE id = ${idSource}
  `
  await tx.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_ac_id = ${source.structure_ac_id}::uuid, nb_mandats_ac = ${source.nb_mandats_ac}
    WHERE id = ${idCible}
  `
}

async function transfererContacts(tx: Prisma.TransactionClient, idSource: number, idCible: number): Promise<void> {
  // contact_structure_administrative : UNIQUE(structure_administrative_id, contact_id).
  await tx.$executeRaw`
    UPDATE main.contact_structure_administrative c SET structure_administrative_id = ${idCible}
    WHERE c.structure_administrative_id = ${idSource}
      AND NOT EXISTS (
        SELECT 1 FROM main.contact_structure_administrative d
        WHERE d.structure_administrative_id = ${idCible} AND d.contact_id = c.contact_id
      )
  `
  await tx.$executeRaw`
    DELETE FROM main.contact_structure_administrative WHERE structure_administrative_id = ${idSource}
  `
}

async function transfererCoop(
  tx: Prisma.TransactionClient,
  idSource: number,
  idCible: number,
  source: LigneStructure
): Promise<void> {
  await deplacerAffectations(tx, idSource, idCible, 'coop')
  if (source.structure_coop_id === null) {
    return
  }
  await tx.$executeRaw`UPDATE main.structure_administrative SET structure_coop_id = NULL WHERE id = ${idSource}`
  await tx.$executeRaw`
    UPDATE main.structure_administrative SET structure_coop_id = ${source.structure_coop_id}::uuid WHERE id = ${idCible}
  `
}

async function transfererIdposte(
  tx: Prisma.TransactionClient,
  idSource: number,
  idCible: number,
  source: LigneStructure
): Promise<void> {
  // poste : UNIQUE(poste_conum_id, structure_id, personne_id).
  // On repointe uniquement les postes qui n'entrent pas en collision avec un poste déjà
  // présent sur la cible. On ne SUPPRIME PAS les doublons exacts restants : main.poste est
  // alimentée par l'ETL id-poste (dataspace), MIN ne doit pas y faire de DELETE (il
  // détruirait une ligne ETL, recréée/désynchronisée au run suivant ; min_scalingo n'a
  // d'ailleurs qu'UPDATE sur poste). Les doublons non repointables (cas rare : même
  // poste_conum_id + personne des deux côtés) restent sur la source — la fusion la
  // soft-delete quand même ; un transfert la conserve (sourceEstVide = false) et l'ETL
  // réconcilie au prochain run.
  await tx.$executeRaw`
    UPDATE main.poste p SET structure_id = ${idCible}
    WHERE p.structure_id = ${idSource}
      AND NOT EXISTS (
        SELECT 1 FROM main.poste q
        WHERE q.structure_id = ${idCible}
          AND q.poste_conum_id = p.poste_conum_id
          AND q.personne_id IS NOT DISTINCT FROM p.personne_id
      )
  `
  // contrat : pas de contrainte d'unicité sur structure_id → UPDATE direct.
  await tx.$executeRaw`UPDATE main.contrat SET structure_id = ${idCible} WHERE structure_id = ${idSource}`
  await deplacerAffectations(tx, idSource, idCible, 'idposte')
  if (source.structure_tp_id === null) {
    return
  }
  await tx.$executeRaw`UPDATE main.structure_administrative SET structure_tp_id = NULL WHERE id = ${idSource}`
  await tx.$executeRaw`
    UPDATE main.structure_administrative SET structure_tp_id = ${source.structure_tp_id} WHERE id = ${idCible}
  `
}

async function transfererLieuInclusion(tx: Prisma.TransactionClient, idSource: number, idCible: number): Promise<void> {
  // lieu_inclusion_structure_administrative : UNIQUE(lieu_id, structure_administrative_id).
  await tx.$executeRaw`
    UPDATE main.lieu_inclusion_structure_administrative a SET structure_administrative_id = ${idCible}
    WHERE a.structure_administrative_id = ${idSource}
      AND NOT EXISTS (
        SELECT 1 FROM main.lieu_inclusion_structure_administrative b
        WHERE b.structure_administrative_id = ${idCible} AND b.lieu_id = a.lieu_id
      )
  `
  await tx.$executeRaw`
    DELETE FROM main.lieu_inclusion_structure_administrative WHERE structure_administrative_id = ${idSource}
  `
}

async function transfererMembre(tx: Prisma.TransactionClient, idSource: number, idCible: number): Promise<void> {
  // Re-pointage des membres et de tous les utilisateurs : les dépendants (feuilles de route,
  // subventions, porteurs d'action, cofinancements) suivent via le membre.id inchangé.
  await tx.$executeRaw`UPDATE min.membre SET structure_id = ${idCible} WHERE structure_id = ${idSource}`
  await tx.$executeRaw`UPDATE min.utilisateur SET structure_id = ${idCible} WHERE structure_id = ${idSource}`
}
