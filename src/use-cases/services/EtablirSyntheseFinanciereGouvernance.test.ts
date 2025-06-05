import { etablirSyntheseFinanciereGouvernance } from './EtablirSyntheseFinanciereGouvernance'
import { StatutSubvention } from "@/domain/DemandeDeSubvention"

describe('établir la synthèse financière d’une gouvernance', () => {
  describe('pour une gouvernance ne comportant ni demande de financement ni co-financement, quand la synthèse'
    + ' financière est établie, alors elle indique l’absence de bénéficiaire et de co-financeur ainsi qu’un budget,'
    + ' des montants de co-financement et de financement accordé nuls', () => {
    it.each([
      {
        cas: 'aucune feuille de route',
        gouvernanceASynthetiser: {
          feuillesDeRoute: [],
        },
        syntheseAttendue: {
          beneficiaires: 0,
          budget: 0,
          coFinancement: 0,
          coFinanceurs: 0,
          feuillesDeRoute: [],
          financementAccorde: 0,
          financementDemande: 0,
          financementFormationAccorde: 0,
        },
      },
      {
        cas: 'aucune action',
        gouvernanceASynthetiser: {
          feuillesDeRoute: [
            {
              actions: [],
              uid: 'feuilleDeRouteId',
            },
          ],
        },
        syntheseAttendue: {
          beneficiaires: 0,
          budget: 0,
          coFinancement: 0,
          coFinanceurs: 0,
          feuillesDeRoute: [
            {
              actions: [],
              beneficiaires: 0,
              budget: 0,
              coFinancement: 0,
              coFinanceurs: 0,
              financementAccorde: 0,
              financementDemande: 0,
              financementFormationAccorde: 0,
              uid: 'feuilleDeRouteId',
            },
          ],
          financementAccorde: 0,
          financementDemande: 0,
          financementFormationAccorde: 0,
        },
      },
      {
        cas: 'aucune action ne comporte de demande de financement ni de co-financement',
        gouvernanceASynthetiser: {
          feuillesDeRoute: [
            {
              actions: [
                {
                  beneficiaires: [],
                  budgetGlobal: 0,
                  coFinancements: [],
                  uid: 'actionId',
                },
              ],
              uid: 'feuilleDeRouteId',
            },
          ],
        },
        syntheseAttendue: {
          beneficiaires: 0,
          budget: 0,
          coFinancement: 0,
          coFinanceurs: 0,
          feuillesDeRoute: [{
            actions: [
              {
                beneficiaires: 0,
                budget: 0,
                coFinancement: 0,
                coFinanceurs: 0,
                financementAccorde: 0,
                financementDemande: 0,
                financementFormationAccorde: 0,
                isFormation: false,
                uid: 'actionId',
              },
            ],
            beneficiaires: 0,
            budget: 0,
            coFinancement: 0,
            coFinanceurs: 0,
            financementAccorde: 0,
            financementDemande: 0,
            financementFormationAccorde: 0,
            uid: 'feuilleDeRouteId',
          },
          ],
          financementAccorde: 0,
          financementDemande: 0,
          financementFormationAccorde: 0,
        },
      },
    ])('$cas', ({ gouvernanceASynthetiser, syntheseAttendue }) => {
      // GIVEN
      const gouvernance = gouvernanceASynthetiser

      // WHEN
      const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

      // THEN
      expect(synthese).toStrictEqual<ReturnType<typeof etablirSyntheseFinanciereGouvernance>>(syntheseAttendue)
    })
  })

  describe('étant donné une gouvernance, quand sa synthèse financiaire est établie, alors', () => {
    describe('pour chaque action', () => {
      describe('le montant de subvention accordé est égal', () => {
        it('à la somme des montants demandés des subventions en prestation et en ressources humaines pour les'
          + ' subventions acceptées', () => {
          // GIVEN
          const action = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention?.montants.prestation).toBe(20_000)
          expect(action.subvention?.montants.ressourcesHumaines).toBe(10_000)
          expect(action.subvention?.statut).toBe('acceptee')
          expect(syntheseAction.financementAccorde).toBe(30_000)
          expect(syntheseAction.financementDemande).toBe(30_000)
          expect(syntheseAction.financementFormationAccorde).toBe(0)
        })

        it.each([
          {
            libelle: 'déposées',
            statut: StatutSubvention.DEPOSEE,
          },
          {
            libelle: 'en cours',
            statut: StatutSubvention.EN_COURS,
          },
          {
            libelle: 'refusées',
            statut: StatutSubvention.REFUSEE,
          },
        ])('à zéro pour les demandes de subvention $libelle', ({ statut }) => {
          // GIVEN
          const action = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires(statut)
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention?.montants.prestation).toBe(20_000)
          expect(action.subvention?.montants.ressourcesHumaines).toBe(10_000)
          expect(action.subvention?.statut).toBe(statut)
          expect(syntheseAction.financementAccorde).toBe(0)
          expect(syntheseAction.financementDemande).toBe(30_000)
          expect(syntheseAction.financementFormationAccorde).toBe(0)
        })

        it('à zéro en cas d’absence de demande de subvention', () => {
          // GIVEN
          const action = actionSansSubventionAvecCoFinancementEtBeneficiaires
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention).toBeUndefined()
          expect(syntheseAction.financementAccorde).toBe(0)
          expect(syntheseAction.financementDemande).toBe(0)
          expect(syntheseAction.financementFormationAccorde).toBe(0)
        })
      })

      describe('le montant de subvention de formation accordé est égal', () => {
        it('à la somme des montants demandés des subventions de formation en prestation et en ressources humaines pour'
          + 'les subventions de formation acceptées', () => {
          // GIVEN
          const action = actionAvecSubventionFormationCoFinancementsEtBeneficiaires()
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention?.montants.prestation).toBe(4_000)
          expect(action.subvention?.montants.ressourcesHumaines).toBe(0)
          expect(action.subvention?.statut).toBe('acceptee')
          expect(syntheseAction.financementAccorde).toBe(0)
          expect(syntheseAction.financementDemande).toBe(4_000)
          expect(syntheseAction.financementFormationAccorde).toBe(4_000)
        })

        it.each([
          {
            libelle: 'déposées',
            statut: StatutSubvention.DEPOSEE,
          },
          {
            libelle: 'en cours',
            statut: StatutSubvention.EN_COURS,
          },
          {
            libelle: 'refusées',
            statut: StatutSubvention.REFUSEE,
          },
        ])('à zéro pour les demandes de subvention $libelle', ({ statut }) => {
          // GIVEN
          const action = actionAvecSubventionFormationCoFinancementsEtBeneficiaires(statut)
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention?.montants.prestation).toBe(4_000)
          expect(action.subvention?.montants.ressourcesHumaines).toBe(0)
          expect(action.subvention?.statut).toBe(statut)
          expect(syntheseAction.financementAccorde).toBe(0)
          expect(syntheseAction.financementDemande).toBe(4_000)
          expect(syntheseAction.financementFormationAccorde).toBe(0)
        })

        it('à zéro en cas d’absence de demande de subvention', () => {
          // GIVEN
          const action = actionSansSubventionAvecCoFinancementEtBeneficiaires
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute('fooId', action),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
          const syntheseAction = synthese.feuillesDeRoute[0].actions[0]

          // THEN
          expect(action.subvention).toBeUndefined()
          expect(syntheseAction.financementAccorde).toBe(0)
          expect(syntheseAction.financementDemande).toBe(0)
          expect(syntheseAction.financementFormationAccorde).toBe(0)
        })
      })

      it('le montant du co-financement est égal à la somme des montants de chaque co-financement', () => {
        // GIVEN
        const action = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('id', action),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action.coFinancements[0].montant).toBe(20_000)
        expect(action.coFinancements[1].montant).toBe(10_000)
        expect(action.coFinancements[2].montant).toBe(10_000)
        const syntheseAction1FeuilleDeRoute1 = synthese.feuillesDeRoute[0].actions[0]
        expect(syntheseAction1FeuilleDeRoute1.coFinancement).toBe(40_000)
      })
    })

    describe('pour chaque feuille de route', () => {
      it('le nombre de bénéficiaires uniques est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionNiCoFinancementAvecBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('id', action1, action2),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
        const syntheseFeuilleDeRoute = synthese.feuillesDeRoute[0]

        // THEN
        expect(action1.beneficiaires[0].uid).toBe('1')
        expect(action1.beneficiaires[1].uid).toBe('2')
        expect(action1.beneficiaires[2].uid).toBe('3')
        expect(action2.beneficiaires[0].uid).toBe('1')
        expect(action2.beneficiaires[1].uid).toBe('5')
        expect(syntheseFeuilleDeRoute.beneficiaires).toBe(4)
      })

      it('le nombre de co-financeurs uniques est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('id', action1, action2),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]

        // THEN
        expect(action1.coFinancements[0].coFinanceur.uid).toBe('coFinanceurFooId1')
        expect(action1.coFinancements[1].coFinanceur.uid).toBe('coFinanceurFooId2')
        expect(action1.coFinancements[2].coFinanceur.uid).toBe('coFinanceurFooId1')
        expect(action2.coFinancements[0].coFinanceur.uid).toBe('coFinanceurFooId3')
        expect(syntheseFeuilleDeRoute1.coFinanceurs).toBe(3)
      })

      it('les sommes des budgets de toutes les actions sont calculées', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionNiCoFinancementAvecBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              action1,
              action2
            ),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]

        // THEN
        expect(action1.budgetGlobal).toBe(70_000)
        expect(action2.budgetGlobal).toBe(100_000)
        expect(syntheseFeuilleDeRoute1.budget).toBe(170_000)
      })

      it('les sommes des financements accordés pour toutes les actions sont calculées', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionAvecSubventionEtCoFinancementSansBeneficiaire()
        const action3 = actionAvecSubventionFormationCoFinancementsEtBeneficiaires()
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              action1,
              action2,
              action3
            ),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]

        // THEN
        expect(action1.subvention?.montants.prestation).toBe(20_000)
        expect(action1.subvention?.montants.ressourcesHumaines).toBe(10_000)
        expect(action1.subvention?.isFormation).toBe(false)
        expect(action2.subvention?.montants.prestation).toBe(4_000)
        expect(action2.subvention?.montants.ressourcesHumaines).toBe(3_000)
        expect(action2.subvention?.isFormation).toBe(false)
        expect(action3.subvention?.montants.prestation).toBe(4_000)
        expect(action3.subvention?.montants.ressourcesHumaines).toBe(0)
        expect(action3.subvention?.isFormation).toBe(true)
        expect(syntheseFeuilleDeRoute1.financementAccorde).toBe(37_000)
        expect(syntheseFeuilleDeRoute1.financementDemande).toBe(41_000)
        expect(syntheseFeuilleDeRoute1.financementFormationAccorde).toBe(4000)
      })

      it('les sommes des co-financements pour toutes les actions sont calculées', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              action1,
              action2
            ),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]

        // THEN
        expect(action1.coFinancements[0].montant).toBe(20_000)
        expect(action1.coFinancements[1].montant).toBe(10_000)
        expect(action1.coFinancements[2].montant).toBe(10_000)
        expect(action2.coFinancements[0].montant).toBe(20_000)
        expect(syntheseFeuilleDeRoute1.coFinancement).toBe(60_000)
      })
    })

    describe('pour la gouvernance', () => {
      it('le nombre de bénéficiaires uniques est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionNiCoFinancementAvecBeneficiaires
        const action3 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('feuilleDeRouteFooId1', action1, action2),
            feuilleDeRoute('feuilleDeRouteFooId2', action3),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action1.beneficiaires[0].uid).toBe('1')
        expect(action1.beneficiaires[1].uid).toBe('2')
        expect(action1.beneficiaires[2].uid).toBe('3')
        expect(action2.beneficiaires[0].uid).toBe('1')
        expect(action2.beneficiaires[1].uid).toBe('5')
        expect(action3.beneficiaires[0].uid).toBe('1')
        expect(synthese.beneficiaires).toBe(4)
      })

      it('le nombre de co-financeurs uniques est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const action3 = actionAvecSubventionEtCoFinancementSansBeneficiaire()
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('feuilleDeRouteFooId1', action1, action2),
            feuilleDeRoute('feuilleDeRouteFooId2', action3),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action1.coFinancements[0].coFinanceur.uid).toBe('coFinanceurFooId1')
        expect(action1.coFinancements[1].coFinanceur.uid).toBe('coFinanceurFooId2')
        expect(action1.coFinancements[2].coFinanceur.uid).toBe('coFinanceurFooId1')
        expect(action2.coFinancements[0].coFinanceur.uid).toBe('coFinanceurFooId3')
        expect(action3.coFinancements[0].coFinanceur.uid).toBe('coFinanceurFooId3')
        expect(synthese.coFinanceurs).toBe(3)
      })

      it('le budget est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const action3 = actionSansSubventionNiCoFinancementAvecBeneficiaires
        const action4 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              action1,
              action2
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', action3),
            feuilleDeRoute('feuilleDeRouteFooId3', action4),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action1.budgetGlobal).toBe(70_000)
        expect(action2.budgetGlobal).toBe(60_000)
        expect(action3.budgetGlobal).toBe(100_000)
        expect(action4.budgetGlobal).toBe(60_000)
        expect(synthese.budget).toBe(290_000)
      })

      it('le financement accordé est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionAvecSubventionEtCoFinancementSansBeneficiaire()
        const action3 = actionAvecSubventionFormationCoFinancementsEtBeneficiaires()
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              action1
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', action2, action3),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action1.subvention?.montants.prestation).toBe(20_000)
        expect(action1.subvention?.montants.ressourcesHumaines).toBe(10_000)
        expect(action1.subvention?.isFormation).toBe(false)
        expect(action2.subvention?.montants.prestation).toBe(4_000)
        expect(action2.subvention?.montants.ressourcesHumaines).toBe(3_000)
        expect(action2.subvention?.isFormation).toBe(false)
        expect(action3.subvention?.montants.prestation).toBe(4_000)
        expect(action3.subvention?.montants.ressourcesHumaines).toBe(0)
        expect(action3.subvention?.isFormation).toBe(true)
        expect(synthese.financementAccorde).toBe(37_000)
        expect(synthese.financementDemande).toBe(41_000)
        expect(synthese.financementFormationAccorde).toBe(4_000)
      })

      it('le co-financement est calculé', () => {
        // GIVEN
        const action1 = actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires()
        const action2 = actionSansSubventionAvecCoFinancementEtBeneficiaires
        const action3 = actionAvecSubventionEtCoFinancementSansBeneficiaire()
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute('feuilleDeRouteFooId1', action1, action2),
            feuilleDeRoute('feuilleDeRouteFooId2', action3),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        expect(action1.coFinancements[0].montant).toBe(20_000)
        expect(action1.coFinancements[1].montant).toBe(10_000)
        expect(action1.coFinancements[2].montant).toBe(10_000)
        expect(action2.coFinancements[0].montant).toBe(20_000)
        expect(action3.coFinancements[0].montant).toBe(6_000)

        expect(synthese.coFinancement).toBe(66_000)
      })
    })
  })
})

