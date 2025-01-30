import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { departementRecordFactory, regionRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance existante sont demandés, alors elle sont renvoyée', async () => {
    // GIVEN
    await ajoutRegionGouvernance()
    await ajoutDepartementGouvernance()
    await ajoutGouvernance()
    await ajoutMembreGouvernanceCommune()
    await ajoutMembreGouvernanceEpci()
    await ajoutMembreGouvernanceStructure()
    await ajoutMembreGouvernanceDepartement()
    await ajoutMembreGouvernanceSgar()

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

async function ajoutRegionGouvernance(): Promise<void> {
  await prisma.regionRecord.create({
    data: regionRecordFactory({
      code: '84',
      nom: 'Auvergne-Rhône-Alpes',
    }),
  })
}

async function ajoutDepartementGouvernance(): Promise<void> {
  await prisma.departementRecord.create({
    data: departementRecordFactory({
      code: '69',
      nom: 'Rhône',
      regionCode: '84',
    }),
  })
}

async function ajoutGouvernance(): Promise<void> {
  await prisma.gouvernanceRecord.create({
    data: {
      departementCode: '69',
    },
  })
}

async function ajoutMembreGouvernanceStructure(): Promise<void> {
  await prisma.membreGouvernanceStructureRecord.create({
    data: {
      gouvernanceDepartementCode: '69',
      role: 'coporteur',
      structure: 'Préfecture du Rhône',
    },
  })

  await prisma.membreGouvernanceStructureRecord.create({
    data:
      {
        gouvernanceDepartementCode: '69',
        role: 'coporteur',
        structure: 'Département du Rhône',
      },
  })

  await prisma.membreGouvernanceStructureRecord.create({
    data:
      {
        gouvernanceDepartementCode: '69',
        role: 'cofinanceur',
        structure: 'Département du Rhône',
      },
  })
}

async function ajoutMembreGouvernanceCommune(): Promise<void> {
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Mornant',
      gouvernanceDepartementCode: '69',
      role: 'cofinanceur',
    },
  })
}

async function ajoutMembreGouvernanceEpci(): Promise<void> {
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'Métropole de Lyon',
      gouvernanceDepartementCode: '69',
      role: 'recipiendaire',
    },
  })
}

async function ajoutMembreGouvernanceDepartement(): Promise<void> {
  await prisma.membreGouvernanceDepartementRecord.create({
    data: {
      departementCode: '69',
      gouvernanceDepartementCode: '69',
      role: 'cofinanceur',
    },
  })
}

async function ajoutMembreGouvernanceSgar(): Promise<void> {
  await prisma.membreGouvernanceSgarRecord.create({
    data: {
      gouvernanceDepartementCode: '69',
      role: 'recipiendaire',
      sgarCode: '84',
    },
  })
}
