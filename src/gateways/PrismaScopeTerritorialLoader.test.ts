import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaScopeTerritorialLoader } from './PrismaScopeTerritorialLoader'
import prisma from '../../prisma/prismaClient'

describe('scope territorial loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une région existe alors son nom, ses départements triés et sa bounding box sont retournés', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaScopeTerritorialLoader().getRegion('27')

    // THEN
    expect(readModel).toStrictEqual({
      bbox: {
        latitudeMax: 48,
        latitudeMin: 46,
        longitudeMax: 7,
        longitudeMin: 3,
      },
      code: '27',
      codesDepartement: ['70', '71'],
      nom: 'Bourgogne-Franche-Comté',
    })
  })

  it('quand une région n’existe pas alors rien n’est retourné', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaScopeTerritorialLoader().getRegion('99')

    // THEN
    expect(readModel).toBeNull()
  })

  it('quand un EPCI existe alors son nom, les codes INSEE de ses communes triés et sa bounding box sont retournés', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaScopeTerritorialLoader().getEpci('246900682')

    // THEN
    expect(readModel).toStrictEqual({
      bbox: {
        latitudeMax: 46.3,
        latitudeMin: 46.1,
        longitudeMax: 4.8,
        longitudeMin: 4.6,
      },
      code: '246900682',
      codeDepartement: '69',
      codesInsee: ['69123', '69456'],
      nom: 'CC Saône-Beaujolais',
    })
  })

  it('quand un EPCI n’existe pas alors rien n’est retourné', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaScopeTerritorialLoader().getEpci('999999999')

    // THEN
    expect(readModel).toBeNull()
  })
})

async function creerLesTerritoires(): Promise<void> {
  await prisma.$executeRaw`INSERT INTO admin.region (geom, code, nom)
    VALUES
      (public.ST_GeomFromText('MULTIPOLYGON(((3 46,3 48,7 48,3 46)))', 4326), '27', 'Bourgogne-Franche-Comté'),
      (public.ST_GeomFromText('MULTIPOLYGON(((4 44,4 46,8 46,4 44)))', 4326), '84', 'Auvergne-Rhône-Alpes')`
  await prisma.$executeRaw`INSERT INTO admin.departement (geom, region_id, code, nom)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((3 46,3 48,7 48,3 46)))', 4326),
        (SELECT id FROM admin.region WHERE code = '27'),
        '71',
        'Saône-et-Loire'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((3 46,3 48,7 48,3 46)))', 4326),
        (SELECT id FROM admin.region WHERE code = '27'),
        '70',
        'Haute-Saône'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4 44,4 46,8 46,4 44)))', 4326),
        (SELECT id FROM admin.region WHERE code = '84'),
        '69',
        'Rhône'
      )`
  await prisma.$executeRaw`INSERT INTO admin.epci (geom, code, type, nom, departement_id)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4.6 46.1,4.6 46.3,4.8 46.3,4.6 46.1)))', 4326),
        '246900682',
        'Communauté de communes',
        'CC Saône-Beaujolais',
        (SELECT id FROM admin.departement WHERE code = '69')
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
        public.ST_GeomFromText('MULTIPOLYGON(((4.7 46.2,4.7 46.3,4.8 46.3,4.7 46.2)))', 4326),
        (SELECT id FROM admin.departement WHERE code = '69'),
        '69123',
        'Beaujeu'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((4.8 45.7,4.8 45.8,4.9 45.8,4.8 45.7)))', 4326),
        (SELECT id FROM admin.departement WHERE code = '69'),
        '69999',
        'Hors EPCI'
      )`
  await prisma.$executeRaw`INSERT INTO admin.commune_epci (commune_id, epci_id)
    VALUES
      (
        (SELECT id FROM admin.commune WHERE code_insee = '69456'),
        (SELECT id FROM admin.epci WHERE code = '246900682')
      ),
      (
        (SELECT id FROM admin.commune WHERE code_insee = '69123'),
        (SELECT id FROM admin.epci WHERE code = '246900682')
      )`
}
