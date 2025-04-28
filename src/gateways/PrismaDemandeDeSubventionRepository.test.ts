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
  creerUnMembreDepartement,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { demandeDeSubventionFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('demande de subvention repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter une demande de subvention à une action', async () => {
    // GIVEN
    const departementCode = '69'
    const actionId = 1
    const enveloppeFinancementId = 1
    const demandeDeSubventionId = 1
    const uidPorteur = 'porteurId'
    const createurId = 1

    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })

    await prisma.utilisateurRecord.create({
      data: {
        dateDeCreation: new Date(epochTime),
        derniereConnexion: new Date(epochTime),
        emailDeContact: 'user@example.com',
        id: createurId,
        inviteLe: new Date(epochTime),
        isSuperAdmin: false,
        isSupprime: false,
        nom: 'Utilisateur',
        prenom: 'Test',
        role: 'gestionnaire_departement',
        ssoEmail: 'user@example.com',
        ssoId: 'user1',
        telephone: '0102030405',
      },
    })

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
    await creerUnMembreDepartement({
      departementCode,
      membreId: uidPorteur,
    })

    await creerUneFeuilleDeRoute({
      creation: epochTime,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      porteurId: uidPorteur,
    })

    await creerUneAction({
      ...actionRecordFactory(),
      budgetGlobal: 50000,
      createurId: 1,
      feuilleDeRouteId: 1,
      id: actionId,
    })

    await creerUneEnveloppeFinancement({
      id: enveloppeFinancementId,
      libelle: 'Enveloppe test',
      montant: 100000,
    })

    await creerUnMembre({
      contact: 'structure@example.com',
      gouvernanceDepartementCode: departementCode,
      id: 'beneficiaire1',
    })

    await creerUnMembre({
      contact: 'structure@example.com',
      gouvernanceDepartementCode: departementCode,
      id: 'beneficiaire2',
    })

    const demandeDeSubvention = demandeDeSubventionFactory({
      beneficiaires: ['beneficiaire1', 'beneficiaire2'],
      dateDeCreation: epochTime,
      derniereModification: epochTime,
      statut: 'en_cours',
      subventionDemandee: 25000,
      subventionEtp: 10000,
      subventionPrestation: 15000,
      uid: { value: demandeDeSubventionId.toString() },
      uidAction: { value: actionId.toString() },
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
        statut: 'en_cours',
      },
    })

    expect(demandeDeSubventionRecord).toMatchObject({
      actionId,
      createurId,
      creation: new Date(epochTime),
      derniereModification: new Date(epochTime),
      enveloppeFinancementId,
      statut: 'en_cours',
      subventionDemandee: 25000,
      subventionEtp: 10000,
      subventionPrestation: 15000,
    })
    expect(demandeDeSubventionRecord?.actionId).toBe(actionId)
    expect(demandeDeSubventionRecord?.enveloppeFinancementId).toBe(enveloppeFinancementId)
    expect(demandeDeSubventionRecord?.statut).toBe('en_cours')
    expect(demandeDeSubventionRecord?.subventionDemandee).toBe(25000)
    expect(demandeDeSubventionRecord?.subventionEtp).toBe(10000)
    expect(demandeDeSubventionRecord?.subventionPrestation).toBe(15000)

    const actualDemandeId = demandeDeSubventionRecord!.id
    const beneficiaires = await prisma.beneficiaireSubventionRecord.findMany({
      where: {
        demandeDeSubventionId: actualDemandeId,
      },
    })

    expect(beneficiaires).toHaveLength(2)
  })
})
