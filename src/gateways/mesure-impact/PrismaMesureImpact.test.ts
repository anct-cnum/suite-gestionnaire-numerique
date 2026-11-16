import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaCampagneLoader } from './PrismaCampagneLoader'
import { PrismaDefiConsommeRepository } from './PrismaDefiConsommeRepository'
import { PrismaReponseLoader } from './PrismaReponseLoader'
import { PrismaReponseRepository } from './PrismaReponseRepository'
import prisma from '../../../prisma/prismaClient'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Reponse } from '@/domain/mesure-impact/Reponse'
import { epochTime, epochTimeMinusOneDay, epochTimePlusOneDay } from '@/shared/testHelper'

describe('mesure d’impact (gateways Prisma)', () => {
  beforeEach(async () => {
    await prisma.main_structure_administrative.create({
      data: { denomination_sirene: 'COMMUNAUTE D AGGLOMERATION DU SICOVAL', id: STRUCTURE_ID },
    })
    await prisma.mesureImpactCampagneRecord.create({
      data: {
        fermeture: epochTimePlusOneDay,
        id: CAMPAGNE_ID,
        identifiantPublic: 'sicoval-test',
        libelleTerritoire: 'Sicoval',
        nom: 'Campagne test',
        ouverture: epochTime,
        questionnaireVersion: 'socle-v22',
        structureId: STRUCTURE_ID,
      },
    })
  })

  afterEach(async () => {
    await prisma.mesureImpactDefiConsommeRecord.deleteMany({ where: { signature: { startsWith: 'test-' } } })
    await prisma.mesureImpactReponseRecord.deleteMany({ where: { campagneId: CAMPAGNE_ID } })
    await prisma.mesureImpactCampagneRecord.deleteMany({ where: { id: CAMPAGNE_ID } })
    await prisma.main_structure_administrative.deleteMany({ where: { id: STRUCTURE_ID } })
  })

  it('charge une campagne par son identifiant public', async () => {
    // WHEN
    const campagne = await new PrismaCampagneLoader().parIdentifiantPublic('sicoval-test')

    // THEN
    expect(campagne?.state).toStrictEqual({
      fermeture: epochTimePlusOneDay.toJSON(),
      identifiantPublic: 'sicoval-test',
      libelleTerritoire: 'Sicoval',
      nom: 'Campagne test',
      ouverture: epochTime.toJSON(),
      questionnaireVersion: 'socle-v22',
      structureId: STRUCTURE_ID,
      uid: { value: CAMPAGNE_ID },
    })
  })

  it('une campagne inconnue ne donne rien', async () => {
    // WHEN
    const campagne = await new PrismaCampagneLoader().parIdentifiantPublic('inconnue')

    // THEN
    expect(campagne).toBeNull()
  })

  it('enregistre une réponse avec sa version, son canal et son contenu', async () => {
    // GIVEN
    const campagne = (await new PrismaCampagneLoader().parIdentifiantPublic('sicoval-test')) as Campagne
    const reponse = Reponse.deposer({
      campagne,
      canal: 'telephone',
      contenu: { q1: { autre: 'Jouer en ligne', valeur: ['autre'] }, q10: { valeur: '3' } },
      date: epochTime,
    })

    // WHEN
    await new PrismaReponseRepository().ajouter(reponse as Reponse)

    // THEN
    const enregistrees = await prisma.mesureImpactReponseRecord.findMany({
      select: { campagneId: true, canal: true, contenu: true, depot: true, questionnaireVersion: true },
      where: { campagneId: CAMPAGNE_ID },
    })
    expect(enregistrees).toStrictEqual([
      {
        campagneId: CAMPAGNE_ID,
        canal: 'telephone',
        contenu: { q1: { autre: 'Jouer en ligne', valeur: ['autre'] }, q10: { valeur: '3' } },
        depot: epochTime,
        questionnaireVersion: 'socle-v22',
      },
    ])
  })

  it('compte les réponses d’une campagne déposées depuis un instant', async () => {
    // GIVEN
    await prisma.mesureImpactReponseRecord.createMany({
      data: [epochTimeMinusOneDay, epochTime, epochTimePlusOneDay].map((depot) => ({
        campagneId: CAMPAGNE_ID,
        canal: 'en_ligne' as const,
        contenu: {},
        depot,
        questionnaireVersion: 'socle-v22',
      })),
    })

    // WHEN
    const nombre = await new PrismaReponseLoader().nombreDepuis('sicoval-test', epochTime)
    const autreCampagne = await new PrismaReponseLoader().nombreDepuis('inconnue', epochTime)

    // THEN
    expect(nombre).toBe(2)
    expect(autreCampagne).toBe(0)
  })

  it('un défi ne se consomme qu’une fois, et les défis échus sont oubliés', async () => {
    // GIVEN
    const defis = new PrismaDefiConsommeRepository()
    await defis.consommer('test-echu', epochTimeMinusOneDay, epochTimeMinusOneDay)

    // WHEN
    const premiere = await defis.consommer('test-defi', epochTimePlusOneDay, epochTime)
    const seconde = await defis.consommer('test-defi', epochTimePlusOneDay, epochTime)

    // THEN
    expect(premiere).toBe(true)
    expect(seconde).toBe(false)
    const gardes = await prisma.mesureImpactDefiConsommeRecord.findMany({
      where: { signature: { startsWith: 'test-' } },
    })
    expect(gardes).toStrictEqual([{ expiration: epochTimePlusOneDay, signature: 'test-defi' }])
  })
})

const STRUCTURE_ID = 990_207
const CAMPAGNE_ID = 990_207
