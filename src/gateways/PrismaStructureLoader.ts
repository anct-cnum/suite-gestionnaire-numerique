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

    // Construire la condition : chaque mot doit avoir une bonne similarité avec le nom
    // word_similarity compare un mot à tous les mots d'une chaîne
    const conditionsMots = mots
      .map((_, index) => `public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(s.nom))) > 0.3`)
      .join(' AND ')

    // Calcul du score : moyenne des similarités de chaque mot
    const scoreCalcul = mots
      .map((_, index) => `public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(s.nom)))`)
      .join(' + ')
    const scoreMoyen = `(${scoreCalcul}) / ${mots.length}`

    const nbMotsParams = mots.length
    const whereParamsAdjusted = whereClause !== undefined && whereClause !== ''
      ? whereClause.replace(/\$2/g, `$${nbMotsParams + 1}`)
      : ''

    const whereExtra = whereParamsAdjusted === '' ? '' : `AND ${whereParamsAdjusted}`

    const query = `
      SELECT s.id, s.nom, a.nom_commune as commune
      FROM main.structure s
      LEFT JOIN main.adresse a ON s.adresse_id = a.id
      WHERE (${conditionsMots})
      ${whereExtra}
      ORDER BY ${scoreMoyen} DESC, s.nom ASC
      LIMIT 10
    `

    interface RawResult { commune: null | string; id: number; nom: string }

    const params = [...mots, ...whereParams]
    const results = await prisma.$queryRawUnsafe<Array<RawResult>>(query, ...params)

    return results.map((row) => ({
      commune: row.commune ?? '',
      nom: row.nom,
      uid: String(row.id),
    }))
  }
}
