import { UneGouvernanceLoader, RecupererUneGouvernance, UneGouvernanceReadModel } from './RecupererUneGouvernance'
import { gouvernanceReadModelFactory } from '../testHelper'

describe('recupérer une gouvernance', () => {
  beforeEach(() => {
    uneGouvernance = gouvernanceReadModelFactory()
    spiedCodeDepartement = ''
  })

  it('quand une gouvernance est demandée sur un département alors on la récupère en calculant les totaux des montants de subvention', async () => {
    // GIVEN
    const queryHandler = new RecupererUneGouvernance(new GouvernanceLoaderSpy())

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69' })

    // THEN
    expect(gouvernance).toStrictEqual(gouvernanceEnrichie)
    expect(spiedCodeDepartement).toBe('69')
  })

  it("quand une gouvernance sans membre est demandée sur un département et qu'elle existe alors on la récupère", async () => {
    // GIVEN
    uneGouvernance = {
      ...uneGouvernance,
      syntheseMembres: {
        candidats: 0,
        coporteurs: [],
        total: 0,
      },
    }
    const queryHandler = new RecupererUneGouvernance(new GouvernanceLoaderSpy())

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69' })

    // THEN
    expect(gouvernance).toStrictEqual(gouvernanceSansMembre)
    expect(spiedCodeDepartement).toBe('69')
  })

  it('quand une gouvernance est demandée sur un département et contenant 1 membre préfecture departementale, alors on la récupère sans les totaux subventions et sans lien mais avec le contact technique', async () => {
    // GIVEN
    uneGouvernance = {
      ...uneGouvernance,
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
            links: {},
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            telephone: '+33 4 45 00 45 00',
            type: 'Préfecture départementale',
          },
        ],
        total: 1,
      },
    }
    const queryHandler = new RecupererUneGouvernance(new GouvernanceLoaderSpy())

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69' })

    // THEN
    expect(gouvernance.syntheseMembres).toStrictEqual<UneGouvernanceReadModel['syntheseMembres']>({
      candidats: 0,
      coporteurs: [
        {
          contactReferent: {
            denomination: 'Contact politique de la collectivité',
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
          links: {},
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          type: 'Préfecture départementale',
        },
      ],
      total: 1,
    })
  })

  it("quand une gouvernance est demandée sur un département et qu'elle existe, contenant 1 membre autre que la préfecture departementale, alors on la récupère avec les totaux subventions et avec le lien mais sans le contact technique", async () => {
    // GIVEN
    uneGouvernance = {
      ...uneGouvernance,
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'didier.durand@exemple.com',
              nom: 'Didier',
              poste: 'chargé de mission',
              prenom: 'Durant',
            },
            feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }],
            links: {},
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
            type: 'Collectivité, EPCI',
          },
        ],
        total: 1,
      },
    }
    const queryHandler = new RecupererUneGouvernance(new GouvernanceLoaderSpy())

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69' })

    // THEN
    expect(gouvernance.syntheseMembres).toStrictEqual<UneGouvernanceReadModel['syntheseMembres']>({
      candidats: 0,
      coporteurs: [
        {
          contactReferent: {
            denomination: 'Contact référent',
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }],
          links: {
            plusDetails: '/',
          },
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: 5000,
          totalMontantSubventionFormationAccorde: 5000,
          type: 'Collectivité, EPCI',
        },
      ],
      total: 1,
    })
    expect(spiedCodeDepartement).toBe('69')
  })
})

let uneGouvernance: UneGouvernanceReadModel = gouvernanceReadModelFactory()
let spiedCodeDepartement = ''

const gouvernanceEnrichie: UneGouvernanceReadModel = {
  ...uneGouvernance,
  syntheseMembres: {
    ...uneGouvernance.syntheseMembres,
    coporteurs: [
      uneGouvernance.syntheseMembres.coporteurs[0],
      {
        ...uneGouvernance.syntheseMembres.coporteurs[1],
        totalMontantSubventionAccorde: 5_000,
        totalMontantSubventionFormationAccorde: 5_000,
      },
    ],
  },
}

const gouvernanceSansMembre: UneGouvernanceReadModel = {
  ...uneGouvernance,
  syntheseMembres: {
    candidats: 0,
    coporteurs: [],
    total: 0,
  },
}

class GouvernanceLoaderSpy implements UneGouvernanceLoader {
  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    spiedCodeDepartement = codeDepartement
    return Promise.resolve(uneGouvernance)
  }
}
