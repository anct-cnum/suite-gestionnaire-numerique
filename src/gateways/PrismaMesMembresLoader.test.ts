import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnMembreCommune, creerUnMembreDepartement, creerUnMembreEpci, creerUnMembreSgar, creerUnMembreStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance sont demandés, alors elle sont renvoyée dans l’ordre alphabétique', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnMembreCommune()
    await creerUnMembreEpci()
    await creerUnMembreStructure()
    await creerUnMembreStructure({ structure: 'Département du Rhône' })
    await creerUnMembreStructure({ role: 'cofinanceur', structure: 'Département du Rhône' })
    await creerUnMembreDepartement()
    await creerUnMembreSgar()

    // WHEN
    const mesMembresLoader = new PrismaMesMembresLoader(prisma)
    const mesMembresReadModel = await mesMembresLoader.get('69')

    // THEN
    expect(mesMembresReadModel).toStrictEqual({
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
            prenom: 'Justine',
          },
          nom: 'Auvergne-Rhône-Alpes',
          roles: ['recipiendaire'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité',
        },
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Mornant',
          roles: ['cofinanceur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Métropole de Lyon',
          roles: ['recipiendaire'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            nom: 'Henrich',
            prenom: 'Laetitia',
          },
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture départementale',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Paul',
          },
          nom: 'Rhône',
          roles: ['cofinanceur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité',
        },
      ],
      roles: [],
      typologies: [],
    })
  })
})
