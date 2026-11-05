import { afterEach, describe, expect, it } from 'vitest'

import { PrismaAppariementsLieuxLoader } from './PrismaAppariementsLieuxLoader'
import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

const PREFIXE = 'test-1845-loader'
const CLEF_INTEROP = '99845_9999_00001'
const LIEU_AVEC_ADRESSE = 990846
const LIEU_SANS_ADRESSE = 990847
const LIEU_INEXISTANT = 990848
const LIEU_SUPPRIME = 990849
const FICHE_PUBLIEE = 990850
const FICHE_ETEINTE = 990851

describe('file de revue des appariements de lieux (loader Prisma)', () => {
  afterEach(nettoyer)

  it('agrège les segments par paire record × lieu, trie par score décroissant et compte par statut', async () => {
    // GIVEN
    await seedLieux()
    await prisma.main_lieu_appariement.createMany({
      data: [
        // Paire à deux segments (record fusionné mednum), score 92.
        segment({
          carto_record_id: `${PREFIXE}_RhinOcc_A__${PREFIXE}_dora_B`,
          carto_segment: `${PREFIXE}_RhinOcc_A`,
          lieu_id: LIEU_AVEC_ADRESSE,
          score_global: 92,
        }),
        segment({
          carto_record_id: `${PREFIXE}_RhinOcc_A__${PREFIXE}_dora_B`,
          carto_segment: `${PREFIXE}_dora_B`,
          lieu_id: LIEU_AVEC_ADRESSE,
          score_global: 92,
        }),
        // Paire simple, meilleur score, lieu sans adresse.
        segment({
          carto_adresse: null,
          carto_commune: null,
          carto_nom: null,
          carto_record_id: `${PREFIXE}_FS_C`,
          carto_segment: `${PREFIXE}_FS_C`,
          distance_m: null,
          lieu_id: LIEU_SANS_ADRESSE,
          score_global: 100,
          source: null,
        }),
        // Déjà validée : hors de la file, comptée dans « valide ».
        segment({
          carto_record_id: `${PREFIXE}_FS_D`,
          carto_segment: `${PREFIXE}_FS_D`,
          decide_le: epochTimePlusOneDay,
          decide_par: 'martin.tartempion@example.net',
          lieu_id: LIEU_AVEC_ADRESSE,
          score_global: 88,
          statut: 'valide',
        }),
        // Preuve par segment (auto) : jamais affichée ni comptée.
        segment({
          carto_record_id: `${PREFIXE}_Coop_E`,
          carto_segment: `${PREFIXE}_Coop_E`,
          lieu_id: LIEU_AVEC_ADRESSE,
          methode: 'segment_coop',
          statut: 'auto',
        }),
        // Lieu disparu : ignorée (le DAG nettoie les orphelins).
        segment({ carto_record_id: `${PREFIXE}_FS_F`, carto_segment: `${PREFIXE}_FS_F`, lieu_id: LIEU_INEXISTANT }),
      ],
    })

    // WHEN
    const readModel = await new PrismaAppariementsLieuxLoader().rechercher({
      pagination: { limite: 10, page: 0 },
      statut: 'a_valider',
    })

    // THEN
    expect(readModel.compteurs).toStrictEqual({ a_valider: 2, rejete: 0, valide: 1 })
    expect(readModel.total).toBe(2)
    expect(readModel.appariements).toStrictEqual([
      {
        carto: {
          adresse: null,
          commune: null,
          nom: null,
          recordId: `${PREFIXE}_FS_C`,
          segments: [`${PREFIXE}_FS_C`],
          source: null,
          visibilite: 'absent',
        },
        decideLe: null,
        decidePar: null,
        derniereDetection: epochTime,
        distanceM: null,
        lieu: {
          codeInsee: null,
          commune: null,
          id: LIEU_SANS_ADRESSE,
          nom: 'Lieu sans adresse',
          nomVoie: null,
          numeroVoie: null,
          repetition: null,
          visibilite: 'masque',
        },
        scores: { adresse: 90, distance: 100, global: 100, nom: 95 },
        statut: 'a_valider',
      },
      {
        carto: {
          adresse: '36 Rue Cayrade',
          commune: 'Decazeville',
          nom: 'Atelier numérique',
          recordId: `${PREFIXE}_RhinOcc_A__${PREFIXE}_dora_B`,
          segments: [`${PREFIXE}_RhinOcc_A`, `${PREFIXE}_dora_B`],
          source: 'RhinOcc',
          visibilite: 'absent',
        },
        decideLe: null,
        decidePar: null,
        derniereDetection: epochTime,
        distanceM: 12,
        lieu: {
          codeInsee: '12089',
          commune: 'Decazeville',
          id: LIEU_AVEC_ADRESSE,
          nom: 'Atelier numérique de Decazeville',
          nomVoie: 'Rue Cayrade',
          numeroVoie: 36,
          repetition: 'bis',
          visibilite: 'visible',
        },
        scores: { adresse: 90, distance: 100, global: 92, nom: 95 },
        statut: 'a_valider',
      },
    ])
  })

  it('pagine la file et liste l’historique avec la décision', async () => {
    // GIVEN
    await seedLieux()
    await prisma.main_lieu_appariement.createMany({
      data: [
        segment({ carto_record_id: `${PREFIXE}_1`, carto_segment: `${PREFIXE}_1`, score_global: 99 }),
        segment({ carto_record_id: `${PREFIXE}_2`, carto_segment: `${PREFIXE}_2`, score_global: 90 }),
        segment({
          carto_record_id: `${PREFIXE}_3`,
          carto_segment: `${PREFIXE}_3`,
          decide_le: epochTimePlusOneDay,
          decide_par: 'martin.tartempion@example.net',
          statut: 'rejete',
        }),
      ],
    })
    const loader = new PrismaAppariementsLieuxLoader()

    // WHEN
    const secondePage = await loader.rechercher({ pagination: { limite: 1, page: 1 }, statut: 'a_valider' })
    const rejetes = await loader.rechercher({ pagination: { limite: 10, page: 0 }, statut: 'rejete' })

    // THEN
    expect(secondePage.total).toBe(2)
    expect(secondePage.appariements.map((appariement) => appariement.carto.recordId)).toStrictEqual([`${PREFIXE}_2`])
    expect(rejetes.total).toBe(1)
    expect(rejetes.appariements[0]).toMatchObject({
      carto: { recordId: `${PREFIXE}_3` },
      decideLe: epochTimePlusOneDay,
      decidePar: 'martin.tartempion@example.net',
      statut: 'rejete',
    })
  })

  it('donne la visibilité sur la carte du lieu retenu et de la fiche qui porte le record', async () => {
    // GIVEN
    await seedLieux()
    await prisma.main_lieu_inclusion.createMany({
      data: [
        // Lieu retenu supprimé : la paire reste proposée.
        { deleted_at: epochTime, id: LIEU_SUPPRIME, nom: 'Lieu supprimé', visible_pour_cartographie_nationale: false },
        // Fiche externe publiée qui porte le record (identifiant courant).
        {
          id: FICHE_PUBLIEE,
          nom: 'Fiche publiée',
          structure_cartographie_nationale_id: `${PREFIXE}_FS_G`,
          visible_pour_cartographie_nationale: true,
        },
        // Fiche externe éteinte après un appariement : elle a perdu l'identifiant,
        // seule la mémoire des segments externes la retrouve.
        { id: FICHE_ETEINTE, nom: 'Fiche éteinte', visible_pour_cartographie_nationale: false },
      ],
    })
    await prisma.main_lieu_appariement.createMany({
      data: [
        segment({
          carto_record_id: `${PREFIXE}_FS_G`,
          carto_segment: `${PREFIXE}_FS_G`,
          lieu_id: LIEU_SUPPRIME,
          score_global: 99,
        }),
        segment({
          carto_record_id: `${PREFIXE}_FS_H`,
          carto_segment: `${PREFIXE}_FS_H`,
          lieu_id: LIEU_AVEC_ADRESSE,
          score_global: 98,
        }),
        segment({
          carto_record_id: `${PREFIXE}_FS_H`,
          carto_segment: `${PREFIXE}_FS_H`,
          lieu_id: FICHE_ETEINTE,
          methode: 'segment_externe',
          statut: 'auto',
        }),
      ],
    })

    // WHEN
    const readModel = await new PrismaAppariementsLieuxLoader().rechercher({
      pagination: { limite: 10, page: 0 },
      statut: 'a_valider',
    })

    // THEN
    expect(readModel.compteurs.a_valider).toBe(2)
    expect(
      readModel.appariements.map((appariement) => [
        appariement.carto.recordId,
        appariement.carto.visibilite,
        appariement.lieu.visibilite,
      ])
    ).toStrictEqual([
      [`${PREFIXE}_FS_G`, 'visible', 'supprime'],
      [`${PREFIXE}_FS_H`, 'masque', 'visible'],
    ])
  })
})

