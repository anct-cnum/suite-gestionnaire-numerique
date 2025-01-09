import {
  UneGouvernanceReadModel,
  UneGouvernanceReadModelLoader,
  RecupererUneGouvernance,
  GouvernanceReadModel,
} from './RecupererUneGouvernance'

describe('recupererUneGouvernance', () => {
  it("quand une gouvernance est demandée sur un département et qu'elle n'existe pas alors on récupère une gouvernance vide", async () => {
    // GIVEN
    const queryHandler = new RecupererUneGouvernance(new GouvernanceInexistanteLoaderStub())

    // WHEN
    const gouvernance = await queryHandler.get({ codeDepartement: '93' })

    // THEN
    expect(gouvernance).toBeNull()
  })

  it("quand une gouvernance sans membre est demandée sur un département et qu'elle existe alors on la récupère", async () => {
    // GIVEN
    const queryHandler = new RecupererUneGouvernance(new GouvernanceExistanteLoaderStub())

    // WHEN
    const gouvernance = await queryHandler.get({ codeDepartement: '93' })

    // THEN
    expect(gouvernance).toStrictEqual(gouvernanceReadModel)
  })

  it("quand une gouvernance est demandée sur un département et qu'elle existe alors on la récupère en calculant les totaux des montants de subvention", async () => {
    // GIVEN
    const queryHandler = new RecupererUneGouvernance(new GouvernanceSansMembreLoaderStub())

    // WHEN
    const gouvernance = await queryHandler.get({ codeDepartement: '93' })

    // THEN
    expect(gouvernance).toStrictEqual(gouvernanceSansMembreReadModel)
  })
})

const uneGouvernance = {
  comites: [
    {
      commentaire: 'commentaire',
      dateProchainComite: new Date('2024-11-23'),
      nom: '',
      periodicite: 'trimestrielle',
      type: 'stratégique' as const,
    },
  ],
  departement: 'Seine-Saint-Denis',
  feuillesDeRoute: [
    {
      beneficiairesSubvention: [
        { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
        { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
      ],
      beneficiairesSubventionFormation: [
        { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
        { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
      ],
      budgetGlobal: 145_000,
      montantSubventionAccorde: 5_000,
      montantSubventionDemande: 40_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route inclusion 1',
      porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
      totalActions: 3,
    },
    {
      beneficiairesSubvention: [],
      beneficiairesSubventionFormation: [
        { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
        { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
      ],
      budgetGlobal: 145_000,
      montantSubventionAccorde: 5_000,
      montantSubventionDemande: 40_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route inclusion 2',
      porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
      totalActions: 2,
    },
  ],
  membres: [
    {
      contactReferent: {
        mailContact: 'julien.deschamps@rhones.gouv.fr',
        nom: 'Henrich',
        poste: 'chargé de mission',
        prenom: 'Laetitia',
      },
      contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 5_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 5_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route numérique du Rhône',
        },
      ],
      nom: 'Préfecture du Rhône',
      roles: ['Co-porteur'],
      telephone: '+33 4 45 00 45 00',
      type: 'Administration',
      typologieMembre: 'Préfecture départementale',
    },
    {
      contactReferent: {
        mailContact: 'didier.durand@exemple.com',
        nom: 'Didier',
        poste: 'chargé de mission',
        prenom: 'Durant',
      },
      contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 30_000,
          montantSubventionFormationAccorde: 20_000,
          nom: 'Feuille de route inclusion',
        },
      ],
      nom: 'Département du Rhône',
      roles: ['Co-porteur', 'Financeur'],
      telephone: '+33 4 45 00 45 01',
      type: 'Collectivité',
      typologieMembre: 'Collectivité, EPCI',
    },
    {
      contactReferent: {
        mailContact: 'coco.dupont@rhones.gouv.fr',
        nom: 'Coco',
        poste: 'chargé de mission',
        prenom: 'Dupont',
      },
      contactTechnique: 'coco.dupont@rhones.gouv.fr',
      feuillesDeRoute: [],
      nom: 'CC des Monts du Lyonnais',
      roles: ['Co-porteur', 'Financeur'],
      telephone: '',
      type: 'Collectivité',
      typologieMembre: 'Collectivité, EPCI',
    },
  ],
  noteDeContexte: undefined,
  uid: '123456',
}

const uneGouvernanceSansMembre = {
  ...uneGouvernance,
  membres: undefined,
}

const gouvernanceReadModel: GouvernanceReadModel = {
  ...uneGouvernance,
  membres: [
    {
      ...uneGouvernance.membres[0],
      totalMontantSubventionAccorde: 10_000,
      totalMontantSubventionFormationAccorde: 10_000,
    },
    {
      ...uneGouvernance.membres[1],
      totalMontantSubventionAccorde: 30_000,
      totalMontantSubventionFormationAccorde: 20_000,
    },
    {
      ...uneGouvernance.membres[2],
      totalMontantSubventionAccorde: 0,
      totalMontantSubventionFormationAccorde: 0,
    },
  ],
}

const gouvernanceSansMembreReadModel = {
  ...uneGouvernance,
  membres: [],
}

class GouvernanceInexistanteLoaderStub implements UneGouvernanceReadModelLoader {
  async find(_codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    return Promise.resolve(null)
  }
}

class GouvernanceSansMembreLoaderStub implements UneGouvernanceReadModelLoader {
  async find(_codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    return Promise.resolve(uneGouvernanceSansMembre)
  }
}

class GouvernanceExistanteLoaderStub implements UneGouvernanceReadModelLoader {
  async find(_codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    return Promise.resolve(uneGouvernance)
  }
}
