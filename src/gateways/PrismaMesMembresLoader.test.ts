import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreCommune, creerUnMembreDepartement, creerUnMembreEpci, creerUnMembreSgar, creerUnMembreStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance sont demandés, alors ils sont renvoyés dans l’ordre alphabétique', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'commune-69141-69', type: 'Collectivité, commune' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'epci-200046977-69', type: 'Collectivité, EPCI' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'structure-79201467200028-69', type: 'Association' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'structure-13000548122782-69', type: 'Association' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'prefecture-69', type: 'Préfecture départementale' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'departement-69-69', type: 'Conseil départemental' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'region-84-69', type: 'Préfecture régionale' })
    await creerUnMembreCommune({ membreId: 'commune-69141-69', role: 'coporteur' })
    await creerUnMembreCommune({ membreId: 'commune-69141-69', role: 'cofinanceur' })
    await creerUnMembreEpci({ membreId: 'epci-200046977-69', role: 'recipiendaire' })
    await creerUnMembreStructure({ membreId: 'structure-79201467200028-69', role: 'coporteur' })
    await creerUnMembreStructure({
      membreId: 'structure-13000548122782-69',
      role: 'coporteur',
      structure: 'Pôle emploi',
    })
    await creerUnMembreStructure({
      membreId: 'structure-13000548122782-69',
      role: 'cofinanceur',
      structure: 'Pôle emploi',
    })
    await creerUnMembreDepartement({ membreId: 'departement-69-69', role: 'cofinanceur' })
    await creerUnMembreDepartement({ membreId: 'prefecture-69', role: 'coporteur' })
    await creerUnMembreSgar({ membreId: 'region-84-69', role: 'recipiendaire' })

    // WHEN
    const mesMembresLoader = new PrismaMesMembresLoader(prisma.gouvernanceRecord)
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
            prenom: 'Valérie',
          },
          nom: 'Auvergne-Rhône-Alpes',
          roles: ['recipiendaire'],
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
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
            prenom: 'Valérie',
          },
          nom: 'Mornant',
          roles: ['cofinanceur', 'coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Pimms Médiation Grand Poitiers',
          roles: ['coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Association',
        },
        {
          contactReferent: {
            nom: 'Dupont',
            prenom: 'Valérie',
          },
          nom: 'Pôle emploi',
          roles: ['cofinanceur', 'coporteur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Association',
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
          roles: ['cofinanceur'],
          suppressionDuMembreAutorise: false,
          typologie: 'Conseil départemental',
        },
      ],
      roles: [],
      typologies: [],
    })
  })
})
