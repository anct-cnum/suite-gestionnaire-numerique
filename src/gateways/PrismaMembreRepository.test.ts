import { Prisma } from '@prisma/client'

import { PrismaMembreRepository } from './PrismaMembreRepository'
import { creerUnContact, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUneStructure, creerUnMembre } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MembreUid } from '@/domain/Membre'
import { membreConfirmeFactory } from '@/domain/testHelper'

describe('membre repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('rechercher un membre qui n\'existe pas', async () => {
    // GIVEN
    await creerUneRegion()
    await creerUnDepartement({ code: '69' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 1 })
    await creerUnMembre({ id: 'prefecture-69', structureId: 1 })

    // WHEN
    const membre = new PrismaMembreRepository().get(new MembreUid('prefecture-93').state.value)

    // THEN
    await expect(membre).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(membre).rejects.toMatchObject({ code: 'P2025' })
  })

  it('rechercher un membre département qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', nom: 'Lyon', regionCode: '84' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 1, nom: 'Lyon' })
    await creerUneStructure({ departementCode: '93', id: 2, nom: 'Structure 93' })
    await creerUnMembre({ id: 'departement-69-69', statut: 'confirme', structureId: 1 })
    await creerUnMembre({ id: 'departement-93-93', statut: 'confirme', structureId: 2 })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('departement-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      dateSuppression: undefined,
      nom: 'Lyon',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'departement-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
      uidStructure: {
        value: 1,
      },
    })
  })

  it('rechercher un membre sgar qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUnDepartement({ code: '93', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 3, nom: 'Auvergne-Rhône-Alpes' })
    await creerUneStructure({ departementCode: '93', id: 4, nom: 'Structure SGAR 93' })
    await creerUnMembre({ id: 'sgar-69-69', statut: 'confirme', structureId: 3 })
    await creerUnMembre({ id: 'sgar-93-93', statut: 'confirme', structureId: 4 })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('sgar-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      dateSuppression: undefined,
      nom: 'Auvergne-Rhône-Alpes',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'sgar-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
      uidStructure: {
        value: 3,
      },
    })
  })

  it('rechercher un membre commune qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUnDepartement({ code: '93', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 5, nom: 'Paris' })
    await creerUneStructure({ departementCode: '93', id: 6, nom: 'Structure 93' })
    await creerUnMembre({ id: 'commune-69-69', statut: 'confirme', structureId: 5 })
    await creerUnMembre({ id: 'commune-93-93', statut: 'confirme', structureId: 6 })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('commune-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      dateSuppression: undefined,
      nom: 'Paris',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'commune-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
      uidStructure: {
        value: 5,
      },
    })
  })

  it('rechercher un membre epci qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUnDepartement({ code: '93', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 7, nom: 'Bordeaux Métropole' })
    await creerUneStructure({ departementCode: '93', id: 8, nom: 'Structure EPCI 93' })
    await creerUnMembre({ id: 'epci-69-69', statut: 'confirme', structureId: 7 })
    await creerUnMembre({ id: 'epci-93-93', statut: 'confirme', structureId: 8 })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('epci-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      dateSuppression: undefined,
      nom: 'Bordeaux Métropole',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'epci-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
      uidStructure: {
        value: 7,
      },
    })
  })

  it('rechercher un membre structure qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUnDepartement({ code: '93', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 9, nom: 'HUBIKOOP' })
    await creerUneStructure({ departementCode: '93', id: 10, nom: 'Structure 93' })
    await creerUnMembre({ id: 'structure-69-69', statut: 'candidat', structureId: 9 })
    await creerUnMembre({ id: 'structure-93-93', statut: 'confirme', structureId: 10 })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('structure-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      dateSuppression: undefined,
      nom: 'HUBIKOOP',
      roles: ['observateur'],
      statut: 'candidat',
      uid: {
        value: 'structure-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
      uidStructure: {
        value: 9,
      },
    })
  })

  it('mettre à jour le statut du membre', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUneStructure({ departementCode: '69', id: 11, nom: 'HUBIKOOP' })
    await creerUnMembre({
      categorieMembre: 'Préfecture départementale',
      gouvernanceDepartementCode: '69',
      id: 'structure-69-69',
      statut: 'candidat',
      structureId: 11,
      type: 'Préfecture départementale',

    })
    await creerUnMembre({ id: 'structure-93-93', statut: 'confirme' })

    // WHEN
    await new PrismaMembreRepository().update(membreConfirmeFactory({
      statut: 'confirme',
      uid: {
        value: 'structure-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    }))

    // THEN
    const modifiedRecord = await prisma.membreRecord.findUnique({ where: { id: 'structure-69-69' } })
    expect(modifiedRecord).toStrictEqual({
      categorieMembre: 'Préfecture départementale',
      contact: 'email@example.com',
      contactTechnique: null,
      dateSuppression: null,
      gouvernanceDepartementCode: '69',
      id: 'structure-69-69',
      isCoporteur: false,
      oldStructureId: null,
      oldUUID: '30ca3fa5-76b8-471d-a811-d96074b18eb1',
      siretRidet: null,
      statut: 'confirme',
      structureId: 11,
      type: 'Préfecture départementale',
    })
  })
})
