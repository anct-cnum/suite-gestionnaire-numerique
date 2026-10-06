import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaDonneesStructureLoader } from './PrismaDonneesStructureLoader'
import prisma from '../../../prisma/prismaClient'
import { creerUnePersonne, creerUnePersonneAffectation, creerUneStructure } from '../testHelper'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('données structure loader', () => {
  // Le schéma coop (répliqué depuis dataspace en prod) n'est pas couvert par les
  // migrations Prisma : on matérialise le minimum requis par le loader.
  beforeAll(async () => {
    // Sérialise les fichiers de tests qui matérialisent le schéma coop (verrou tenu par la connexion
    // unique du worker, connection_limit=1) : le DROP SCHEMA du test de repointage ne doit pas
    // s'exécuter pendant qu'un autre fichier utilise ces tables.
    await prisma.$queryRaw`SELECT pg_advisory_lock(420001)::text`
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS coop`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.activites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date,
      suppression timestamp,
      accompagnements_count integer,
      structure_employeuse_id uuid
    )`
    // Un autre fichier de test partageant ce schéma a pu créer la table en premier sans cette
    // colonne (ordre non garanti entre fichiers, notamment en mode --coverage) : on la complète.
    await prisma.$executeRaw`ALTER TABLE coop.activites
      ADD COLUMN IF NOT EXISTS structure_employeuse_main_id integer`
    // Périodes Coop lues par le rattachement lieu ↔ structure (présence sur un lieu pendant l'emploi).
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.mediateurs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.mediateurs_en_activite (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      mediateur_id uuid,
      structure_id uuid,
      debut_activite timestamp,
      fin_activite timestamp,
      suppression timestamp
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.employes_structures (
      id serial PRIMARY KEY,
      structure_main_id integer
    )`
    // Le test de repointage des fusions crée cette table avec ses seules colonnes : on la complète.
    await prisma.$executeRaw`ALTER TABLE coop.employes_structures
      ADD COLUMN IF NOT EXISTS user_id uuid,
      ADD COLUMN IF NOT EXISTS debut_emploi timestamp,
      ADD COLUMN IF NOT EXISTS fin_emploi timestamp,
      ADD COLUMN IF NOT EXISTS suppression timestamp`
  })

  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  afterAll(async () => prisma.$queryRaw`SELECT pg_advisory_unlock(420001)`)

  it('compte les lieux où une personne employée par la structure a une affectation active', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    // lieu avec affectation active de la personne employée (matérialisé par le helper, id = 4901)
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    // second lieu avec affectation active de la même personne employée
    await prisma.main_lieu_inclusion.create({ data: { id: 648, nom: 'Communauté de communes' } })
    await prisma.main_personne_affectations_lieu.create({
      data: { est_active: true, lieu_id: 648, personne_id: personneId, source: 'coop' },
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 2 })
  })

  it('compte un lieu quitté par un médiateur qui y était présent pendant son emploi dans la structure', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    await prisma.main_lieu_inclusion.create({
      data: { id: 7114, nom: 'Espace France Services', structure_coop_id: lieuCoopId },
    })
    // présence terminée sur le lieu, pendant un emploi toujours en cours dans la structure
    await creerUnePresenceCoop({
      debutActivite: epochTime,
      debutEmploi: epochTime,
      finActivite: epochTimePlusOneDay,
      finEmploi: null,
      structureId: 4901,
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 2 })
  })

  it('ne compte pas un lieu fréquenté par un ancien médiateur après son départ de la structure', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    await prisma.main_lieu_inclusion.create({
      data: { id: 7114, nom: 'Espace France Services', structure_coop_id: lieuCoopId },
    })
    // emploi dans la structure terminé avant l'arrivée sur le lieu (lieu d'un autre employeur)
    await creerUnePresenceCoop({
      debutActivite: epochTimePlusOneDay,
      debutEmploi: epochTime,
      finActivite: null,
      finEmploi: epochTime,
      structureId: 4901,
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 1 })
  })

  it('ne compte pas un lieu supprimé', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    await prisma.main_lieu_inclusion.create({
      data: { deleted_at: epochTime, id: 7114, nom: 'Espace France Services' },
    })
    await prisma.main_personne_affectations_lieu.create({
      data: { est_active: true, lieu_id: 7114, personne_id: personneId, source: 'coop' },
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 1 })
  })
})

const lieuCoopId = '6f1b3c2a-8d4e-4f5a-9b7c-1e2d3f4a5b6c'

async function creerUnePresenceCoop({
  debutActivite,
  debutEmploi,
  finActivite,
  finEmploi,
  structureId,
}: Readonly<{
  debutActivite: Date
  debutEmploi: Date
  finActivite: Date | null
  finEmploi: Date | null
  structureId: number
}>): Promise<void> {
  const userId = '0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d'
  await prisma.$executeRaw`INSERT INTO coop.employes_structures (user_id, structure_main_id, debut_emploi, fin_emploi)
    VALUES (${userId}::uuid, ${structureId}, ${debutEmploi}, ${finEmploi})`
  await prisma.$executeRaw`WITH mediateur AS (
      INSERT INTO coop.mediateurs (user_id) VALUES (${userId}::uuid) RETURNING id
    )
    INSERT INTO coop.mediateurs_en_activite (mediateur_id, structure_id, debut_activite, fin_activite)
    SELECT id, ${lieuCoopId}::uuid, ${debutActivite}, ${finActivite} FROM mediateur`
}
