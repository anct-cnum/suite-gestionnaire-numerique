import { Prisma } from '@prisma/client'

import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { creerMembres, creerUnDepartement, creerUneGouvernance, creerUneRegion } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance sont demandés, alors ils sont renvoyés dans l’ordre alphabétique', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUneRegion({ code: '11', nom: 'Île-de-France' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerMembres('69')

    // WHEN
    const mesMembresLoader = new PrismaMesMembresLoader(prisma.gouvernanceRecord)
    const mesMembresReadModel = await mesMembresLoader.get('69')

    // THEN
    expect(mesMembresReadModel).toStrictEqual<MesMembresReadModel>({
      autorisations: {
        accesMembreConfirme: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: [
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Bretagne',
          roles: ['coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'CA Tulle Agglo',
          roles: ['observateur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },

          nom: 'CC Porte du Jura',
          roles: ['beneficiaire', 'coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Créteil',
          roles: ['coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },

          nom: 'Île-de-France',
          roles: ['observateur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Orange',
          roles: ['coporteur', 'recipiendaire'],
          suppressionDuMembreAutorise: false,
          typologie: 'Entreprise privée',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Rhône',
          roles: ['coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture départementale',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Rhône',
          roles: ['observateur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Conseil départemental',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Trévérien',
          roles: [
            'beneficiaire',
            'recipiendaire',
          ],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
        },

      ],
      roles: [],
      typologies: [],
    })
  })

  it('quand des membres de gouvernance sont demandés pour un départment non existant, alors ils une exception est levée', async () => {
    // GIVEN
    const codeDepartementInexistant = 'code_departement_inexistant'
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })

    // WHEN
    const mesMembresReadModel = new PrismaMesMembresLoader(prisma.gouvernanceRecord).get(codeDepartementInexistant)

    // THEN
    await expect(mesMembresReadModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(mesMembresReadModel).rejects.toMatchObject({ code: 'P2025' })
  })
})
