import prisma from '../../prisma/prismaClient'
import {
  ScopeEpciReadModel,
  ScopeRegionReadModel,
  ScopeTerritorialLoader,
} from '@/use-cases/queries/RecupererScopeTerritorial'

export class PrismaScopeTerritorialLoader implements ScopeTerritorialLoader {
  async getEpci(code: string): Promise<null | ScopeEpciReadModel> {
    const rows = await prisma.$queryRaw<ReadonlyArray<EpciRow>>`
      SELECT
        epci.nom,
        departement.code AS code_departement,
        public.ST_XMin(epci.geom) AS longitude_min,
        public.ST_XMax(epci.geom) AS longitude_max,
        public.ST_YMin(epci.geom) AS latitude_min,
        public.ST_YMax(epci.geom) AS latitude_max
      FROM admin.epci
      LEFT JOIN admin.departement ON departement.id = epci.departement_id
      WHERE epci.code = ${code}
    `
    if (rows.length === 0) {
      return null
    }
    const communes = await prisma.$queryRaw<ReadonlyArray<Readonly<{ code_insee: string }>>>`
      SELECT commune.code_insee
      FROM admin.commune commune
      INNER JOIN admin.commune_epci ON commune_epci.commune_id = commune.id
      INNER JOIN admin.epci ON epci.id = commune_epci.epci_id
      WHERE epci.code = ${code}
      ORDER BY commune.code_insee
    `
    return {
      bbox: bbox(rows[0]),
      code,
      codeDepartement: rows[0].code_departement,
      codesInsee: communes.map((commune) => commune.code_insee),
      nom: rows[0].nom,
    }
  }

  async getRegion(code: string): Promise<null | ScopeRegionReadModel> {
    const rows = await prisma.$queryRaw<ReadonlyArray<TerritoireRow>>`
      SELECT
        nom,
        public.ST_XMin(geom) AS longitude_min,
        public.ST_XMax(geom) AS longitude_max,
        public.ST_YMin(geom) AS latitude_min,
        public.ST_YMax(geom) AS latitude_max
      FROM admin.region
      WHERE code = ${code}
    `
    if (rows.length === 0) {
      return null
    }
    const departements = await prisma.$queryRaw<ReadonlyArray<Readonly<{ code: string }>>>`
      SELECT departement.code
      FROM admin.departement departement
      INNER JOIN admin.region ON region.id = departement.region_id
      WHERE region.code = ${code}
      ORDER BY departement.code
    `
    return {
      bbox: bbox(rows[0]),
      code,
      codesDepartement: departements.map((departement) => departement.code),
      nom: rows[0].nom,
    }
  }
}

function bbox(row: TerritoireRow): ScopeRegionReadModel['bbox'] {
  return {
    latitudeMax: row.latitude_max,
    latitudeMin: row.latitude_min,
    longitudeMax: row.longitude_max,
    longitudeMin: row.longitude_min,
  }
}

type TerritoireRow = Readonly<{
  latitude_max: number
  latitude_min: number
  longitude_max: number
  longitude_min: number
  nom: string
}>

type EpciRow = Readonly<{
  code_departement: null | string
}> &
  TerritoireRow
