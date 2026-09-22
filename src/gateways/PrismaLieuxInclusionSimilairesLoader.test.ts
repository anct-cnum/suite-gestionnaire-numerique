import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaLieuxInclusionSimilairesLoader } from './PrismaLieuxInclusionSimilairesLoader'
import prisma from '../../prisma/prismaClient'

// Lieux existants aux alentours d'un lieu en cours de création (#1495) : même SIRET,
// même adresse BAN, ou nom proche dans la même commune. Données namespacées.
const COMMUNE = 'Testville 1495 similaires'
const CODE_INSEE = '75198'

describe('lieux d’inclusion similaires (loader Prisma)', () => {
  let adresseId = 0

  beforeEach(async () => {
    const adresse = await prisma.adresse.create({
      data: {
        clef_interop: '75198_0001_00001',
        code_insee: CODE_INSEE,
        code_postal: '75098',
        nom_commune: COMMUNE,
        nom_voie: 'Rue Similaire',
      },
    })
    adresseId = adresse.id
    await prisma.main_lieu_inclusion.createMany({
      data: [
        {
          adresse_id: adresseId,
          id: 992101,
          nom: 'Médiathèque Georges Brassens',
          siret_a_l_enrichissement: '11111111111111',
        },
        {
          adresse_id: adresseId,
          deleted_at: new Date('2026-01-01'),
          id: 992102,
          nom: 'Lieu test 1495 supprimé',
          siret_a_l_enrichissement: '11111111111111',
        },
        {
          adresse_id: adresseId,
          id: 992103,
          nom: 'Espace France Services',
          structure_coop_id: '00000000-0000-4000-8000-000000001495',
        },
      ],
    })
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: [992101, 992102, 992103] } } })
    await prisma.adresse.deleteMany({ where: { nom_commune: COMMUNE } })
  })

  it('retrouve un lieu vivant portant le même SIRET, jamais un lieu supprimé', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({
      clefInterop: null,
      codeInsee: null,
      nom: 'Autre nom',
      siret: '11111111111111',
    })

    // THEN
    expect(lieux).toStrictEqual([
      {
        adresse: 'Rue Similaire 75098 Testville 1495 similaires',
        estLieuCoop: false,
        id: '992101',
        motif: 'siret',
        nom: 'Médiathèque Georges Brassens',
        siret: '11111111111111',
      },
    ])
  })

  it('retrouve les lieux à la même adresse BAN et signale ceux gérés dans la Coop', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({
      clefInterop: '75198_0001_00001',
      codeInsee: null,
      nom: 'Autre nom',
      siret: null,
    })

    // THEN
    expect(lieux.map((lieu) => [lieu.id, lieu.motif, lieu.estLieuCoop])).toStrictEqual([
      ['992103', 'adresse', true],
      ['992101', 'adresse', false],
    ])
  })

  it('retrouve un lieu au nom proche (accents, casse) dans la même commune', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({
      clefInterop: null,
      codeInsee: CODE_INSEE,
      nom: 'mediatheque georges brassens',
      siret: null,
    })

    // THEN
    expect(lieux.map((lieu) => [lieu.id, lieu.motif])).toStrictEqual([['992101', 'nom']])
  })

  it('ne renvoie rien quand aucun critère ne correspond', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({
      clefInterop: '75198_9999_00009',
      codeInsee: CODE_INSEE,
      nom: 'Piscine municipale',
      siret: '99999999999999',
    })

    // THEN
    expect(lieux).toStrictEqual([])
  })
})
