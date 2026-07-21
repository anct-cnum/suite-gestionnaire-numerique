import { Prisma } from '@prisma/client'

import { deplacerNotionsDansTransaction, soumettreSoftDelete, TOUTES_NOTIONS } from './shared/deplacerNotions'
import { journaliserDeleteBrut, journaliserUpdateBrut } from './shared/journalisationMin'
import prisma from '../../prisma/prismaClient'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { Fusion, FusionFailure, StructureFusionRepository } from '@/use-cases/commands/FusionnerStructures'

// Fusion = déplacer les 6 notions de l'absorbée vers la survivante (via le moteur partagé, qui
// transfère aussi les ids de source coop/tp/ac — c'est le correctif du bug d'abandon), balayer les
// FK résiduelles non rattachées à une notion (affectations source='min'…), puis soft-delete
// l'absorbée. La survivante conserve TOUS ses champs descriptifs (aucun import depuis l'absorbée).
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
      SELECT id, deleted_at, denomination_antenne, siret, ridet, rna, to_jsonb(sa.*) AS snapshot
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
    await soumettreSoftDelete(tx, idAbsorbee, parUtilisateur)
    await this.#journaliserSucces(tx, fusion, survivante, absorbee)

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
    absorbee: LigneStructure
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
        ${JSON.stringify(identifiantsAbandonnes(absorbee))}::jsonb
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
}

interface LigneStructure {
  deleted_at: Date | null
  denomination_antenne: null | string
  id: number
  ridet: null | string
  rna: null | string
  siret: null | string
  snapshot: Prisma.JsonValue
}

// Identifiants d'IDENTITÉ de l'absorbée, perdus par la fusion (la survivante garde les siens) →
// tracés dans le journal. Les ids de SOURCE (coop/tp/ac) n'y figurent plus : ils sont transférés.
function identifiantsAbandonnes(absorbee: LigneStructure): Record<string, null | string> {
  return {
    ridet: absorbee.ridet,
    rna: absorbee.rna,
    siret: absorbee.siret,
  }
}
