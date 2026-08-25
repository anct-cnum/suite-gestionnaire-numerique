import { afterEach, describe, expect, it } from 'vitest'

import { PrismaAppariementLieuRepository } from './PrismaAppariementLieuRepository'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

const PREFIXE = 'test-1845-repo'
const RECORD_A = `${PREFIXE}_Coop__${PREFIXE}_FS_1`
const RECORD_B = `${PREFIXE}_dora_2`
const LIEU = 990845

describe('décision d’appariement de lieu (repository Prisma)', () => {
  afterEach(nettoyer)

  it('passe au statut décidé tous les segments « a_valider » de la paire, et eux seuls', async () => {
    // GIVEN une paire à deux segments dont un déjà tranché, et une autre paire.
    await prisma.main_lieu_appariement.createMany({
      data: [
        segment({ carto_segment: `${PREFIXE}_Coop`, statut: 'a_valider' }),
        segment({ carto_segment: `${PREFIXE}_FS_1`, statut: 'a_valider' }),
        segment({ carto_segment: `${PREFIXE}_FS_old`, decide_par: 'dag', statut: 'rejete' }),
        segment({ carto_record_id: RECORD_B, carto_segment: `${PREFIXE}_dora_2`, statut: 'a_valider' }),
      ],
    })

    // WHEN
    const nombre = await new PrismaAppariementLieuRepository().decider({
      cartoRecordId: RECORD_A,
      decideLe: epochTime,
      decidePar: 'martin.tartempion@example.net',
      lieuId: LIEU,
      statut: 'valide',
    })

    // THEN
    expect(nombre).toBe(2)
    const lignes = await prisma.main_lieu_appariement.findMany({
      orderBy: { carto_segment: 'asc' },
      select: { carto_segment: true, decide_le: true, decide_par: true, statut: true },
      where: { carto_segment: { startsWith: PREFIXE } },
    })
    expect(lignes).toStrictEqual([
      {
        carto_segment: `${PREFIXE}_Coop`,
        decide_le: epochTime,
        decide_par: 'martin.tartempion@example.net',
        statut: 'valide',
      },
      {
        carto_segment: `${PREFIXE}_FS_1`,
        decide_le: epochTime,
        decide_par: 'martin.tartempion@example.net',
        statut: 'valide',
      },
      { carto_segment: `${PREFIXE}_FS_old`, decide_le: null, decide_par: 'dag', statut: 'rejete' },
      { carto_segment: `${PREFIXE}_dora_2`, decide_le: null, decide_par: null, statut: 'a_valider' },
    ])
  })

  it('ne modifie rien et renvoie 0 quand la paire est déjà décidée', async () => {
    // GIVEN
    await prisma.main_lieu_appariement.create({
      data: segment({ carto_segment: `${PREFIXE}_Coop`, decide_par: 'autre', statut: 'valide' }),
    })

    // WHEN
    const nombre = await new PrismaAppariementLieuRepository().decider({
      cartoRecordId: RECORD_A,
      decideLe: epochTime,
      decidePar: 'martin.tartempion@example.net',
      lieuId: LIEU,
      statut: 'rejete',
    })

    // THEN
    expect(nombre).toBe(0)
    const ligne = await prisma.main_lieu_appariement.findFirst({ where: { carto_segment: `${PREFIXE}_Coop` } })
    expect(ligne?.statut).toBe('valide')
    expect(ligne?.decide_par).toBe('autre')
  })
})

function segment(
  override: Readonly<{ carto_record_id?: string; carto_segment: string; decide_par?: string; statut: string }>
): Readonly<{
  carto_record_id: string
  carto_segment: string
  decide_par?: string
  lieu_id: number
  methode: string
  statut: string
}> {
  return { carto_record_id: RECORD_A, lieu_id: LIEU, methode: 'similarite', ...override }
}

async function nettoyer(): Promise<void> {
  await prisma.main_lieu_appariement.deleteMany({ where: { carto_segment: { startsWith: PREFIXE } } })
}
