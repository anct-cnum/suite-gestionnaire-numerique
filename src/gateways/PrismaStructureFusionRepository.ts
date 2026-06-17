import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { Fusion, FusionFailure, StructureFusionRepository } from '@/use-cases/commands/FusionnerStructures'

export class PrismaStructureFusionRepository implements StructureFusionRepository {
  async fusionner(fusion: Fusion): ResultAsync<FusionFailure> {
    try {
      return await prisma.$transaction(async (tx) => this.#fusionnerDansTransaction(tx, fusion))
    } catch (erreur) {
      await this.#journaliserEchec(fusion, erreur)
      return 'fusionEchouee'
    }
  }

  // Fusion des champs informatifs NON-uniques : COALESCE(survivante, absorbée),
  // avec arbitrage explicite de l'admin sur dénomination / antenne / adresse.
  async #fusionnerChampsInformatifs(
    tx: Prisma.TransactionClient,
    fusion: Fusion,
    survivante: LigneStructure,
    absorbee: LigneStructure
  ): Promise<void> {
    const { champsRetenus } = fusion
    const denominationSirene =
      champsRetenus.denominationSirene ?? survivante.denomination_sirene ?? absorbee.denomination_sirene
    const denominationAntenne =
      champsRetenus.denominationAntenne ?? survivante.denomination_antenne ?? absorbee.denomination_antenne
    const adresseId = champsRetenus.adresseId ?? survivante.adresse_id ?? absorbee.adresse_id

    await tx.$executeRaw`
      UPDATE main.structure_administrative w
      SET denomination_sirene = ${denominationSirene},
          denomination_antenne = ${denominationAntenne},
          adresse_id = ${adresseId},
          etat_administratif = COALESCE(w.etat_administratif, l.etat_administratif),
          code_activite_principale = COALESCE(w.code_activite_principale, l.code_activite_principale),
          categorie_juridique = COALESCE(w.categorie_juridique, l.categorie_juridique),
          publique = COALESCE(w.publique, l.publique),
          nb_mandats_ac = COALESCE(w.nb_mandats_ac, l.nb_mandats_ac),
          contact = COALESCE(w.contact, l.contact),
          last_sirene_enrich_at = GREATEST(w.last_sirene_enrich_at, l.last_sirene_enrich_at),
          updated_at = now()
      FROM main.structure_administrative l
      WHERE w.id = ${fusion.idSurvivante} AND l.id = ${fusion.idAbsorbee}
    `
  }

  async #fusionnerDansTransaction(tx: Prisma.TransactionClient, fusion: Fusion): ResultAsync<FusionFailure> {
    const { idAbsorbee, idSurvivante } = fusion

