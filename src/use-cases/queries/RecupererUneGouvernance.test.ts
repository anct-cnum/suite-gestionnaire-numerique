import { RecupererUneGouvernance, UneGouvernanceLoader, UneGouvernanceReadModel } from './RecupererUneGouvernance'
import { GetUtilisateurRepository } from '../commands/shared/UtilisateurRepository'
import { gouvernanceReadModelFactory } from '../testHelper'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('recupérer une gouvernance', () => {
  beforeEach(() => {
    uneGouvernance = gouvernanceReadModelFactory({ uid: '69' })
    spiedCodeDepartement = ''
  })

  it('quand une gouvernance est demandée sur un département alors on la récupère', async () => {
    // GIVEN
    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub()
    )

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69', uidUtilisateurCourant: 'fooId' })

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
    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub()
    )

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69', uidUtilisateurCourant: 'fooId' })

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
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }, {  nom: 'Feuille de route numérique du Rhône', uid: '1' }],
            links: {},
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            telephone: '+33 4 45 00 45 00',
            type: 'Préfecture départementale',
            uid: 'membreNonCoporteurId',
          },
        ],
        total: 1,
      },
    }
    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub()
    )

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69', uidUtilisateurCourant: 'fooId' })

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
          feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }, { nom: 'Feuille de route numérique du Rhône', uid: '1' }],
          links: {},
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          type: 'Préfecture départementale',
          uid: 'membreNonCoporteurId',
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
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '44' }],
            links: {},
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantsSubventionsAccordees: 5_000,
            totalMontantsSubventionsFormationAccordees: 5_000,
            type: 'Collectivité, EPCI',
            uid: 'membreNonCoporteurId',
          },
        ],
        total: 1,
      },
    }
    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub()
    )

    // WHEN
    const gouvernance = await queryHandler.handle({ codeDepartement: '69', uidUtilisateurCourant: 'fooId' })

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
          feuillesDeRoute: [{  nom: 'Feuille de route inclusion', uid: '44' }],
          links: {
            plusDetails: '/',
          },
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantsSubventionsAccordees: 5000,
          totalMontantsSubventionsFormationAccordees: 5000,
          type: 'Collectivité, EPCI',
          uid: 'membreNonCoporteurId',
        },
      ],
      total: 1,
    })
    expect(spiedCodeDepartement).toBe('69')
  })

  it('quand une gouvernance est consultée par un utilisateur qui n‘est pas gestionnaire département alors il ne peut pas voir la note privée', async () => {
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
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }],
            links: {
              plusDetails: '/',
            },
            nom: 'Département du Rhône',
            roles: ['observateur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantsSubventionsAccordees: 5_000,
            totalMontantsSubventionsFormationAccordees: 5_000,
            type: 'Collectivité, EPCI',
            uid: 'membreNonCoporteurId',
          },
        ],
        total: 2,
      },
    }

    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurNonGestionnaireDepartementRepositoryStub()
    )

    // WHEN
    const gouvernance = await queryHandler.handle({
      codeDepartement: '69',
      uidUtilisateurCourant: 'membreNonCoporteurId',
    })

    // THEN
    expect(gouvernance).toStrictEqual({
      ...uneGouvernance,
      peutVoirNotePrivee: false,
    })
  })

  it('quand une gouvernance est consultée par un utilisateur qui est gestionnaire département sur un département autre que celui de la gouvernance alors il ne peut pas voir la note privée', async () => {
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
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }],
            links: {
              plusDetails: '/',
            },
            nom: 'Département du Rhône',
            roles: ['observateur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantsSubventionsAccordees: 5_000,
            totalMontantsSubventionsFormationAccordees: 5_000,
            type: 'Collectivité, EPCI',
            uid: 'membreNonCoporteurId',
          },
        ],
        total: 2,
      },
    }

    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub('11')
    )

    // WHEN
    const gouvernance = await queryHandler.handle({
      codeDepartement: '69',
      uidUtilisateurCourant: 'membreNonCoporteurId',
    })

    // THEN
    expect(gouvernance).toStrictEqual({
      ...uneGouvernance,
      peutVoirNotePrivee: false,
    })
  })

  it('quand une gouvernance est consultée par un utilisateur qui est gestionnaire département sur le même département que celui de la gouvernance alors il peut voir la note privée', async () => {
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
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }],
            links: {
              plusDetails: '/',
            },
            nom: 'Département du Rhône',
            roles: ['observateur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantsSubventionsAccordees: 5_000,
            totalMontantsSubventionsFormationAccordees: 5_000,
            type: 'Collectivité, EPCI',
            uid: 'membreNonCoporteurId',
          },
        ],
        total: 2,
      },
    }

    const queryHandler = new RecupererUneGouvernance(
      new GouvernanceLoaderSpy(),
      new UtilisateurRepositoryStub('69')
    )

    // WHEN
    const gouvernance = await queryHandler.handle({
      codeDepartement: '69',
      uidUtilisateurCourant: 'membreNonCoporteurId',
    })

    // THEN
    expect(gouvernance).toStrictEqual({
      ...uneGouvernance,
      peutVoirNotePrivee: true,
    })
  })
})

let uneGouvernance: UneGouvernanceReadModel = gouvernanceReadModelFactory({ uid: '69' })
let spiedCodeDepartement = ''

const gouvernanceEnrichie: UneGouvernanceReadModel = {
  ...uneGouvernance,
  syntheseMembres: {
    ...uneGouvernance.syntheseMembres,
    coporteurs: [
      uneGouvernance.syntheseMembres.coporteurs[0],
      {
        ...uneGouvernance.syntheseMembres.coporteurs[1],
        totalMontantsSubventionsAccordees: 5_000,
        totalMontantsSubventionsFormationAccordees: 5_000,
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

class UtilisateurRepositoryStub implements GetUtilisateurRepository {
  readonly #codeDepartement: string

  constructor(codeDepartement = '69') {
    this.#codeDepartement = codeDepartement
  }

  async get(): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: this.#codeDepartement,
      role: 'Gestionnaire département',
    }))
  }
}

class UtilisateurNonGestionnaireDepartementRepositoryStub implements GetUtilisateurRepository {
  async get(): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory())
  }
}
