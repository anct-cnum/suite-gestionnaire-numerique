import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaTagsCoopLoader } from './PrismaTagsCoopLoader'
import prisma from '../../prisma/prismaClient'

describe('tags coop loader', () => {
  // Le schéma coop (répliqué depuis dataspace en prod) n'est pas couvert par les
  // migrations Prisma : on matérialise le minimum requis par le loader.
  beforeAll(async () => {
    // Sérialise les fichiers de tests qui matérialisent le schéma coop (verrou tenu par la connexion
    // unique du worker, connection_limit=1) : le DROP SCHEMA du test de repointage ne doit pas
    // s'exécuter pendant qu'un autre fichier utilise ces tables.
    await prisma.$queryRaw`SELECT pg_advisory_lock(420001)::text`
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS coop`
    // Les tables peuvent préexister avec moins de colonnes (créées par un autre test) : on complète par ALTER.
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.activites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date,
      suppression timestamp,
      accompagnements_count integer,
      structure_employeuse_id uuid
    )`
    await prisma.$executeRaw`ALTER TABLE coop.activites
      ADD COLUMN IF NOT EXISTS structure_id uuid,
      ADD COLUMN IF NOT EXISTS lieu_code_insee text,
      ADD COLUMN IF NOT EXISTS structure_employeuse_main_id integer`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.lieu_inclusion (
      id uuid PRIMARY KEY,
      code_insee text
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.tags (
      id uuid PRIMARY KEY,
      nom text,
      mediateur_id uuid,
      suppression timestamp
    )`
    await prisma.$executeRaw`ALTER TABLE coop.tags
      ADD COLUMN IF NOT EXISTS coordinateur_id uuid,
      ADD COLUMN IF NOT EXISTS equipe boolean,
      ADD COLUMN IF NOT EXISTS departement text`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.activite_tags (
      activite_id uuid,
      tag_id uuid
    )`
  })

  beforeEach(async () => {
    await prisma.$queryRaw`START TRANSACTION`
    await creerJeuDeDonnees()
  })

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  afterAll(async () => prisma.$queryRaw`SELECT pg_advisory_unlock(420001)`)

  it.each([
    {
      attendu: [TAG_ALLER_VERS, TAG_PASS_NUMERIQUE, TAG_QUARTIER_PRIORITAIRE],
      intention: 'gestionnaire département : les tags utilisés sur les activités de son département',
      scopeFiltre: { codes: ['69'], type: 'departemental' as const },
    },
    {
      attendu: [TAG_ALLER_VERS, TAG_PASS_NUMERIQUE, TAG_QUARTIER_PRIORITAIRE, TAG_ZONE_RURALE],
      intention: 'gestionnaire région : les tags utilisés sur les activités de ses départements',
      scopeFiltre: { codes: ['69', '01'], type: 'departemental' as const },
    },
    {
      attendu: [TAG_ALLER_VERS, TAG_QUARTIER_PRIORITAIRE, TAG_ZONE_RURALE],
      intention: 'gestionnaire structure : les tags utilisés sur les activités de sa structure employeuse',
      scopeFiltre: { id: STRUCTURE_EMPLOYEUSE, type: 'structure' as const },
    },
    {
      attendu: [TAG_ALLER_VERS, TAG_PASS_NUMERIQUE, TAG_QUARTIER_PRIORITAIRE, TAG_ZONE_RURALE],
      intention: 'vue nationale : les tags utilisés sur toutes les activités',
      scopeFiltre: { type: 'national' as const },
    },
  ])(
    '$intention, triés par nom, sans les tags personnels, supprimés, inutilisés ou seulement sur une activité supprimée',
    async ({ attendu, scopeFiltre }) => {
      // GIVEN
      const loader = new PrismaTagsCoopLoader()

      // WHEN
      const tags = await loader.recupererVisibles(scopeFiltre)

      // THEN
      expect(tags).toStrictEqual(attendu)
    }
  )

  it('gestionnaire départemental sans département : aucun tag (pas de bascule en vue nationale)', async () => {
    // GIVEN
    const loader = new PrismaTagsCoopLoader()

    // WHEN
    const tags = await loader.recupererVisibles({ codes: [], type: 'departemental' })

    // THEN
    expect(tags).toStrictEqual([])
  })
})

const STRUCTURE_EMPLOYEUSE = 4901
const AUTRE_STRUCTURE_EMPLOYEUSE = 4902
const COORDINATEUR = '81111111-1111-4111-8111-111111111111'
const MEDIATEUR = '82222222-2222-4222-8222-222222222222'
const LIEU_LYON = '41111111-1111-4111-8111-111111111111'
const ACTIVITE_RHONE = '61111111-1111-4111-8111-111111111111'
const ACTIVITE_LIEU_LYON = '62222222-2222-4222-8222-222222222222'
const ACTIVITE_AIN = '63333333-3333-4333-8333-333333333333'
const ACTIVITE_SUPPRIMEE = '64444444-4444-4444-8444-444444444444'
const ID_TAG_ALLER_VERS = '71111111-1111-4111-8111-111111111111'
const ID_TAG_PASS_NUMERIQUE = '72222222-2222-4222-8222-222222222222'
const ID_TAG_QUARTIER_PRIORITAIRE = '73333333-3333-4333-8333-333333333333'
const ID_TAG_ZONE_RURALE = '74444444-4444-4444-8444-444444444444'
const ID_TAG_PERSONNEL = '75555555-5555-4555-8555-555555555555'
const ID_TAG_SUPPRIME = '76666666-6666-4666-8666-666666666666'
const ID_TAG_INUTILISE = '77777777-7777-4777-8777-777777777777'
const ID_TAG_SUR_ACTIVITE_SUPPRIMEE = '78888888-8888-4888-8888-888888888888'

const TAG_ALLER_VERS = { departement: null, label: 'Aller-vers', portee: 'equipe', value: ID_TAG_ALLER_VERS }
const TAG_PASS_NUMERIQUE = {
  departement: null,
  label: 'Pass numérique',
  portee: 'national',
  value: ID_TAG_PASS_NUMERIQUE,
}
const TAG_QUARTIER_PRIORITAIRE = {
  departement: '69',
  label: 'Quartier prioritaire',
  portee: 'departemental',
  value: ID_TAG_QUARTIER_PRIORITAIRE,
}
const TAG_ZONE_RURALE = { departement: '01', label: 'Zone rurale', portee: 'departemental', value: ID_TAG_ZONE_RURALE }

async function creerJeuDeDonnees(): Promise<void> {
  await prisma.$executeRaw`INSERT INTO coop.lieu_inclusion (id, code_insee) VALUES (${LIEU_LYON}::uuid, '69381')`
  await prisma.$executeRaw`INSERT INTO coop.tags (id, nom, mediateur_id, coordinateur_id, equipe, departement, suppression)
    VALUES
    (${ID_TAG_ALLER_VERS}::uuid, 'Aller-vers', NULL, ${COORDINATEUR}::uuid, true, NULL, NULL),
    (${ID_TAG_PASS_NUMERIQUE}::uuid, 'Pass numérique', NULL, NULL, NULL, NULL, NULL),
    (${ID_TAG_QUARTIER_PRIORITAIRE}::uuid, 'Quartier prioritaire', NULL, NULL, NULL, '69', NULL),
    (${ID_TAG_ZONE_RURALE}::uuid, 'Zone rurale', NULL, NULL, NULL, '01', NULL),
    (${ID_TAG_PERSONNEL}::uuid, 'Mes suivis', ${MEDIATEUR}::uuid, NULL, false, NULL, NULL),
    (${ID_TAG_SUPPRIME}::uuid, 'Ancien dispositif', NULL, NULL, NULL, NULL, NOW()),
    (${ID_TAG_INUTILISE}::uuid, 'Jamais utilisé', NULL, NULL, NULL, NULL, NULL),
    (${ID_TAG_SUR_ACTIVITE_SUPPRIMEE}::uuid, 'Hors service', NULL, NULL, NULL, NULL, NULL)`
  // Activité localisée par son code INSEE
  await prisma.$executeRaw`INSERT INTO coop.activites (id, lieu_code_insee, structure_employeuse_main_id)
    VALUES (${ACTIVITE_RHONE}::uuid, '69002', ${STRUCTURE_EMPLOYEUSE})`
  // Activité localisée par son lieu d'inclusion
  await prisma.$executeRaw`INSERT INTO coop.activites (id, structure_id, structure_employeuse_main_id)
    VALUES (${ACTIVITE_LIEU_LYON}::uuid, ${LIEU_LYON}::uuid, ${AUTRE_STRUCTURE_EMPLOYEUSE})`
  await prisma.$executeRaw`INSERT INTO coop.activites (id, lieu_code_insee, structure_employeuse_main_id)
    VALUES (${ACTIVITE_AIN}::uuid, '01053', ${STRUCTURE_EMPLOYEUSE})`
  await prisma.$executeRaw`INSERT INTO coop.activites (id, lieu_code_insee, structure_employeuse_main_id, suppression)
    VALUES (${ACTIVITE_SUPPRIMEE}::uuid, '69002', ${STRUCTURE_EMPLOYEUSE}, NOW())`
  await prisma.$executeRaw`INSERT INTO coop.activite_tags (activite_id, tag_id) VALUES
    (${ACTIVITE_RHONE}::uuid, ${ID_TAG_QUARTIER_PRIORITAIRE}::uuid),
    (${ACTIVITE_RHONE}::uuid, ${ID_TAG_ALLER_VERS}::uuid),
    (${ACTIVITE_RHONE}::uuid, ${ID_TAG_PERSONNEL}::uuid),
    (${ACTIVITE_RHONE}::uuid, ${ID_TAG_SUPPRIME}::uuid),
    (${ACTIVITE_LIEU_LYON}::uuid, ${ID_TAG_PASS_NUMERIQUE}::uuid),
    (${ACTIVITE_AIN}::uuid, ${ID_TAG_ZONE_RURALE}::uuid),
    (${ACTIVITE_SUPPRIMEE}::uuid, ${ID_TAG_SUR_ACTIVITE_SUPPRIMEE}::uuid)`
}