    const lignes = await tx.$queryRaw<Array<LigneStructure>>`
      SELECT id, deleted_at, denomination_sirene, denomination_antenne, adresse_id,
             siret, ridet, rna, structure_coop_id, structure_ac_id, structure_tp_id,
             to_jsonb(sa.*) AS snapshot
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

    await this.#fusionnerChampsInformatifs(tx, fusion, survivante, absorbee)
    await this.#repointerToutesLesFk(tx, idSurvivante, idAbsorbee)
    await this.#soumettreSoftDelete(tx, idAbsorbee, fusion.parUtilisateur)
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

  // Repointe les 7 FK de l'absorbée vers la survivante. Pour les 4 tables à
  // contrainte UNIQUE, on repointe d'abord les lignes non-collisionnantes puis
  // on supprime les lignes restantes de l'absorbée (déjà représentées côté survivante).
  async #repointerToutesLesFk(tx: Prisma.TransactionClient, idSurvivante: number, idAbsorbee: number): Promise<void> {
    // Sans contrainte d'unicité sur la FK → UPDATE direct.
    await tx.$executeRaw`UPDATE min.utilisateur SET structure_id = ${idSurvivante} WHERE structure_id = ${idAbsorbee}`
    await tx.$executeRaw`UPDATE min.membre SET structure_id = ${idSurvivante} WHERE structure_id = ${idAbsorbee}`
    await tx.$executeRaw`UPDATE main.contrat SET structure_id = ${idSurvivante} WHERE structure_id = ${idAbsorbee}`

    // poste : UNIQUE(poste_conum_id, structure_id, personne_id)
    await tx.$executeRaw`
      UPDATE main.poste p SET structure_id = ${idSurvivante}
      WHERE p.structure_id = ${idAbsorbee}
        AND NOT EXISTS (
          SELECT 1 FROM main.poste q
          WHERE q.structure_id = ${idSurvivante}
            AND q.poste_conum_id = p.poste_conum_id
            AND q.personne_id IS NOT DISTINCT FROM p.personne_id
        )
    `
    await tx.$executeRaw`DELETE FROM main.poste WHERE structure_id = ${idAbsorbee}`

    // personne_affectations_emploi : UNIQUE(personne_id, structure_administrative_id, source)
    await tx.$executeRaw`
      UPDATE main.personne_affectations_emploi e SET structure_administrative_id = ${idSurvivante}
      WHERE e.structure_administrative_id = ${idAbsorbee}
        AND NOT EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi f
          WHERE f.structure_administrative_id = ${idSurvivante}
            AND f.personne_id = e.personne_id AND f.source = e.source
        )
    `
    await tx.$executeRaw`DELETE FROM main.personne_affectations_emploi WHERE structure_administrative_id = ${idAbsorbee}`

    // contact_structure_administrative : UNIQUE(structure_administrative_id, contact_id)
    await tx.$executeRaw`
      UPDATE main.contact_structure_administrative c SET structure_administrative_id = ${idSurvivante}
      WHERE c.structure_administrative_id = ${idAbsorbee}
        AND NOT EXISTS (
          SELECT 1 FROM main.contact_structure_administrative d
          WHERE d.structure_administrative_id = ${idSurvivante} AND d.contact_id = c.contact_id
        )
    `
    await tx.$executeRaw`DELETE FROM main.contact_structure_administrative WHERE structure_administrative_id = ${idAbsorbee}`

    // lieu_inclusion_structure_administrative : UNIQUE(lieu_id, structure_administrative_id)
    await tx.$executeRaw`
      UPDATE main.lieu_inclusion_structure_administrative a SET structure_administrative_id = ${idSurvivante}
      WHERE a.structure_administrative_id = ${idAbsorbee}
        AND NOT EXISTS (
          SELECT 1 FROM main.lieu_inclusion_structure_administrative b
          WHERE b.structure_administrative_id = ${idSurvivante} AND b.lieu_id = a.lieu_id
        )
    `
    await tx.$executeRaw`DELETE FROM main.lieu_inclusion_structure_administrative WHERE structure_administrative_id = ${idAbsorbee}`
  }

  async #soumettreSoftDelete(tx: Prisma.TransactionClient, idAbsorbee: number, parUtilisateur: string): Promise<void> {
    await tx.$executeRaw`
      UPDATE main.structure_administrative
      SET deleted_at = now(),
          deleted_by = array_append(COALESCE(deleted_by, '{}'), ${parUtilisateur}),
          updated_at = now()
      WHERE id = ${idAbsorbee}
    `
  }
}

// Identifiants UNIQUE de structure_administrative. Jamais transférés au winner
// (contraintes UNIQUE non partielles : l'absorbée soft-deletée garde sa ligne,
// donc copier son SIRET/RNA/… violerait l'unicité). Consignés dans le journal.
interface LigneStructure {
  adresse_id: null | number
  deleted_at: Date | null
  denomination_antenne: null | string
  denomination_sirene: null | string
  id: number
  ridet: null | string
  rna: null | string
  siret: null | string
  snapshot: Prisma.JsonValue
  structure_ac_id: null | string
  structure_coop_id: null | string
  structure_tp_id: null | number
}

// Identifiants UNIQUE de l'absorbée, perdus par la fusion → tracés dans le journal.
function identifiantsAbandonnes(absorbee: LigneStructure): Record<string, null | number | string> {
  return {
    ridet: absorbee.ridet,
    rna: absorbee.rna,
    siret: absorbee.siret,
    structure_ac_id: absorbee.structure_ac_id,
    structure_coop_id: absorbee.structure_coop_id,
    structure_tp_id: absorbee.structure_tp_id,
  }
}
