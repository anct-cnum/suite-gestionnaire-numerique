import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaDonneesStructureLoader } from './PrismaDonneesStructureLoader'
import prisma from '../../../prisma/prismaClient'
import { creerUnePersonne, creerUnePersonneAffectation, creerUneStructure } from '../testHelper'
import { epochTime } from '@/shared/testHelper'

describe('données structure loader', () => {
  // Le schéma coop (répliqué depuis dataspace en prod) n'est pas couvert par les
  // migrations Prisma : on matérialise le minimum requis par le loader.
  beforeAll(async () => {
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS coop`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.activites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date,
      suppression timestamp,
      accompagnements_count integer,
      structure_employeuse_id uuid
    )`
  })

  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les lieux de la structure ont des affectations actives, alors ils sont tous comptés', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    // lieu associé à la structure avec une affectation active (matérialisé par le helper, id = 4901)
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    // lieu relié uniquement par l'affectation active d'une personne employée, sans association directe
    await prisma.main_lieu_inclusion.create({ data: { id: 648, nom: 'Communauté de communes' } })
    await prisma.main_personne_affectations_lieu.create({
      data: { est_active: true, lieu_id: 648, personne_id: personneId, source: 'coop' },
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 2 })
  })

  it('quand un lieu est rattaché à la structure par la seule association et n’a plus aucune affectation active, alors il n’est pas compté', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    const personneId = await creerUnePersonne()
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'structure_emploi' })
    await creerUnePersonneAffectation({ personne_id: personneId, structure_id: 4901, type: 'lieu_activite' })
    // lieu fantôme : associé à la structure (ex. pont siret) mais dont l'unique affectation est inactive
    await prisma.main_lieu_inclusion.create({ data: { id: 7114, nom: 'Espace France Services' } })
    await prisma.main_lieu_inclusion_structure_administrative.create({
      data: { lieu_id: 7114, structure_administrative_id: 4901 },
    })
    await prisma.main_personne_affectations_lieu.create({
      data: { est_active: false, lieu_id: 7114, personne_id: personneId, source: 'coop' },
    })

    // WHEN
    const donneesStructure = await new PrismaDonneesStructureLoader().get(4901, epochTime)

    // THEN
    expect(donneesStructure).toMatchObject({ nombreLieux: 1 })
  })
})
