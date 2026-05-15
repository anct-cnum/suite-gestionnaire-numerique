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
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'

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
