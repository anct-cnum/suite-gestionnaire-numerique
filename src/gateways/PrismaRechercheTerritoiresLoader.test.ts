import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaRechercheTerritoiresLoader } from './PrismaRechercheTerritoiresLoader'
import prisma from '../../prisma/prismaClient'

describe('recherche territoires loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('la recherche est insensible à la casse et aux accents et retourne régions, départements puis EPCI triés par nom', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('SAONE', 10, { type: 'complet' })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [
        {
          code: '70',
          nom: 'Haute-Saône',
          numeroDepartement: '70',
          type: 'departement',
        },
        {
          code: '71',
          nom: 'Saône-et-Loire',
          numeroDepartement: '71',
          type: 'departement',
        },
        {
          code: '200071371',
          nom: 'CC Saône Doubs Bresse',
          numeroDepartement: '71',
          type: 'epci',
        },
        {
          code: '246900682',
          nom: 'CC Saône-Beaujolais',
          numeroDepartement: '69',
          type: 'epci',
        },
      ],
      total: 4,
    })
  })

  it('quand il y a plus de résultats que la limite alors seuls les premiers sont retournés avec le total exact', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('saône', 2, { type: 'complet' })

    // THEN
    expect(readModel.territoires).toStrictEqual([
      {
        code: '70',
        nom: 'Haute-Saône',
        numeroDepartement: '70',
        type: 'departement',
      },
      {
        code: '71',
        nom: 'Saône-et-Loire',
        numeroDepartement: '71',
        type: 'departement',
      },
    ])
    expect(readModel.total).toBe(4)
  })

  it('quand le terme correspond à un début de code alors le territoire est retourné sans matcher l’intérieur des codes EPCI', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('71', 10, { type: 'complet' })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [
        {
          code: '71',
          nom: 'Saône-et-Loire',
          numeroDepartement: '71',
          type: 'departement',
        },
      ],
      total: 1,
    })
  })

  it('quand le terme correspond au début d’un code EPCI alors l’EPCI est retourné', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('2469', 10, { type: 'complet' })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [
        {
          code: '246900682',
          nom: 'CC Saône-Beaujolais',
          numeroDepartement: '69',
          type: 'epci',
        },
      ],
      total: 1,
    })
  })

  it('quand une région correspond alors elle est retournée avant les départements et sans numéro de département', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('bourgogne', 10, { type: 'complet' })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [
        {
          code: '27',
          nom: 'Bourgogne-Franche-Comté',
          numeroDepartement: null,
          type: 'region',
        },
      ],
      total: 1,
    })
  })

  it('quand le périmètre est limité à des départements alors les régions sont exclues et seuls les départements et EPCI du périmètre sont retournés', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('saône', 10, {
      codesDepartement: ['71'],
      type: 'departements',
    })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [
        {
          code: '71',
          nom: 'Saône-et-Loire',
          numeroDepartement: '71',
          type: 'departement',
        },
        {
          code: '200071371',
          nom: 'CC Saône Doubs Bresse',
          numeroDepartement: '71',
          type: 'epci',
        },
      ],
      total: 2,
    })
  })

  it('quand le périmètre est limité à des départements alors une région correspondante n’est pas retournée', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('bourgogne', 10, {
      codesDepartement: ['70', '71'],
      type: 'departements',
    })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [],
      total: 0,
    })
  })

  it('quand le périmètre est limité à des départements alors un EPCI sans département de rattachement n’est pas retourné', async () => {
    // GIVEN
    await creerLesTerritoires()
    await prisma.$executeRaw`INSERT INTO admin.epci (geom, code, type, nom, departement_id)
      VALUES
        (
          public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
          '200099999',
          'Communauté de communes',
          'CC Saône Orpheline',
          NULL
        )`

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('orpheline', 10, {
      codesDepartement: ['70', '71'],
      type: 'departements',
    })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [],
      total: 0,
    })
  })

  it('quand aucun territoire ne correspond alors aucun territoire n’est retourné', async () => {
    // GIVEN
    await creerLesTerritoires()

    // WHEN
    const readModel = await new PrismaRechercheTerritoiresLoader().rechercher('saonne', 10, { type: 'complet' })

    // THEN
    expect(readModel).toStrictEqual({
      territoires: [],
      total: 0,
    })
  })
})

async function creerLesTerritoires(): Promise<void> {
  await prisma.$executeRaw`INSERT INTO admin.region (geom, code, nom)
    VALUES
      (public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326), '27', 'Bourgogne-Franche-Comté'),
      (public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326), '84', 'Auvergne-Rhône-Alpes')`
  await prisma.$executeRaw`INSERT INTO admin.departement (geom, region_id, code, nom)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        (SELECT id FROM admin.region WHERE code = '27'),
        '70',
        'Haute-Saône'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        (SELECT id FROM admin.region WHERE code = '27'),
        '71',
        'Saône-et-Loire'
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        (SELECT id FROM admin.region WHERE code = '84'),
        '69',
        'Rhône'
      )`
  await prisma.$executeRaw`INSERT INTO admin.epci (geom, code, type, nom, departement_id)
    VALUES
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        '246900682',
        'Communauté de communes',
        'CC Saône-Beaujolais',
        (SELECT id FROM admin.departement WHERE code = '69')
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        '200071371',
        'Communauté de communes',
        'CC Saône Doubs Bresse',
        (SELECT id FROM admin.departement WHERE code = '71')
      ),
      (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        '200040590',
        'Communauté de communes',
        'CC du Grand Autunois Morvan',
        (SELECT id FROM admin.departement WHERE code = '71')
      )`
}
