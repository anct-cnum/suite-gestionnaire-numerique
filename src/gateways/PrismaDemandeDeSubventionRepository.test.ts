import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaDemandeDeSubventionRepository } from './PrismaDemandeDeSubventionRepository'
import {
  actionRecordFactory,
  creerUnContact,
  creerUnDepartement,
  creerUneAction,
  creerUneEnveloppeFinancement,
  creerUneFeuilleDeRoute,
  creerUneGouvernance,
  creerUneRegion,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { demandeDeSubventionFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('demande de subvention repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter une demande de subvention à une action avec des bénéficiaires', async () => {
    // GIVEN
    const departementCode = '69'
    const actionId = 1
    const enveloppeFinancementId = 1
    const demandeDeSubventionId = 1
    const uidPorteur = 'porteurId'
    const utilisateurId = 1
    const createurId = 2

    // Configuration initiale
    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })

    // Création des utilisateurs
    await creerUnUtilisateur({
      id: utilisateurId,
      ssoEmail: 'utilisateur@example.com',
      ssoId: 'utilisateurSSOId',
    })

    await creerUnUtilisateur({
      id: createurId,
      ssoEmail: 'createur@example.com',
      ssoId: 'createurSSOId',
    })

    // Création du contact et du porteur
    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })

    await creerUnMembre({
      contact: 'structure@example.com',
      gouvernanceDepartementCode: departementCode,
      id: uidPorteur,
    })

    // Création de la feuille de route et de l'action
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      porteurId: uidPorteur,
    })

    await creerUneAction({
      ...actionRecordFactory(),
      budgetGlobal: 50000,
      createurId,
      feuilleDeRouteId: 1,
      id: actionId,
    })

    // Création de l'enveloppe de financement
    await creerUneEnveloppeFinancement({
      id: enveloppeFinancementId,
      libelle: 'Enveloppe test',
      montant: 100000,
    })

    // Création des bénéficiaires
    const beneficiaire1Id = 'beneficiaire1'
    const beneficiaire2Id = 'beneficiaire2'

    await creerUnContact({
      email: 'beneficiaire1@example.com',
      fonction: 'Responsable',
      nom: 'Dupont',
      prenom: 'Jean',
    })

    await creerUnMembre({
      contact: 'beneficiaire1@example.com',
      gouvernanceDepartementCode: departementCode,
      id: beneficiaire1Id,
    })

    await creerUnContact({
      email: 'beneficiaire2@example.com',
      fonction: 'Directeur',
      nom: 'Martin',
      prenom: 'Sophie',
    })

    await creerUnMembre({
      contact: 'beneficiaire2@example.com',
      gouvernanceDepartementCode: departementCode,
      id: beneficiaire2Id,
    })

    const demandeDeSubvention = demandeDeSubventionFactory({
      beneficiaires: [beneficiaire1Id, beneficiaire2Id],
      dateDeCreation: epochTime,
      derniereModification: epochTime,
      statut: StatutSubvention.EN_COURS,
      subventionDemandee: 25000,
      subventionEtp: 10000,
      subventionPrestation: 15000,
      uid: { value: demandeDeSubventionId.toString() },
      uidAction: { value: actionId.toString() },
      uidCreateur: 'createurSSOId',
      uidEnveloppeFinancement: { value: enveloppeFinancementId.toString() },
    })

    // WHEN
    const resultat = await new PrismaDemandeDeSubventionRepository().add(demandeDeSubvention)

    // THEN
    expect(resultat).toBe(true)

    const demandeDeSubventionRecord = await prisma.demandeDeSubventionRecord.findFirst({
      where: {
        actionId,
        enveloppeFinancementId,
        statut: StatutSubvention.EN_COURS,
      },
    })

    expect(demandeDeSubventionRecord).toMatchObject({
      actionId,
      createurId,
      creation: new Date(epochTime),
      derniereModification: new Date(epochTime),
      enveloppeFinancementId,
      statut: StatutSubvention.EN_COURS,
      subventionDemandee: 25000,
      subventionEtp: 10000,
      subventionPrestation: 15000,
    })

    const actualDemandeId = demandeDeSubventionRecord ? demandeDeSubventionRecord.id : -1
    const beneficiaires = await prisma.beneficiaireSubventionRecord.findMany({
      where: {
        demandeDeSubventionId: actualDemandeId,
      },
    })

    expect(beneficiaires).toHaveLength(2)
    expect(beneficiaires).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        demandeDeSubventionId: actualDemandeId,
        membreId: beneficiaire1Id,
      }),
      expect.objectContaining({
        demandeDeSubventionId: actualDemandeId,
        membreId: beneficiaire2Id,
      }),
    ]))
  })
})
