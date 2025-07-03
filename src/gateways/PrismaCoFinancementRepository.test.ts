import { PrismaCoFinancementRepository } from './PrismaCoFinancementRepository'
import {
  actionRecordFactory,
  creerUnContact,
  creerUnDepartement,
  creerUneAction,
  creerUneFeuilleDeRoute,
  creerUneGouvernance,
  creerUneRegion,
  creerUnMembre,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { coFinancementFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'

describe('co-financement repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('ajouter un co-financement à une action', async () => {
    // GIVEN
    const departementCode = '69'
    const actionId = 1
    const uidMembre = 'membreId'
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
      id: uidMembre,
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      gouvernanceDepartementCode: departementCode,
      id: 1,
      porteurId: uidMembre,
    })

    await creerUneAction({
      ...actionRecordFactory(),
      budgetGlobal: 50000,
      createurId: 1,
      feuilleDeRouteId: 1,
      id: actionId,
    })

    const coFinancement = coFinancementFactory({
      montant: 15000,
      uid: { value: '1' },
      uidAction: { value: actionId.toString() },
      uidMembre,
    })

    // WHEN
    const resultat = await new PrismaCoFinancementRepository().add(coFinancement)

    // THEN
    expect(resultat).toBe(true)

    const coFinancementRecord = await prisma.coFinancementRecord.findFirst({
      where: {
        actionId,
        memberId: uidMembre,
      },
    })

    expect(coFinancementRecord).toMatchObject({
      actionId,
      memberId: uidMembre,
      montant: 15000,
    })
    expect(coFinancementRecord?.actionId).toBe(actionId)
    expect(coFinancementRecord?.memberId).toBe(uidMembre)
    expect(coFinancementRecord?.montant).toBe(15000)
  })
})
