import { Prisma } from '@prisma/client'

import { PrismaMembreRepository } from './PrismaMembreRepository'
import { creerUnContact, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreCommune, creerUnMembreDepartement, creerUnMembreEpci, creerUnMembreSgar, creerUnMembreStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MembreUid } from '@/domain/Membre'
import { membreConfirmeFactory } from '@/domain/testHelper'

describe('membre repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('rechercher un membre qui n’existe pas', async () => {
    // GIVEN
    await creerUneRegion()
    await creerUnDepartement({ code: '69' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'prefecture-69' })

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
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'departement-69-69', statut: 'confirme' })
    await creerUnMembreDepartement({ departementCode: '69', membreId: 'departement-69-69', role: 'observateur' })
    await creerUnMembre({ id: 'departement-93-93', statut: 'confirme' })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('departement-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      nom: 'Lyon',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'departement-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    })
  })

  it('rechercher un membre sgar qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'sgar-69-69', statut: 'confirme' })
    await creerUnMembreSgar({ membreId: 'sgar-69-69', role: 'observateur', sgarCode: '84' })
    await creerUnMembre({ id: 'sgar-93-93', statut: 'confirme' })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('sgar-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      nom: 'Auvergne-Rhône-Alpes',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'sgar-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    })
  })

  it('rechercher un membre commune qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'commune-69-69', statut: 'confirme' })
    await creerUnMembreCommune({ commune: 'Paris', membreId: 'commune-69-69', role: 'observateur' })
    await creerUnMembre({ id: 'commune-93-93', statut: 'confirme' })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('commune-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      nom: 'Paris',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'commune-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    })
  })

  it('rechercher un membre epci qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'epci-69-69', statut: 'confirme' })
    await creerUnMembreEpci({ epci: 'Bordeaux Métropole', membreId: 'epci-69-69', role: 'observateur' })
    await creerUnMembre({ id: 'epci-93-93', statut: 'confirme' })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('epci-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      nom: 'Bordeaux Métropole',
      roles: ['observateur'],
      statut: 'confirme',
      uid: {
        value: 'epci-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    })
  })

  it('rechercher un membre structure qui existe', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({ id: 'structure-69-69', statut: 'candidat' })
    await creerUnMembreStructure({ membreId: 'structure-69-69', role: 'observateur', structure: 'HUBIKOOP' })
    await creerUnMembre({ id: 'structure-93-93', statut: 'confirme' })

    // WHEN
    const membre = await new PrismaMembreRepository().get(new MembreUid('structure-69-69').state.value)

    // THEN
    expect(membre.state).toStrictEqual({
      nom: 'HUBIKOOP',
      roles: ['observateur'],
      statut: 'candidat',
      uid: {
        value: 'structure-69-69',
      },
      uidGouvernance: {
        value: '69',
      },
    })
  })

  it('mettre à jour le statut du membre', async () => {
    // GIVEN
    await creerUneRegion({ code: '84' })
    await creerUnDepartement({ code: '69', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnContact()
    await creerUnMembre({
      gouvernanceDepartementCode: '69',
      id: 'structure-69-69',
      statut: 'candidat',
      type: 'Préfecture départementale',
    })
    await creerUnMembreStructure({ membreId: 'structure-69-69', role: 'observateur', structure: 'HUBIKOOP' })
    await creerUnMembre({ id: 'structure-93-93', statut: 'confirme' })

    // WHEN
    await new PrismaMembreRepository().update(membreConfirmeFactory({
      nom: 'La Poste',
      roles: ['observateur'],
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
      contact: 'email@example.com',
      contactTechnique: null,
      gouvernanceDepartementCode: '69',
      id: 'structure-69-69',
      oldUUID: '30ca3fa5-76b8-471d-a811-d96074b18eb1',
      statut: 'confirme',
      type: 'Préfecture départementale',
    })
  })
})
