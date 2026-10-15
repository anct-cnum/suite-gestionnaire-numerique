import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaLieuxInclusionSimilairesLoader } from './PrismaLieuxInclusionSimilairesLoader'
import { creerUnePersonne, creerUnePersonneAffectation } from './testHelper'
import prisma from '../../prisma/prismaClient'

// Lieux déjà déclarés à l'adresse saisie pendant la création d'un lieu (#1495) :
// même clef BAN, et rien d'autre. Données namespacées.
const COMMUNE = 'Testville 1495 similaires'
const CLEF_INTEROP = '75198_0001_00001'
const IDS = [992101, 992102, 992103]

describe('lieux d’inclusion déjà déclarés à une adresse (loader Prisma)', () => {
  let personnesIds: Array<number> = []

  beforeEach(async () => {
    const adresse = await prisma.adresse.create({
      data: {
        clef_interop: CLEF_INTEROP,
        code_insee: '75198',
        code_postal: '75098',
        nom_commune: COMMUNE,
        nom_voie: 'Rue Similaire',
      },
    })
    await prisma.main_lieu_inclusion.createMany({
      data: [
        {
          adresse_id: adresse.id,
          id: 992101,
          nom: 'Médiathèque Georges Brassens',
          siret_a_l_enrichissement: '11111111111111',
          typologies: ['BIB', 'CCAS'],
        },
        {
          adresse_id: adresse.id,
          deleted_at: new Date('2026-01-01'),
          id: 992102,
          nom: 'Lieu test 1495 supprimé',
        },
        {
          adresse_id: adresse.id,
          id: 992103,
          nom: 'Espace France Services',
        },
      ],
    })

    // Deux personnes sur le même lieu, dont une affectée deux fois (sources
    // différentes) : le décompte doit en voir deux, pas trois.
    const premiere = await creerUnePersonne()
    const seconde = await creerUnePersonne()
    const inactive = await creerUnePersonne()
    personnesIds = [premiere, seconde, inactive]
    await creerUnePersonneAffectation({
      personne_id: premiere,
      source: 'coop',
      structure_id: 992101,
      type: 'lieu_activite',
    })
    await creerUnePersonneAffectation({
      personne_id: premiere,
      source: 'carto',
      structure_id: 992101,
      type: 'lieu_activite',
    })
    await creerUnePersonneAffectation({ personne_id: seconde, structure_id: 992101, type: 'lieu_activite' })
    await creerUnePersonneAffectation({
      est_active: false,
      personne_id: inactive,
      structure_id: 992101,
      type: 'lieu_activite',
    })
  })

  afterEach(async () => {
    await prisma.main_personne_affectations_lieu.deleteMany({ where: { lieu_id: { in: IDS } } })
    await prisma.personne.deleteMany({ where: { id: { in: personnesIds } } })
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: IDS } } })
    await prisma.adresse.deleteMany({ where: { nom_commune: COMMUNE } })
  })

  it('retrouve les lieux vivants à la même adresse, avec typologies, SIRET et personnes rattachées', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({ clefInterop: CLEF_INTEROP })

    // THEN
    expect(lieux).toStrictEqual([
      {
        adresse: 'Rue Similaire 75098 Testville 1495 similaires',
        id: '992103',
        nom: 'Espace France Services',
        nombrePersonnesRattachees: 0,
        siret: null,
        typologies: [],
      },
      {
        adresse: 'Rue Similaire 75098 Testville 1495 similaires',
        id: '992101',
        nom: 'Médiathèque Georges Brassens',
        nombrePersonnesRattachees: 2,
        siret: '11111111111111',
        typologies: ['BIB', 'CCAS'],
      },
    ])
  })

  it('ne renvoie rien pour une adresse sans lieu déclaré', async () => {
    // WHEN
    const lieux = await new PrismaLieuxInclusionSimilairesLoader().rechercher({ clefInterop: '75198_9999_00009' })

    // THEN
    expect(lieux).toStrictEqual([])
  })
})
