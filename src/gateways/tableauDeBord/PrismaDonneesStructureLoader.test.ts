import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaDonneesStructureLoader } from './PrismaDonneesStructureLoader'
import prisma from '../../../prisma/prismaClient'
import { creerUnePersonne, creerUnePersonneAffectation, creerUneStructure } from '../testHelper'
import { epochTime } from '@/shared/testHelper'

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

  it('ne compte pas un lieu dont l’affectation de la personne employée n’est plus active', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    // lieu fantôme : la seule affectation de la personne employée y est inactive
    await prisma.main_lieu_inclusion.create({ data: { id: 7114, nom: 'Espace France Services' } })
    await prisma.main_personne_affectations_lieu.create({
      data: { est_active: false, lieu_id: 7114, personne_id: personneId, source: 'coop' },
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 1 })
  })
})
