import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaLieuxInclusionNumeriqueLoader } from './PrismaLieuxInclusionNumeriqueLoader'
import prisma from '../../prisma/prismaClient'

// Le compteur « lieux affichés sur la cartographie nationale » doit retenir le
// critère de la vue api.carto, et lui seul : visible pour la cartographie et non
// supprimé. L'identifiant mednum n'entre plus dans la décision (V192, entrepôt de
// données). Données namespacées sur un département fictif pour rester isolées.
const COMMUNE = 'Testville compteur carto'
const CODE_INSEE = '99001'
const DEPARTEMENT = '99'
const IDS = [992201, 992202, 992203, 992204, 992205]

describe('lieux d’inclusion numérique — compteur de la cartographie nationale', () => {
  beforeEach(async () => {
    const adresse = await prisma.adresse.create({
      data: {
        code_insee: CODE_INSEE,
        code_postal: '99000',
        nom_commune: COMMUNE,
        nom_voie: 'Rue du Compteur',
      },
    })
    await prisma.main_lieu_inclusion.createMany({
      data: [
        {
          adresse_id: adresse.id,
          id: 992201,
          nom: 'Lieu visible sans identifiant mednum',
          structure_cartographie_nationale_id: null,
          visible_pour_cartographie_nationale: true,
        },
        {
          adresse_id: adresse.id,
          id: 992202,
          nom: 'Lieu visible avec identifiant mednum',
          structure_cartographie_nationale_id: 'carto-compteur-992202',
          visible_pour_cartographie_nationale: true,
        },
        {
          adresse_id: adresse.id,
          id: 992203,
          nom: 'Lieu masqué de la cartographie',
          structure_cartographie_nationale_id: 'carto-compteur-992203',
          visible_pour_cartographie_nationale: false,
        },
        {
          adresse_id: adresse.id,
          deleted_at: new Date('2026-01-01'),
          id: 992204,
          nom: 'Lieu supprimé',
          structure_cartographie_nationale_id: 'carto-compteur-992204',
          visible_pour_cartographie_nationale: true,
        },
        {
          adresse_id: adresse.id,
          id: 992205,
          nom: 'Lieu sans visibilité renseignée',
          structure_cartographie_nationale_id: 'carto-compteur-992205',
          visible_pour_cartographie_nationale: null,
        },
      ],
    })
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: IDS } } })
    await prisma.adresse.deleteMany({ where: { nom_commune: COMMUNE } })
  })

  it('compte les lieux visibles et vivants, qu’ils portent ou non un identifiant mednum', async () => {
    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

    // THEN
    expect(stats.totalLieuxInclusionNumerique).toStrictEqual([{ nb_lieux_inclusion_numerique: 2 }])
  })

  it('ne compte ni les lieux masqués, ni les lieux supprimés, ni ceux sans visibilité renseignée', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: [992201, 992202] } } })

    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

    // THEN
    expect(stats.totalLieuxInclusionNumerique).toStrictEqual([{ nb_lieux_inclusion_numerique: 0 }])
  })

  it('applique le même critère à une liste de départements', async () => {
    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartementaux([DEPARTEMENT])

    // THEN
    expect(stats.totalLieuxInclusionNumerique).toStrictEqual([{ nb_lieux_inclusion_numerique: 2 }])
  })

  it('applique le même critère à une liste de communes', async () => {
    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getParCommunes([CODE_INSEE])

    // THEN
    expect(stats.totalLieuxInclusionNumerique).toStrictEqual([{ nb_lieux_inclusion_numerique: 2 }])
  })

  it('compte au national les seuls lieux localisés retenus par le critère', async () => {
    // GIVEN
    const loader = new PrismaLieuxInclusionNumeriqueLoader()
    const avant = (await loader.getNational()).totalLieuxInclusionNumerique[0].nb_lieux_inclusion_numerique
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: IDS } } })
    const sansLesLieuxDuTest = (await loader.getNational()).totalLieuxInclusionNumerique[0].nb_lieux_inclusion_numerique

    // THEN
    expect(avant - sansLesLieuxDuTest).toBe(2)
  })

  it('ne compte comme labellisé qu’un lieu portant au moins un dispositif, une liste vide valant « aucun »', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.update({
      data: { dispositif_programmes_nationaux: ['FranceServices'] },
      where: { id: 992201 },
    })
    await prisma.main_lieu_inclusion.update({ data: { dispositif_programmes_nationaux: [] }, where: { id: 992202 } })

    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

    // THEN
    expect(stats.nombreStructuresAvecProgrammeNational).toStrictEqual([{ count: 1 }])
    expect(stats.nombreStructuresAvecFranceServices).toStrictEqual([{ count: 1 }])
  })

  describe('label « Conseillers numériques », dérivé par l’entrepôt (DS-ADR-004)', () => {
    const PERSONNE_ID = 992290
    const SA_ID = 992291

    beforeEach(async () => {
      await prisma.main_structure_administrative.create({ data: { id: SA_ID, siret: '99229100000017' } })
      await prisma.personne.create({ data: { id: PERSONNE_ID, nom: 'Conseiller', prenom: 'Test' } })
      await prisma.main_personne_affectations_lieu.create({
        data: { est_active: true, lieu_id: 992201, personne_id: PERSONNE_ID, source: 'coop' },
      })
    })

    afterEach(async () => {
      await prisma.main_personne_affectations_lieu.deleteMany({ where: { personne_id: PERSONNE_ID } })
      await prisma.main_personne_affectations_emploi.deleteMany({ where: { personne_id: PERSONNE_ID } })
      await prisma.personne.deleteMany({ where: { id: PERSONNE_ID } })
      await prisma.main_structure_administrative.deleteMany({ where: { id: SA_ID } })
    })

    it('compte un lieu où exerce un conseiller en poste, sans label déclaré au registre', async () => {
      // GIVEN
      await prisma.main_personne_affectations_emploi.create({
        data: { est_active: true, personne_id: PERSONNE_ID, source: 'idposte', structure_administrative_id: SA_ID },
      })

      // WHEN
      const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

      // THEN
      expect(stats.nombreStructuresAvecConseillersNumeriques).toStrictEqual([{ count: 1 }])
      expect(stats.nombreStructuresAvecProgrammeNational).toStrictEqual([{ count: 1 }])
    })

    it('ne compte pas un lieu où exerce un ancien conseiller (affectation idposte inactive)', async () => {
      // GIVEN
      await prisma.main_personne_affectations_emploi.create({
        data: { est_active: false, personne_id: PERSONNE_ID, source: 'idposte', structure_administrative_id: SA_ID },
      })

      // WHEN
      const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

      // THEN
      expect(stats.nombreStructuresAvecConseillersNumeriques).toStrictEqual([{ count: 0 }])
    })
  })

  it('ne compte pas les indicateurs de zonage sur les lieux écartés du critère', async () => {
    // WHEN
    const stats = await new PrismaLieuxInclusionNumeriqueLoader().getDepartemental(DEPARTEMENT)

    // THEN
    expect(stats.nombreStructuresZonesPrioritaires).toStrictEqual([{ nb_structures: 0 }])
    expect(stats.nombreStructuresQPV).toStrictEqual([{ nb_structures: 0 }])
    expect(stats.nombreStructuresFRR).toStrictEqual([{ nb_structures: 0 }])
  })
})
