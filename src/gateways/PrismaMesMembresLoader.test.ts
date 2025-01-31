import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { ajouterUnDepartement, ajouterUneGouvernance, ajouterUneRegion, ajouterUnMembreCommune, ajouterUnMembreDepartement, ajouterUnMembreEpci, ajouterUnMembreSgar, ajouterUnMembreStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance existante sont demandés, alors elle sont renvoyée', async () => {
    // GIVEN
    await ajouterUneRegion()
    await ajouterUnDepartement()
    await ajouterUneGouvernance()
    await ajouterUnMembreCommune()
    await ajouterUnMembreEpci()
    await ajouterUnMembreStructure()
    await ajouterUnMembreStructure({ structure: 'Département du Rhône' })
    await ajouterUnMembreStructure({ role: 'cofinanceur', structure: 'Département du Rhône' })
    await ajouterUnMembreDepartement()
    await ajouterUnMembreSgar()

    // WHEN
    const mesMembresLoader = new PrismaMesMembresLoader(prisma)
    const mesMembresReadModel = await mesMembresLoader.findMesMembres('69', (mesMembres) => mesMembres)

    // THEN
    expect(mesMembresReadModel).toStrictEqual({
      autorisations: {
        accesMembreValide: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: [
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
