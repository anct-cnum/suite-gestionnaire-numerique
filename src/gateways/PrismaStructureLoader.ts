import prisma from '../../prisma/prismaClient'
import { StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
  async structures(match: string): Promise<StructuresReadModel> {
    return this.#rechercheFlexible(match)
  }

  async structuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel> {
    return this.#rechercheFlexible(match, 'a.departement = $2', [codeDepartement])
  }

  async structuresByRegion(match: string, codeRegion: string): Promise<StructuresReadModel> {
    const departements = await prisma.departementRecord.findMany({
      select: {
        code: true,
      },
      where: {
        regionCode: codeRegion,
      },
    })

    const codesDepartements = departements.map((departement) => departement.code)

    return this.#rechercheFlexible(match, 'a.departement = ANY($2)', [codesDepartements])
  }

  async #rechercheFlexible(
    match: string,
    whereClause?: string,
    whereParams: ReadonlyArray<ReadonlyArray<string> | string> = []
  ): Promise<StructuresReadModel> {
    const mots = match
      .trim()
      .split(/\s+/)
      .filter((mot) => mot.length > 0)

    if (mots.length === 0) {
      return []
    }

    // Refonte 2026 : recherche sur COALESCE(denomination_antenne, denomination_sirene)
    // de main.structure_administrative. denomination_antenne permet de distinguer
    // les antennes d'un grand reseau partageant le SIRET du siege (Emmaüs
    // Connect, Reconnect Groupe SOS, …). L'indicateur FNE est determine par la
    // presence d'un membre confirme (min.membre au statut « confirme ») pour la
    // structure.
    const conditionsMots = mots
      .map(
        (_, index) =>
          `public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(COALESCE(sa.denomination_antenne, sa.denomination_sirene)))) > 0.3`
      )
      .join(' AND ')

    const scoreCalcul = mots
      .map(
        (_, index) =>
          `public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(COALESCE(sa.denomination_antenne, sa.denomination_sirene))))`
      )
      .join(' + ')
    const scoreMoyen = `(${scoreCalcul}) / ${mots.length}`

    const nbMotsParams = mots.length
    const whereParamsAdjusted =
      whereClause !== undefined && whereClause !== '' ? whereClause.replace(/\$2/g, `$${nbMotsParams + 1}`) : ''

    const whereExtra = whereParamsAdjusted === '' ? '' : `AND ${whereParamsAdjusted}`

    const query = `
      SELECT
        sa.id,
        COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom,
        a.nom_commune as commune,
        EXISTS(SELECT 1 FROM min.membre m WHERE m.structure_id = sa.id) as is_membre,
        EXISTS(
          SELECT 1 FROM min.membre m
          WHERE m.structure_id = sa.id AND m.statut = 'confirme'
        ) as is_fne
      FROM main.structure_administrative sa
      LEFT JOIN main.adresse a ON sa.adresse_id = a.id
      WHERE COALESCE(sa.denomination_antenne, sa.denomination_sirene) IS NOT NULL
        AND (${conditionsMots})
      ${whereExtra}
      ORDER BY ${scoreMoyen} DESC, COALESCE(sa.denomination_antenne, sa.denomination_sirene) ASC
      LIMIT 10
    `

    interface RawResult {
      commune: null | string
      id: number
      is_fne: boolean
      is_membre: boolean
      nom: string
    }

    const params = [...mots, ...whereParams]
    const results = await prisma.$queryRawUnsafe<Array<RawResult>>(query, ...params)

    return results.map((row) => ({
      commune: row.commune ?? '',
      isFne: row.is_fne,
      isMembre: row.is_membre,
      nom: row.nom,
      uid: String(row.id),
    }))
  }
}