type Gouvernance = Parameters<typeof etablirSyntheseFinanciereGouvernance>[0]

type FeuilleDeRoute = Gouvernance['feuillesDeRoute'][number]

type Action = Gouvernance['feuillesDeRoute'][number]['actions'][number]

function feuilleDeRoute(uid: string, ...actions: ReadonlyArray<Action>): FeuilleDeRoute {
  return { actions, uid }
}

function actionAvecDemandeDeSubventionCoFinancementsEtBeneficiaires(
  statut: StatutSubvention = StatutSubvention.ACCEPTEE
): Action {
  return {
    beneficiaires: [{ uid: '1' }, { uid: '2' }, { uid: '3' }],
    budgetGlobal: 70_000,
    coFinancements: [
      {
        coFinanceur: { uid: 'coFinanceurFooId1' },
        montant: 20_000,
      },
      {
        coFinanceur: { uid: 'coFinanceurFooId2' },
        montant: 10_000,
      },
      {
        coFinanceur: { uid: 'coFinanceurFooId1' },
        montant: 10_000,
      },
    ],
    subvention: {
      isFormation: false,
      montants: {
        prestation: 20_000,
        ressourcesHumaines: 10_000,
      },
      statut,
    },
    uid: 'actionFooId1',
  }
}

function actionAvecSubventionEtCoFinancementSansBeneficiaire(
  statut: StatutSubvention = StatutSubvention.ACCEPTEE
): Action {
  return {
    beneficiaires: [],
    budgetGlobal: 13_000,
    coFinancements: [
      {
        coFinanceur: { uid: 'coFinanceurFooId3' },
        montant: 6_000,
      },
    ],
    subvention: {
      isFormation: false,
      montants: {
        prestation: 4_000,
        ressourcesHumaines: 3_000,
      },
      statut,
    },
    uid: 'actionFooId4',
  }
}

function actionAvecSubventionFormationCoFinancementsEtBeneficiaires(
  statut: StatutSubvention = StatutSubvention.ACCEPTEE
): Action {
  return {
    beneficiaires: [{ uid: '1' }, { uid: '5' }],
    budgetGlobal: 200_000,
    coFinancements: [
      {
        coFinanceur: { uid: 'coFinanceurFooId3' },
        montant: 3_000,
      },
    ],
    subvention: {
      isFormation: true,
      montants: {
        prestation: 4_000,
        ressourcesHumaines: 0,
      },
      statut,
    },
    uid: 'actionFooId2',
  }
}

const actionSansSubventionNiCoFinancementAvecBeneficiaires: Action = {
  beneficiaires: [{ uid: '1' }, { uid: '5' }],
  budgetGlobal: 100_000,
  coFinancements: [],
  uid: 'actionFooId2',
}

const actionSansSubventionAvecCoFinancementEtBeneficiaires: Action = {
  beneficiaires: [{ uid: '1' }],
  budgetGlobal: 60_000,
  coFinancements: [
    {
      coFinanceur: { uid: 'coFinanceurFooId3' },
      montant: 20_000,
    },
  ],
  uid: 'actionFooId3',
}
