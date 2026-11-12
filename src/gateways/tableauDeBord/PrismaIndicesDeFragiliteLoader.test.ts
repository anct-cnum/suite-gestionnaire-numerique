import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaIndicesDeFragiliteLoader } from './PrismaIndicesDeFragiliteLoader'
import prisma from '../../../prisma/prismaClient'

describe('indices de fragilité loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('les communes d’un département portent leur nom, celles sans indice restent présentes avec un indice non disponible', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaIndicesDeFragiliteLoader().getForDepartement('69')

    // THEN
    expect(trierParCode(readModel)).toStrictEqual([
      { codeInsee: '69123', ifn: null, nom: 'Lyon' },
      { codeInsee: '69152', ifn: 3.25, nom: undefined },
      { codeInsee: '69456', ifn: 7.08, nom: 'Belleville-en-Beaujolais' },
    ])
  })

  it('les communes demandées sont toutes retournées, avec un indice non disponible quand il manque', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaIndicesDeFragiliteLoader().getForCommunes(['69456', '69123'])

    // THEN
    expect(trierParCode(readModel)).toStrictEqual([
      { codeInsee: '69123', ifn: null, nom: 'Lyon' },
      { codeInsee: '69456', ifn: 7.08, nom: 'Belleville-en-Beaujolais' },
    ])
  })

  it('les départements d’une région portent leur nom, ceux sans indice restent présents avec un indice non disponible', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaIndicesDeFragiliteLoader().getForDepartements(['69', '75'])

    // THEN
    expect(trierParCode(readModel)).toStrictEqual([
      { codeDepartement: '69', ifn: 4.73, nom: 'Rhône' },
      { codeDepartement: '75', ifn: null, nom: 'Paris' },
    ])
  })

  it('au niveau national, un département sans indice reste présent sans compter dans les statistiques', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaIndicesDeFragiliteLoader().getForFrance()

    // THEN
    expect(readModel).toStrictEqual({
      departements: [
        { codeDepartement: '69', ifn: 4.73, indiceConfiance: null, nom: 'Rhône' },
        { codeDepartement: '75', ifn: null, indiceConfiance: null, nom: 'Paris' },
      ],
      statistiquesicp: { appuinecessaire: 0, atteignable: 0, compromis: 0, nonenregistres: 1, securise: 0 },
    })
  })
})

function trierParCode<T extends Readonly<{ codeDepartement: string }> | Readonly<{ codeInsee: string }>>(
  readModel: Readonly<{ message: string; type: 'error' }> | ReadonlyArray<T>
): ReadonlyArray<T> {
  if ('type' in readModel) {
    throw new Error(readModel.message)
  }
  return readModel.toSorted((zoneA, zoneB) => codeDe(zoneA).localeCompare(codeDe(zoneB)))
}

function codeDe(zone: Readonly<{ codeDepartement: string }> | Readonly<{ codeInsee: string }>): string {
  return 'codeInsee' in zone ? zone.codeInsee : zone.codeDepartement
}

async function creerLesTerritoires(): Promise<void> {
  await prisma.$executeRaw`INSERT INTO admin.region (geom, code, nom)
    VALUES
      (public.ST_GeomFromText('MULTIPOLYGON(((4 44,4 46,8 46,4 44)))', 4326), '84', 'Auvergne-Rhône-Alpes'),
      (public.ST_GeomFromText('MULTIPOLYGON(((2 48,2 49,3 49,2 48)))', 4326), '11', 'Île-de-France')`
  await prisma.$executeRaw`INSERT INTO admin.departement (geom, region_id, code, nom)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4 44,4 46,8 46,4 44)))', 4326),
        (SELECT id FROM admin.region WHERE code = '84'),
        '69',
        'Rhône'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((2 48,2 49,3 49,2 48)))', 4326),
        (SELECT id FROM admin.region WHERE code = '11'),
        '75',
        'Paris'
      )`
  await prisma.$executeRaw`INSERT INTO admin.commune (geom, departement_id, code_insee, nom)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4.6 46.1,4.6 46.2,4.7 46.2,4.6 46.1)))', 4326),
        (SELECT id FROM admin.departement WHERE code = '69'),
        '69456',
        'Belleville-en-Beaujolais'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4.8 45.7,4.8 45.8,4.9 45.8,4.8 45.7)))', 4326),
        (SELECT id FROM admin.departement WHERE code = '69'),
        '69123',
        'Lyon'
      )`
  // 69152 : commune fusionnée, absente du référentiel des communes mais toujours présente dans l’indice
  await prisma.ifnCommune.createMany({
    data: [
      { codeInsee: '69456', score: 7.08 },
      { codeInsee: '69152', score: 3.25 },
    ],
  })
  await prisma.ifn_departement.create({ data: { code: '69', score: 4.73 } })
}
