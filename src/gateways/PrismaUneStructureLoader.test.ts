import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaUneStructureLoader } from './PrismaUneStructureLoader'
import {
  creerUnBeneficiaireSubvention,
  creerUnDepartement,
  creerUneAction,
  creerUneDemandeDeSubvention,
  creerUneEnveloppeFinancement,
  creerUneFeuilleDeRoute,
  creerUneGouvernance,
  creerUnePersonne,
  creerUnePersonneAffectation,
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('une structure loader : caractérisation des enveloppes (accumulation FNE par libellé)', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('les demandes de subvention acceptées sont cumulées par libellé d’enveloppe (Formation + Ingénierie FNE)', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: '69', regionCode: '11' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnUtilisateur({ id: 1 })
    await creerUneStructure({ departementCode: '69', id: 28_189 })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-fne-test', structureId: 28_189 })
    await creerUneFeuilleDeRoute({ gouvernanceDepartementCode: '69', id: 1 })
    await creerUneAction({ feuilleDeRouteId: 1, id: 1 })
    await creerUneAction({ feuilleDeRouteId: 1, id: 2 })
    await creerUneEnveloppeFinancement({
      id: 3,
      libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
    })
    await creerUneEnveloppeFinancement({
      id: 4,
      libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
    })
    await creerUneDemandeDeSubvention({
      actionId: 1,
      enveloppeFinancementId: 4,
      id: 1,
      statut: 'acceptee',
      subventionDemandee: 47_200,
    })
    await creerUneDemandeDeSubvention({
      actionId: 2,
      enveloppeFinancementId: 3,
      id: 2,
      statut: 'acceptee',
      subventionDemandee: 20_000,
    })
    await creerUnBeneficiaireSubvention({ demandeDeSubventionId: 1, membreId: 'membre-fne-test' })
    await creerUnBeneficiaireSubvention({ demandeDeSubventionId: 2, membreId: 'membre-fne-test' })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(28_189)

    // THEN
    const enveloppesTriees = [...readModel.conventionsEtFinancements.enveloppes].sort((enveloppeA, enveloppeB) =>
      enveloppeA.libelle.localeCompare(enveloppeB.libelle)
    )
    expect(enveloppesTriees).toStrictEqual([
      { libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État', montant: 20_000, type: 'fne' },
      { libelle: 'Ingénierie France Numérique Ensemble - 2024 - État', montant: 47_200, type: 'fne' },
    ])
    expect(readModel.conventionsEtFinancements.creditsEngagesParLEtat).toBe(67_200)
    // Enveloppe formation → récipiendaire ; enveloppe non-formation → bénéficiaire
    const rolesGouvernance = readModel.role.gouvernances
      .flatMap((gouvernance) => [...gouvernance.roles])
      .sort((roleA, roleB) => roleA.localeCompare(roleB))
    expect(rolesGouvernance).toStrictEqual(['beneficiaire', 'recipiendaire'])
  })

  it('les demandes de subvention non acceptées sont exclues du cumul', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: '69', regionCode: '11' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnUtilisateur({ id: 1 })
    await creerUneStructure({ departementCode: '69', id: 28_189 })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-fne-test', structureId: 28_189 })
    await creerUneFeuilleDeRoute({ gouvernanceDepartementCode: '69', id: 1 })
    await creerUneAction({ feuilleDeRouteId: 1, id: 1 })
    await creerUneEnveloppeFinancement({
      id: 4,
      libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
    })
    await creerUneDemandeDeSubvention({
      actionId: 1,
      enveloppeFinancementId: 4,
      id: 1,
      statut: 'deposee',
      subventionDemandee: 47_200,
    })
    await creerUnBeneficiaireSubvention({ demandeDeSubventionId: 1, membreId: 'membre-fne-test' })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(28_189)

    // THEN
    expect(readModel.conventionsEtFinancements.enveloppes).toStrictEqual([])
    expect(readModel.conventionsEtFinancements.creditsEngagesParLEtat).toBe(0)
  })
})

describe('une structure loader : labellisation conseiller numérique', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('sans attestation, aucune date de labellisation n’est retournée', async () => {
    // GIVEN
    await creerUneStructure({ id: 6001 })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(6001)

    // THEN
    expect(readModel.labellisations.derniereAttestationLabelConum).toBeNull()
  })

  it('la date de l’attestation la plus récente est retournée quand la structure est labellisée', async () => {
    // GIVEN
    await creerUneStructure({ id: 6002 })
    await creerUnUtilisateur({ id: 7 })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTime, structure_id: 6002, utilisateur_id: 7 },
    })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTimePlusOneDay, structure_id: 6002, utilisateur_id: 7 },
    })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(6002)

    // THEN
    expect(readModel.labellisations.derniereAttestationLabelConum).toStrictEqual(epochTimePlusOneDay)
  })

  it('sans rattachement Aidants Connect, la structure n’est pas habilitée', async () => {
    // GIVEN
    await creerUneStructure({ id: 6003 })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(6003)

    // THEN
    expect(readModel.labellisations.estHabiliteeAidantsConnect).toBe(false)
  })

  it('avec un rattachement Aidants Connect (structure_ac_id), la structure est habilitée', async () => {
    // GIVEN
    await creerUneStructure({ id: 6004, structure_ac_id: '11111111-1111-1111-1111-111111111111' })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(6004)

    // THEN
    expect(readModel.labellisations.estHabiliteeAidantsConnect).toBe(true)
  })
})

describe("une structure loader : aidants et médiateurs (filtre par type d'affectation)", () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('compte uniquement les personnes avec une affectation de type structure_emploi', async () => {
    // GIVEN
    await creerUneStructure({ id: 5001 })
    const mediateurId = await creerUnePersonne({ is_mediateur: true, nom: 'Dupont', prenom: 'Alice' })
    await creerUnePersonneAffectation({
      personne_id: mediateurId,
      source: 'coop',
      structure_id: 5001,
      type: 'structure_emploi',
    })
    const lieuActiviteSeulementId = await creerUnePersonne({ is_coordinateur: true, nom: 'Martin', prenom: 'Bob' })
    await creerUnePersonneAffectation({
      personne_id: lieuActiviteSeulementId,
      source: 'coop',
      structure_id: 5001,
      type: 'lieu_activite',
    })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(5001)

    // THEN
    expect(readModel.aidantsEtMediateurs.liste).toHaveLength(1)
    expect(readModel.aidantsEtMediateurs.liste[0].prenom).toBe('Alice')
    expect(readModel.aidantsEtMediateurs.totalAidant).toBe(0)
    expect(readModel.aidantsEtMediateurs.totalCoordinateur).toBe(0)
    expect(readModel.aidantsEtMediateurs.totalMediateur).toBe(1)
  })

  it("compte une personne avec les deux types d'affectation une seule fois", async () => {
    // GIVEN
    await creerUneStructure({ id: 5002 })
    const personneId = await creerUnePersonne({ is_mediateur: true, nom: 'Leroy', prenom: 'Claire' })
    await creerUnePersonneAffectation({
      personne_id: personneId,
      source: 'coop',
      structure_id: 5002,
      type: 'lieu_activite',
    })
    await creerUnePersonneAffectation({
      personne_id: personneId,
      source: 'coop',
      structure_id: 5002,
      type: 'structure_emploi',
    })

    // WHEN
    const readModel = await new PrismaUneStructureLoader().get(5002)

    // THEN
    expect(readModel.aidantsEtMediateurs.liste).toHaveLength(1)
    expect(readModel.aidantsEtMediateurs.totalMediateur).toBe(1)
  })
})