async function seedLieux(): Promise<void> {
  const adresse = await prisma.adresse.create({
    data: {
      clef_interop: CLEF_INTEROP,
      code_insee: '12089',
      code_postal: '12300',
      nom_commune: 'Decazeville',
      nom_voie: 'Rue Cayrade',
      numero_voie: 36,
      repetition: 'bis',
    },
  })
  await prisma.main_lieu_inclusion.createMany({
    data: [
      {
        adresse_id: adresse.id,
        id: LIEU_AVEC_ADRESSE,
        nom: 'Atelier numérique de Decazeville',
        visible_pour_cartographie_nationale: true,
      },
      { id: LIEU_SANS_ADRESSE, nom: 'Lieu sans adresse' },
    ],
  })
}

function segment(
  override: { carto_record_id: string; carto_segment: string } & Partial<Prisma.main_lieu_appariementCreateManyInput>
): Prisma.main_lieu_appariementCreateManyInput {
  return {
    carto_adresse: '36 Rue Cayrade',
    carto_commune: 'Decazeville',
    carto_nom: 'Atelier numérique',
    derniere_detection: epochTime,
    distance_m: 12,
    lieu_id: LIEU_AVEC_ADRESSE,
    methode: 'similarite',
    premiere_detection: epochTime,
    score_adresse: 90,
    score_distance: 100,
    score_global: 92,
    score_nom: 95,
    source: 'RhinOcc',
    statut: 'a_valider',
    ...override,
  }
}

async function nettoyer(): Promise<void> {
  await prisma.main_lieu_appariement.deleteMany({ where: { carto_segment: { startsWith: PREFIXE } } })
  await prisma.main_lieu_inclusion.deleteMany({
    where: { id: { in: [LIEU_AVEC_ADRESSE, LIEU_SANS_ADRESSE, LIEU_SUPPRIME, FICHE_PUBLIEE, FICHE_ETEINTE] } },
  })
  await prisma.adresse.deleteMany({ where: { clef_interop: CLEF_INTEROP } })
}
