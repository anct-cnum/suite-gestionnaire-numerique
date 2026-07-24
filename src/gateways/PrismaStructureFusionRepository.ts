import { Prisma } from '@prisma/client'

import { deplacerNotionsDansTransaction, soumettreSoftDelete, TOUTES_NOTIONS } from './shared/deplacerNotions'
import { journaliserDeleteBrut, journaliserUpdateBrut } from './shared/journalisationMin'
import prisma from '../../prisma/prismaClient'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { Fusion, FusionFailure, StructureFusionRepository } from '@/use-cases/commands/FusionnerStructures'

// Fusion = déplacer les 6 notions de l'absorbée vers la survivante (via le moteur partagé, qui
// transfère aussi les ids de source tp/ac — correctif du bug d'abandon — et l'uuid coop quand la
// survivante n'en porte pas, sinon il est abandonné et tracé), balayer les FK résiduelles non
// rattachées à une notion (affectations source='min'…), repointer les références coop (bascule
// ADR-002 : la coop pointe la SA par id int), puis soft-delete l'absorbée. La survivante conserve
// TOUS ses champs descriptifs (aucun import depuis l'absorbée).
export class PrismaStructureFusionRepository implements StructureFusionRepository {
  async fusionner(fusion: Fusion): ResultAsync<FusionFailure> {
    try {
      return await prisma.$transaction(async (tx) => this.#fusionnerDansTransaction(tx, fusion))
    } catch (erreur) {
      await this.#journaliserEchec(fusion, erreur)
      return 'fusionEchouee'
    }
  }

  async #fusionnerDansTransaction(tx: Prisma.TransactionClient, fusion: Fusion): ResultAsync<FusionFailure> {
    const { idAbsorbee, idSurvivante, parUtilisateur } = fusion

    const lignes = await tx.$queryRaw<Array<LigneStructure>>`
      SELECT id, deleted_at, denomination_antenne, siret, ridet, rna, structure_coop_id, to_jsonb(sa.*) AS snapshot
      FROM main.structure_administrative sa
      WHERE id IN (${idSurvivante}, ${idAbsorbee})
    `
    const survivante = lignes.find((ligne) => ligne.id === idSurvivante)
    const absorbee = lignes.find((ligne) => ligne.id === idAbsorbee)
    if (survivante === undefined || absorbee === undefined) {
      return 'structureIntrouvable'
    }
    if (survivante.deleted_at !== null || absorbee.deleted_at !== null) {
      return 'structureIntrouvable'
    }
    // Une canonique (forme INSEE, sans denomination_antenne) ne peut être absorbée que par une autre
    // canonique : fusionner deux canoniques (doublons inter-SIRET) est permis, mais jamais absorber une
    // canonique dans une antenne — on ne fait pas disparaître une entité INSEE au profit d'une variante.
    if (absorbee.denomination_antenne === null && survivante.denomination_antenne !== null) {
      return 'fusionImpossibleCanoniqueDansAntenne'
    }

    // Déplacement des 6 notions (ids de source inclus) + gardes C1/C2 du moteur partagé.
    const resultat = await deplacerNotionsDansTransaction(tx, {
      idCible: idSurvivante,
      idSource: idAbsorbee,
      notions: TOUTES_NOTIONS,
    })
    if (resultat !== 'OK') {
      return resultat
    }

    // Balayage des FK résiduelles que les notions ne couvrent pas (affectations source='min'…).
    await this.#repointerAffectationsResiduelles(tx, idSurvivante, idAbsorbee)
    const referencesCoop = await this.#repointerReferencesCoop(tx, idSurvivante, idAbsorbee)
    await soumettreSoftDelete(tx, idAbsorbee, parUtilisateur)
    await this.#journaliserSucces(tx, fusion, survivante, absorbee, referencesCoop)

    return 'OK'
  }

