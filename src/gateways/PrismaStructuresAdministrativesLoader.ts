import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import {
  ColonneTriable,
  FiltresListeStructuresAdministratives,
  RecupererStructuresAdministrativesPort,
  RecupererStructuresAdministrativesReadModel,
  StructureAdministrativeItem,
} from '@/use-cases/queries/RecupererStructuresAdministratives'

// Page bêta-testeur : liste des structures administratives pour
// aider à comprendre et assainir les données (doublons, mauvaises données,
// fusions). Le nombre de personnes employées croise les affectations emploi
// actives (main.personne_affectations_emploi) et les médiateurs Coop sans
// affectation (min.personne_enrichie.structure_employeuse_id), comme le fait
// le scope structure de PrismaListeLieuxInclusionLoader.
export class PrismaStructuresAdministrativesLoader implements RecupererStructuresAdministrativesPort {
  async getStructures(
    filtres: FiltresListeStructuresAdministratives
  ): Promise<RecupererStructuresAdministrativesReadModel> {
    const { pagination } = filtres
    const whereConditions = this.buildWhereConditions(filtres)
    const orderBy = this.buildOrderBy(filtres.tri)
    const limitOffset = Prisma.sql`OFFSET ${pagination.page * pagination.limite} FETCH NEXT ${pagination.limite} ROWS ONLY`

    const [total, structures] = await Promise.all([
      this.queryTotal(whereConditions),
      this.queryStructures(whereConditions, orderBy, limitOffset),
    ])

    return {
      limite: pagination.limite,
      page: pagination.page,
      structures,
      total,
    }
  }

