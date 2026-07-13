import prisma from '../../prisma/prismaClient'
import {
  MembreAConsoliderReadModel,
  MembresAConsoliderLoader,
  MembresAConsoliderReadModel,
} from '@/use-cases/queries/RechercherMembresAConsolider'

export class PrismaMembresAConsoliderLoader implements MembresAConsoliderLoader {
  async membres(): Promise<MembresAConsoliderReadModel> {
    const lignes = await this.#detecter()

    return lignes.map(versReadModel)
  }

  // Empreinte opérationnelle (op) = postes + contrats + affectations + lieux portés par la SA.
  // - `sa`     : SA actives avec un SIRET, op calculée.
  // - `terrain`: par SIREN, la SA d'op maximale (l'établissement réel) — le winner proposé.
  // On retient le membre dont la SA actuelle est une antenne sans terrain (op = 0) alors que le
  // terrain existe ailleurs dans le même SIREN, hors mauvaise entité (garde ci-dessous).
  async #detecter(): Promise<ReadonlyArray<LigneMembre>> {
    return prisma.$queryRaw<Array<LigneMembre>>`
      WITH sa AS (
        SELECT
          s.id,
          LEFT(s.siret, 9) AS siren,
          s.siret,
          s.denomination_sirene,
          s.denomination_antenne,
          (
              (SELECT COUNT(*) FROM main.poste p WHERE p.structure_id = s.id)
            + (SELECT COUNT(*) FROM main.contrat c WHERE c.structure_id = s.id)
            + (SELECT COUNT(*) FROM main.personne_affectations_emploi a
               WHERE a.structure_administrative_id = s.id)
          )::int AS op
        FROM main.structure_administrative s
        WHERE s.deleted_at IS NULL AND s.siret ~ '^[0-9]{9}'
      ),
      siren_sa AS (
        SELECT siren, COUNT(*)::int AS nb_sa, STRING_AGG(id::text, ',' ORDER BY id) AS sa_ids
        FROM sa
        GROUP BY siren
      ),
      terrain AS (
        SELECT DISTINCT ON (siren)
          siren,
          id AS terrain_id,
          denomination_sirene AS terrain_denomination,
          denomination_antenne AS terrain_antenne,
          op AS terrain_op
        FROM sa
        WHERE op > 0
        ORDER BY siren, op DESC, id
      )
      SELECT
        m.id AS membre_id,
        m.nom AS membre_nom,
        m.gouvernance_departement_code AS departement_gouvernance,
        m.is_coporteur AS est_coporteur,
        cur.id AS sa_actuelle_id,
        cur.denomination_sirene AS sa_actuelle_denomination,
        cur.denomination_antenne AS sa_actuelle_antenne,
        t.terrain_id AS sa_terrain_id,
        t.terrain_denomination AS sa_terrain_denomination,
        t.terrain_antenne AS sa_terrain_antenne,
        t.terrain_op AS sa_terrain_op,
        cur.siren,
        ss.nb_sa,
        ss.sa_ids
      FROM min.membre m
      JOIN sa cur ON cur.id = m.structure_id
      JOIN siren_sa ss ON ss.siren = cur.siren
      JOIN terrain t ON t.siren = cur.siren
      WHERE cur.op = 0
        AND cur.denomination_antenne IS NOT NULL
        AND t.terrain_id <> cur.id
        AND NOT (
             (m.id ~ '^structure-[0-9]{14}-'
               AND LEFT((regexp_match(m.id, '^structure-([0-9]{14})-'))[1], 9) <> cur.siren)
          OR (m.id ~ '^epci-[0-9]{9}-'
               AND (regexp_match(m.id, '^epci-([0-9]{9})-'))[1] <> cur.siren)
          OR (m.id ~ '^departement-[0-9]'
               AND LEFT(cur.siret, 2) = '22'
               AND SUBSTR(cur.siret, 3, 2) <> LPAD((regexp_match(m.id, '^departement-([0-9]{2,3})-'))[1], 2, '0'))
          OR (m.id ~ '^commune-' AND cur.siret NOT LIKE '21%')
        )
      ORDER BY t.terrain_op DESC, m.id
    `
  }
}

// Ligne brute renvoyée par le SQL de détection (snake_case).
interface LigneMembre {
  departement_gouvernance: null | string
  est_coporteur: boolean
  membre_id: string
  membre_nom: null | string
  nb_sa: number
  sa_actuelle_antenne: null | string
  sa_actuelle_denomination: null | string
  sa_actuelle_id: number
  sa_ids: string
  sa_terrain_antenne: null | string
  sa_terrain_denomination: null | string
  sa_terrain_id: number
  sa_terrain_op: number
  siren: null | string
}

function versReadModel(ligne: LigneMembre): MembreAConsoliderReadModel {
  return {
    departementGouvernance: ligne.departement_gouvernance,
    estCoporteur: ligne.est_coporteur,
    membreId: ligne.membre_id,
    membreNom: ligne.membre_nom,
    nbSaDuSiren: ligne.nb_sa,
    saActuelleAntenne: ligne.sa_actuelle_antenne,
    saActuelleDenomination: ligne.sa_actuelle_denomination,
    saActuelleId: ligne.sa_actuelle_id,
    saIdsDuSiren: ligne.sa_ids,
    saTerrainAntenne: ligne.sa_terrain_antenne,
    saTerrainDenomination: ligne.sa_terrain_denomination,
    saTerrainId: ligne.sa_terrain_id,
    saTerrainOp: ligne.sa_terrain_op,
    siren: ligne.siren,
  }
}