  async #journaliserEchec(fusion: Fusion, erreur: unknown): Promise<void> {
    const message = erreur instanceof Error ? erreur.message : String(erreur)
    // Hors transaction (celle d'origine a rollback) : trace best-effort de l'échec.
    await prisma.$executeRaw`
      INSERT INTO audit.structure_merge_log
        (status, dag_id, task_id, winner_id, loser_id, error_message)
      VALUES ('FAILURE', 'min-ui', ${fusion.parUtilisateur}, ${fusion.idSurvivante}, ${fusion.idAbsorbee}, ${message})
    `
  }

  async #journaliserSucces(
    tx: Prisma.TransactionClient,
    fusion: Fusion,
    survivante: LigneStructure,
    absorbee: LigneStructure,
    referencesCoop: Readonly<Record<string, number>>
  ): Promise<void> {
    const apres = (
      await tx.$queryRaw<Array<{ snapshot: Prisma.JsonValue }>>`
        SELECT to_jsonb(sa.*) AS snapshot FROM main.structure_administrative sa WHERE id = ${fusion.idSurvivante}
      `
    ).at(0)

    await tx.$executeRaw`
      INSERT INTO audit.structure_merge_log
        (status, dag_id, task_id, winner_id, loser_id, winner_before, loser_before, winner_after, moved_identifiers)
      VALUES (
        'SUCCESS', 'min-ui', ${fusion.parUtilisateur},
        ${fusion.idSurvivante}, ${fusion.idAbsorbee},
        ${JSON.stringify(survivante.snapshot)}::jsonb,
        ${JSON.stringify(absorbee.snapshot)}::jsonb,
        ${JSON.stringify(apres?.snapshot ?? null)}::jsonb,
        ${JSON.stringify({ ...identifiantsAbandonnes(absorbee, survivante), ...referencesCoop })}::jsonb
      )
    `
  }

  // Repointe les affectations de l'absorbée non rattachées à une notion de source (typiquement
  // source='min') vers la survivante. Collision-aware sur la clé unique (personne, structure, source).
  async #repointerAffectationsResiduelles(
    tx: Prisma.TransactionClient,
    idSurvivante: number,
    idAbsorbee: number
  ): Promise<void> {
    await journaliserUpdateBrut(
      tx,
      'main.personne_affectations_emploi',
      Prisma.sql`
        SELECT to_jsonb(e.*) AS ligne FROM main.personne_affectations_emploi e
        WHERE e.structure_administrative_id = ${idAbsorbee}
          AND NOT EXISTS (
            SELECT 1 FROM main.personne_affectations_emploi f
            WHERE f.structure_administrative_id = ${idSurvivante}
              AND f.personne_id = e.personne_id AND f.source = e.source
          )
      `,
      async () => tx.$executeRaw`
        UPDATE main.personne_affectations_emploi e SET structure_administrative_id = ${idSurvivante}
        WHERE e.structure_administrative_id = ${idAbsorbee}
          AND NOT EXISTS (
            SELECT 1 FROM main.personne_affectations_emploi f
            WHERE f.structure_administrative_id = ${idSurvivante}
              AND f.personne_id = e.personne_id AND f.source = e.source
          )
      `
    )
    await journaliserDeleteBrut(
      tx,
      'main.personne_affectations_emploi',
      Prisma.sql`
        SELECT to_jsonb(e.*) AS ligne FROM main.personne_affectations_emploi e
        WHERE e.structure_administrative_id = ${idAbsorbee}
      `,
      async () =>
        tx.$executeRaw`DELETE FROM main.personne_affectations_emploi WHERE structure_administrative_id = ${idAbsorbee}`
    )
  }

  // Depuis la bascule ADR-002, les tables coop référencent la SA par son id int (colonnes dual-write
  // `structure_employeuse_main_id` / `structure_main_id`, renommage possible à l'échange final —
  // repasse prévue sur les scripts coop définitifs). Sans repointage, la coop continuerait de
  // pointer une structure soft-deleted. Détection des colonnes à chaud : no-op tant que la coop n'a
  // pas déployé, et dans les bases (test) sans schéma coop — l'ordre de déploiement min/coop reste
  // libre. Tables possédées par la coop (volumes jusqu'à plusieurs milliers d'activités par
  // structure) : hors journal min__evenements, tracées en compteurs dans structure_merge_log.
  async #repointerReferencesCoop(
    tx: Prisma.TransactionClient,
    idSurvivante: number,
    idAbsorbee: number
  ): Promise<Record<string, number>> {
    const colonnes = await tx.$queryRaw<Array<{ nom: string }>>`
      SELECT table_name || '.' || column_name AS nom
      FROM information_schema.columns
      WHERE table_schema = 'coop'
        AND (table_name, column_name) IN (
          ('activites', 'structure_employeuse_main_id'),
          ('employes_structures', 'structure_main_id')
        )
    `
    const presentes = new Set(colonnes.map(({ nom }) => nom))
    const compteurs: Record<string, number> = {}
    if (presentes.has('activites.structure_employeuse_main_id')) {
      compteurs.coop_activites_repointees = await tx.$executeRaw`
        UPDATE coop.activites SET structure_employeuse_main_id = ${idSurvivante}
        WHERE structure_employeuse_main_id = ${idAbsorbee}
      `
    }
    if (presentes.has('employes_structures.structure_main_id')) {
      compteurs.coop_employes_structures_repointes = await tx.$executeRaw`
        UPDATE coop.employes_structures SET structure_main_id = ${idSurvivante}
        WHERE structure_main_id = ${idAbsorbee}
      `
    }

    return compteurs
  }
}

interface LigneStructure {
  deleted_at: Date | null
  denomination_antenne: null | string
  id: number
  ridet: null | string
  rna: null | string
  siret: null | string
  snapshot: Prisma.JsonValue
  structure_coop_id: null | string
}

// Identifiants de l'absorbée perdus par la fusion → tracés dans le journal. Identité (siret/ridet/
// rna) : la survivante garde les siens. Uuid coop : abandonné seulement quand la survivante porte
// déjà le sien (sinon transféré, donc absent d'ici). Les ids de source tp/ac restent transférés.
function identifiantsAbandonnes(absorbee: LigneStructure, survivante: LigneStructure): Record<string, null | string> {
  const coopAbandonne = absorbee.structure_coop_id !== null && survivante.structure_coop_id !== null

  return {
    ridet: absorbee.ridet,
    rna: absorbee.rna,
    siret: absorbee.siret,
    structure_coop_id: coopAbandonne ? absorbee.structure_coop_id : null,
  }
}