  // Le tri s'applique sur la requête enveloppée afin de pouvoir référencer les
  // colonnes calculées (compteurs de rattachements, personnes employées).
  // Whitelist stricte : aucune valeur utilisateur n'est injectée dans l'ORDER BY.
  private buildOrderBy(tri: FiltresListeStructuresAdministratives['tri']): Prisma.Sql {
    // TRIM : certaines dénominations ont des espaces parasites en tête qui faussent l'ordre alphabétique.
    if (tri === undefined) {
      return Prisma.sql`ORDER BY TRIM(denomination_sirene) ASC NULLS LAST, TRIM(nom_commune) ASC NULLS LAST, id ASC`
    }

    const colonnes: Readonly<Record<ColonneTriable, Prisma.Sql>> = {
      commune: Prisma.sql`TRIM(nom_commune)`,
      nom: Prisma.sql`TRIM(denomination_sirene)`,
      personnesEmployees: Prisma.sql`nb_personnes_employees`,
      rattachements: Prisma.sql`(nb_utilisateurs_min + nb_membres_min + nb_postes + nb_contrats
        + nb_affectations_emploi + nb_contacts + nb_associations_lieux)`,
    }
    const ordre = tri.ordre === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`

    return Prisma.sql`ORDER BY ${colonnes[tri.colonne]} ${ordre} NULLS LAST, id ASC`
  }

  private buildWhereConditions(filtres: FiltresListeStructuresAdministratives): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    // Recherches partielles insensibles à la casse : une entrée par champ texte.
    const filtresTexte: ReadonlyArray<Readonly<{ colonne: Prisma.Sql; valeur?: string }>> = [
      { colonne: Prisma.sql`sa.siret`, valeur: filtres.siret },
      { colonne: Prisma.sql`sa.rna`, valeur: filtres.rna },
      { colonne: Prisma.sql`sa.ridet`, valeur: filtres.ridet },
      { colonne: Prisma.sql`sa.structure_coop_id::text`, valeur: filtres.coop },
      { colonne: Prisma.sql`sa.structure_tp_id::text`, valeur: filtres.idposte },
      { colonne: Prisma.sql`sa.structure_ac_id::text`, valeur: filtres.aidantsConnect },
      { colonne: Prisma.sql`a.nom_commune`, valeur: filtres.commune },
    ]
    for (const { colonne, valeur } of filtresTexte) {
      if (valeur !== undefined && valeur !== '') {
        const pattern = `%${valeur}%`
        conditions.push(Prisma.sql`${colonne} ILIKE ${pattern}`)
      }
    }

    if (filtres.nom !== undefined && filtres.nom !== '') {
      const patternNom = `%${filtres.nom}%`
      conditions.push(Prisma.sql`(
        sa.denomination_sirene ILIKE ${patternNom}
        OR sa.denomination_antenne ILIKE ${patternNom}
      )`)
    }
    if (filtres.departement !== undefined && filtres.departement !== '') {
      conditions.push(Prisma.sql`a.departement = ${filtres.departement}`)
    }
    if (filtres.adresse === 'sans') {
      conditions.push(Prisma.sql`sa.adresse_id IS NULL`)
    }
    if (filtres.adresse === 'avec') {
      conditions.push(Prisma.sql`sa.adresse_id IS NOT NULL`)
    }
    // Canonique = image INSEE de référence (denomination_antenne IS NULL), antenne = déclinaison locale.
    if (filtres.type === 'canonique') {
      conditions.push(Prisma.sql`sa.denomination_antenne IS NULL`)
    }
    if (filtres.type === 'antenne') {
      conditions.push(Prisma.sql`sa.denomination_antenne IS NOT NULL`)
    }
    // Gouvernance = membre confirmé dans min.membre (même définition que PrismaStructureLoader).
    if (filtres.gouvernance === 'gouvernance') {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM min.membre mf WHERE mf.structure_id = sa.id AND mf.statut = 'confirme')`
      )
    }
    if (filtres.gouvernance === 'horsGouvernance') {
      conditions.push(
        Prisma.sql`NOT EXISTS (SELECT 1 FROM min.membre mf WHERE mf.structure_id = sa.id AND mf.statut = 'confirme')`
      )
    }

    return conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  }

  private async queryStructures(
    whereConditions: Prisma.Sql,
    orderBy: Prisma.Sql,
    limitOffset: Prisma.Sql
  ): Promise<Array<StructureAdministrativeItem>> {
    return prisma.$queryRaw<Array<StructureAdministrativeItem>>`
      SELECT * FROM (
      SELECT
        sa.id,
        sa.siret,
        sa.rna,
        sa.ridet,
        sa.denomination_sirene,
        sa.denomination_antenne,
        sa.structure_coop_id,
        sa.structure_tp_id,
        sa.structure_ac_id,
        ref.nom AS categorie_juridique,
        a.numero_voie,
        a.nom_voie,
        a.code_postal,
        a.nom_commune,
        EXISTS (
          SELECT 1 FROM audit.structure_merge_log ml
          WHERE ml.winner_id = sa.id AND ml.status = 'SUCCESS' AND ml.dag_id = 'min-ui'
        ) AS deja_fusionnee,
        -- Gouvernance = membre confirmé dans min.membre (même définition que la recherche de structures).
        EXISTS (
          SELECT 1 FROM min.membre mf
          WHERE mf.structure_id = sa.id AND mf.statut = 'confirme'
        ) AS est_gouvernance,
        -- Rattachements : mêmes 7 compteurs que la détection de doublons
        -- (PrismaStructuresDoublonsLoader) pour mesurer le « poids » de la structure.
        (SELECT COUNT(*) FROM min.utilisateur u WHERE u.structure_id = sa.id)::int AS nb_utilisateurs_min,
        (SELECT COUNT(*) FROM min.membre m WHERE m.structure_id = sa.id)::int AS nb_membres_min,
        (SELECT COUNT(*) FROM main.poste p WHERE p.structure_id = sa.id)::int AS nb_postes,
        (SELECT COUNT(*) FROM main.contrat ct WHERE ct.structure_id = sa.id)::int AS nb_contrats,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id)::int AS nb_affectations_emploi,
        (SELECT COUNT(*) FROM main.contact_structure_administrative cs
         WHERE cs.structure_administrative_id = sa.id)::int AS nb_contacts,
        (SELECT COUNT(*) FROM main.lieu_inclusion_structure_administrative li
         WHERE li.structure_administrative_id = sa.id)::int AS nb_associations_lieux,
        COALESCE(emp.nb, 0) AS nb_personnes_employees
      FROM main.structure_administrative sa
      LEFT JOIN main.adresse a ON a.id = sa.adresse_id
      LEFT JOIN reference.categories_juridiques ref ON ref.code = sa.categorie_juridique
      -- Personnes employées pré-agrégées en un seul passage : min.personne_enrichie est une VUE,
      -- une sous-requête corrélée la ré-exécuterait pour chaque ligne (tri sur colonne calculée
      -- = 11 500 exécutions, plusieurs minutes). Ici la vue n'est évaluée qu'une fois.
      LEFT JOIN (
        SELECT structure_id, COUNT(*)::int AS nb
        FROM (
          SELECT pae.structure_administrative_id AS structure_id, pae.personne_id
          FROM main.personne_affectations_emploi pae
          WHERE pae.est_active = true
          UNION
          SELECT pe.structure_employeuse_id, pe.id
          FROM min.personne_enrichie pe
          WHERE pe.structure_employeuse_id IS NOT NULL
        ) personnes
        GROUP BY structure_id
      ) emp ON emp.structure_id = sa.id
      WHERE sa.deleted_at IS NULL
        ${whereConditions}
      ) structures
      ${orderBy}
      ${limitOffset}
    `
  }

  private async queryTotal(whereConditions: Prisma.Sql): Promise<number> {
    const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) AS total
      FROM main.structure_administrative sa
      LEFT JOIN main.adresse a ON a.id = sa.adresse_id
      WHERE sa.deleted_at IS NULL
        ${whereConditions}
    `

    return Number(result[0]?.total ?? 0)
  }
}
