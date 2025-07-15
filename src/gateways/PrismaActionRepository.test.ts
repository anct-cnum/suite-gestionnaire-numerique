
import { describe, expect, it } from 'vitest'

import { PrismaActionRepository } from './PrismaActionRepository'
import { actionRecordFactory, creerUnContact, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre,  creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { actionFactory } from '@/domain/testHelper'
import { epochTime } from '@/shared/testHelper'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'

describe('action repository', () => {
  it('ajouter une action à une feuille de route', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // GIVEN    
        const departementCode = '69'
        const uidEditeur = 'userFooId'
        const uidPorteur = 'porteurId'
        const feuilleDeRouteId = 1
        const utilisateurId = 1

        await creerUneRegion(undefined, tx)
        await creerUnDepartement({ code: departementCode }, tx)
        await creerUneGouvernance({ departementCode }, tx)
        await creerUnContact({
          email: 'structure@example.com',
          fonction: 'Directeur',
          nom: 'Tartempion',
          prenom: 'Michel',
        }, tx)
        await creerUnMembre({
          contact: 'structure@example.com',
          gouvernanceDepartementCode: departementCode,
          id: uidPorteur,
        }, tx)
        await creerUnUtilisateur({
          id: utilisateurId,
          ssoId: uidEditeur,
        }, tx)

        await creerUneFeuilleDeRoute({
          creation: new Date(epochTime),
          derniereEdition: new Date(epochTime),
          gouvernanceDepartementCode: departementCode,
          id: feuilleDeRouteId,
          porteurId: uidPorteur,
        }, tx)

        const action = actionFactory({
          besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL, BesoinsPossible.STRUCTURER_UN_FONDS],
          budgetGlobal: 50_000,
          contexte: 'Contexte de test',
          dateDeCreation: epochTime,
          dateDeDebut: '2024',
          dateDeFin: '2025',
          description: 'Description détaillée de l\'action',
          nom: 'Action test',
          uid: {
            value: 'actionId',
          },
          uidCreateur: uidEditeur,
          uidFeuilleDeRoute: { value: feuilleDeRouteId.toString() },
          uidPorteurs: [uidPorteur],
        })

        // WHEN
        const actionCree = await new PrismaActionRepository().add(action, tx)

        // THEN
        expect(Number.isInteger(actionCree)).toBe(true)

        const actionRecord = await tx.actionRecord.findFirst({
          where: {
            feuilleDeRouteId,
          },
        })

        expect(actionRecord).toMatchObject(actionRecordFactory({
          budgetGlobal: 50000,
          contexte: 'Contexte de test',
          dateDeDebut: new Date('2024-01-01'),
          dateDeFin: new Date('2025-01-01'),
          description: 'Description détaillée de l\'action',
          feuilleDeRouteId,
          nom: 'Action test',
        }))
        throw new Error('ROLLBACK_TEST')
      })
    ).rejects.toThrow('ROLLBACK_TEST')
  })
})
