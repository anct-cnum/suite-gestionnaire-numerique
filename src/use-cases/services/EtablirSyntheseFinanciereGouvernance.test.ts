import { etablirSyntheseFinanciereGouvernance } from './EtablirSyntheseFinanciereGouvernance'

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
              uid: 'feuilleDeRouteId',
            },
          ],
          financementAccorde: 0,
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
                budget: 0,
                coFinancement: 0,
                financementAccorde: 0,
                uid: 'actionId',
              },
            ],
            beneficiaires: 0,
            budget: 0,
            coFinancement: 0,
            coFinanceurs: 0,
            financementAccorde: 0,
            uid: 'feuilleDeRouteId',
          },
          ],
          financementAccorde: 0,
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
        it('à la somme des montants demandés des subventions en prestation et en ressources humaines pour les subventions acceptées', () => {
          // GIVEN
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute(
                'feuilleDeRouteFooId1',
                actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
                actionSansSubventionNiCoFinancementAvecBeneficiaires
              ),
              feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
              feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

          // THEN
          const action1FeuilleDeRoute1 = gouvernance.feuillesDeRoute[0].actions[0]
          expect(action1FeuilleDeRoute1.subvention?.montants.prestation).toBe(20_000)
          expect(action1FeuilleDeRoute1.subvention?.montants.ressourcesHumaines).toBe(10_000)
          expect(action1FeuilleDeRoute1.subvention?.statut).toBe('acceptee')
          const syntheseAction1FeuilleDeRoute1 = synthese.feuillesDeRoute[0].actions[0]
          expect(syntheseAction1FeuilleDeRoute1.financementAccorde).toBe(30_000)
        })

        it('à zéro en cas d’absence de demande de subvention', () => {
          // GIVEN
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute(
                'feuilleDeRouteFooId1',
                actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
                actionSansSubventionNiCoFinancementAvecBeneficiaires
              ),
              feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
              feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

          // THEN
          const action2FeuilleDeRoute1 = gouvernance.feuillesDeRoute[0].actions[1]
          expect(action2FeuilleDeRoute1.subvention).toBeUndefined()
          const syntheseAction2FeuilleDeRoute1 = synthese.feuillesDeRoute[0].actions[1]
          expect(syntheseAction2FeuilleDeRoute1.financementAccorde).toBe(0)

          const action1FeuilleDeRoute2 = gouvernance.feuillesDeRoute[1].actions[0]
          expect(action1FeuilleDeRoute2.subvention).toBeUndefined()
          const syntheseAction1FeuilleDeRoute2 = synthese.feuillesDeRoute[1].actions[0]
          expect(syntheseAction1FeuilleDeRoute2.financementAccorde).toBe(0)
        })

        it('à zéro dans les cas où la demande de subvention n’a pas été acceptée', () => {
          // GIVEN
          const gouvernance: Gouvernance = {
            feuillesDeRoute: [
              feuilleDeRoute(
                'feuilleDeRouteFooId1',
                actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
                actionSansSubventionNiCoFinancementAvecBeneficiaires
              ),
              feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
              feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
            ],
          }

          // WHEN
          const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

          // THEN
          const action1FeuilleDeRoute3 = gouvernance.feuillesDeRoute[2].actions[0]
          expect(action1FeuilleDeRoute3.subvention?.statut).toBe('refusee')
          const syntheseAction1FeuilleDeRoute3 = synthese.feuillesDeRoute[2].actions[0]
          expect(syntheseAction1FeuilleDeRoute3.financementAccorde).toBe(0)
        })
      })

      it('le montant du co-financement est égal à la somme des montants de chaque co-financement', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const action1FeuilleDeRoute1 = gouvernance.feuillesDeRoute[0].actions[0]
        expect(action1FeuilleDeRoute1.coFinancements).toHaveLength(3)
        expect(action1FeuilleDeRoute1.coFinancements[0].montant).toBe(20_000)
        expect(action1FeuilleDeRoute1.coFinancements[1].montant).toBe(10_000)
        expect(action1FeuilleDeRoute1.coFinancements[2].montant).toBe(10_000)
        const syntheseAction1FeuilleDeRoute1 = synthese.feuillesDeRoute[0].actions[0]
        expect(syntheseAction1FeuilleDeRoute1.coFinancement).toBe(40_000)

        const action2FeuilleDeRoute1 = gouvernance.feuillesDeRoute[0].actions[1]
        expect(action2FeuilleDeRoute1.coFinancements).toHaveLength(0)
        const syntheseAction2FeuilleDeRoute1 = synthese.feuillesDeRoute[0].actions[1]
        expect(syntheseAction2FeuilleDeRoute1.coFinancement).toBe(0)

        const action1FeuilleDeRoute2 = gouvernance.feuillesDeRoute[1].actions[0]
        expect(action1FeuilleDeRoute2.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute2.coFinancements[0].montant).toBe(20_000)
        const syntheseAction1FeuilleDeRoute2 = synthese.feuillesDeRoute[1].actions[0]
        expect(syntheseAction1FeuilleDeRoute2.coFinancement).toBe(20_000)

        const action1FeuilleDeRoute3 = gouvernance.feuillesDeRoute[2].actions[0]
        expect(action1FeuilleDeRoute3.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute3.coFinancements[0].montant).toBe(6_000)
        const syntheseAction1FeuilleDeRoute3 = synthese.feuillesDeRoute[2].actions[0]
        expect(syntheseAction1FeuilleDeRoute3.coFinancement).toBe(6_000)
      })
    })

    describe('pour chaque feuille de route', () => {
      it('le nombre de bénéficiaires uniques est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const feuilleDeRoute1 = gouvernance.feuillesDeRoute[0]
        const action1FeuilleDeRoute1 = feuilleDeRoute1.actions[0]
        const action2FeuilleDeRoute1 = feuilleDeRoute1.actions[1]
        expect(action1FeuilleDeRoute1.beneficiaires).toHaveLength(3)
        expect(action2FeuilleDeRoute1.beneficiaires).toHaveLength(2)
        expect(action1FeuilleDeRoute1.beneficiaires[0].uid).toBe('1')
        expect(action1FeuilleDeRoute1.beneficiaires[1].uid).toBe('2')
        expect(action1FeuilleDeRoute1.beneficiaires[2].uid).toBe('3')
        expect(action2FeuilleDeRoute1.beneficiaires[0].uid).toBe('1')
        expect(action2FeuilleDeRoute1.beneficiaires[1].uid).toBe('5')
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        expect(syntheseFeuilleDeRoute1.beneficiaires).toBe(4)

        const feuilleDeRoute2 = gouvernance.feuillesDeRoute[1]
        const action1FeuilleDeRoute2 = feuilleDeRoute2.actions[0]
        expect(action1FeuilleDeRoute2.beneficiaires).toHaveLength(1)
        expect(action1FeuilleDeRoute2.beneficiaires[0].uid).toBe('1')
        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        expect(syntheseFeuilleDeRoute2.beneficiaires).toBe(1)

        const feuilleDeRoute3 = gouvernance.feuillesDeRoute[2]
        const action1FeuilleDeRoute3 = feuilleDeRoute3.actions[0]
        expect(action1FeuilleDeRoute3.beneficiaires).toHaveLength(0)
        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        expect(syntheseFeuilleDeRoute3.beneficiaires).toBe(0)
      })

      it('le nombre de co-financeurs uniques est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const feuilleDeRoute1 = gouvernance.feuillesDeRoute[0]
        const action1FeuilleDeRoute1 = feuilleDeRoute1.actions[0]
        const action2FeuilleDeRoute1 = feuilleDeRoute1.actions[1]
        expect(action1FeuilleDeRoute1.coFinancements).toHaveLength(3)
        expect(action2FeuilleDeRoute1.coFinancements).toHaveLength(0)
        expect(action1FeuilleDeRoute1.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId')
        expect(action1FeuilleDeRoute1.coFinancements[1].coFinanceur.uid).toBe('coFinanceurOrangeId')
        expect(action1FeuilleDeRoute1.coFinancements[2].coFinanceur.uid).toBe('coFinanceurId')
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        expect(syntheseFeuilleDeRoute1.coFinanceurs).toBe(2)

        const feuilleDeRoute2 = gouvernance.feuillesDeRoute[1]
        const action1FeuilleDeRoute2 = feuilleDeRoute2.actions[0]
        expect(action1FeuilleDeRoute2.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute2.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId2')
        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        expect(syntheseFeuilleDeRoute2.coFinanceurs).toBe(1)

        const feuilleDeRoute3 = gouvernance.feuillesDeRoute[2]
        const action1FeuilleDeRoute3 = feuilleDeRoute3.actions[0]
        expect(action1FeuilleDeRoute3.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute3.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId2')
        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        expect(syntheseFeuilleDeRoute3.coFinanceurs).toBe(1)
      })

      it('les sommes des budgets de toutes les actions sont calculées', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        const syntheseAction1FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[0]
        const syntheseAction2FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[1]
        expect(syntheseAction1FeuilleDeRoute1.budget).toBe(70_000)
        expect(syntheseAction2FeuilleDeRoute1.budget).toBe(100_000)
        expect(syntheseFeuilleDeRoute1.budget).toBe(170_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        const syntheseAction1FeuilleDeRoute2 = syntheseFeuilleDeRoute2.actions[0]
        expect(syntheseAction1FeuilleDeRoute2.budget).toBe(60_000)
        expect(syntheseFeuilleDeRoute2.budget).toBe(60_000)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        const syntheseAction1FeuilleDeRoute3 = syntheseFeuilleDeRoute3.actions[0]
        expect(syntheseAction1FeuilleDeRoute3.budget).toBe(13_000)
        expect(syntheseFeuilleDeRoute3.budget).toBe(13_000)
      })

      it('les sommes des financements accordés pour toutes les actions sont calculées', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        const syntheseAction1FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[0]
        const syntheseAction2FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[1]
        expect(syntheseAction1FeuilleDeRoute1.financementAccorde).toBe(30_000)
        expect(syntheseAction2FeuilleDeRoute1.financementAccorde).toBe(0)
        expect(syntheseFeuilleDeRoute1.financementAccorde).toBe(30_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        const syntheseAction1FeuilleDeRoute2 = syntheseFeuilleDeRoute2.actions[0]
        expect(syntheseAction1FeuilleDeRoute2.financementAccorde).toBe(0)
        expect(syntheseFeuilleDeRoute2.financementAccorde).toBe(0)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        const syntheseAction1FeuilleDeRoute3 = syntheseFeuilleDeRoute3.actions[0]
        expect(syntheseAction1FeuilleDeRoute3.financementAccorde).toBe(0)
        expect(syntheseFeuilleDeRoute3.financementAccorde).toBe(0)
      })

      it('les sommes des co-financements pour toutes les actions sont calculées', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        const syntheseAction1FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[0]
        const syntheseAction2FeuilleDeRoute1 = syntheseFeuilleDeRoute1.actions[1]
        expect(syntheseAction1FeuilleDeRoute1.coFinancement).toBe(40_000)
        expect(syntheseAction2FeuilleDeRoute1.coFinancement).toBe(0)
        expect(syntheseFeuilleDeRoute1.coFinancement).toBe(40_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        const syntheseAction1FeuilleDeRoute2 = syntheseFeuilleDeRoute2.actions[0]
        expect(syntheseAction1FeuilleDeRoute2.coFinancement).toBe(20_000)
        expect(syntheseFeuilleDeRoute2.coFinancement).toBe(20_000)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        const syntheseAction1FeuilleDeRoute3 = syntheseFeuilleDeRoute3.actions[0]
        expect(syntheseAction1FeuilleDeRoute3.coFinancement).toBe(6_000)
        expect(syntheseFeuilleDeRoute3.coFinancement).toBe(6_000)
      })
    })

    describe('pour la gouvernance', () => {
      it('le nombre de bénéficiaires uniques est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const feuilleDeRoute1 = gouvernance.feuillesDeRoute[0]
        const action1FeuilleDeRoute1 = feuilleDeRoute1.actions[0]
        const action2FeuilleDeRoute1 = feuilleDeRoute1.actions[1]
        expect(action1FeuilleDeRoute1.beneficiaires).toHaveLength(3)
        expect(action2FeuilleDeRoute1.beneficiaires).toHaveLength(2)
        expect(action1FeuilleDeRoute1.beneficiaires[0].uid).toBe('1')
        expect(action1FeuilleDeRoute1.beneficiaires[1].uid).toBe('2')
        expect(action1FeuilleDeRoute1.beneficiaires[2].uid).toBe('3')
        expect(action2FeuilleDeRoute1.beneficiaires[0].uid).toBe('1')
        expect(action2FeuilleDeRoute1.beneficiaires[1].uid).toBe('5')

        const feuilleDeRoute2 = gouvernance.feuillesDeRoute[1]
        const action1FeuilleDeRoute2 = feuilleDeRoute2.actions[0]
        expect(action1FeuilleDeRoute2.beneficiaires).toHaveLength(1)
        expect(action1FeuilleDeRoute2.beneficiaires[0].uid).toBe('1')

        const feuilleDeRoute3 = gouvernance.feuillesDeRoute[2]
        const action1FeuilleDeRoute3 = feuilleDeRoute3.actions[0]
        expect(action1FeuilleDeRoute3.beneficiaires).toHaveLength(0)

        expect(synthese.beneficiaires).toBe(4)
      })

      it('le nombre de co-financeurs uniques est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const feuilleDeRoute1 = gouvernance.feuillesDeRoute[0]
        const action1FeuilleDeRoute1 = feuilleDeRoute1.actions[0]
        const action2FeuilleDeRoute1 = feuilleDeRoute1.actions[1]
        expect(action1FeuilleDeRoute1.coFinancements).toHaveLength(3)
        expect(action2FeuilleDeRoute1.coFinancements).toHaveLength(0)
        expect(action1FeuilleDeRoute1.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId')
        expect(action1FeuilleDeRoute1.coFinancements[1].coFinanceur.uid).toBe('coFinanceurOrangeId')
        expect(action1FeuilleDeRoute1.coFinancements[2].coFinanceur.uid).toBe('coFinanceurId')

        const feuilleDeRoute2 = gouvernance.feuillesDeRoute[1]
        const action1FeuilleDeRoute2 = feuilleDeRoute2.actions[0]
        expect(action1FeuilleDeRoute2.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute2.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId2')

        const feuilleDeRoute3 = gouvernance.feuillesDeRoute[2]
        const action1FeuilleDeRoute3 = feuilleDeRoute3.actions[0]
        expect(action1FeuilleDeRoute3.coFinancements).toHaveLength(1)
        expect(action1FeuilleDeRoute3.coFinancements[0].coFinanceur.uid).toBe('coFinanceurId2')

        expect(synthese.coFinanceurs).toBe(3)
      })

      it('le budget est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        expect(syntheseFeuilleDeRoute1.budget).toBe(170_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        expect(syntheseFeuilleDeRoute2.budget).toBe(60_000)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        expect(syntheseFeuilleDeRoute3.budget).toBe(13_000)

        expect(synthese.budget).toBe(243_000)
      })

      it('le financement accordé est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        expect(syntheseFeuilleDeRoute1.financementAccorde).toBe(30_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        expect(syntheseFeuilleDeRoute2.financementAccorde).toBe(0)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        expect(syntheseFeuilleDeRoute3.financementAccorde).toBe(0)

        expect(synthese.financementAccorde).toBe(30_000)
      })

      it('le co-financement est calculé', () => {
        // GIVEN
        const gouvernance: Gouvernance = {
          feuillesDeRoute: [
            feuilleDeRoute(
              'feuilleDeRouteFooId1',
              actionAvecSubventionAccepteeCoFinancementsEtBeneficiares,
              actionSansSubventionNiCoFinancementAvecBeneficiaires
            ),
            feuilleDeRoute('feuilleDeRouteFooId2', actionSansSubventionAvecCoFinancementEtBeneficiaires),
            feuilleDeRoute('feuilleDeRouteFooId3', actionAvecSubventionEtCoFinancementSansBeneficiaire),
          ],
        }

        // WHEN
        const synthese = etablirSyntheseFinanciereGouvernance(gouvernance)

        // THEN
        const syntheseFeuilleDeRoute1 = synthese.feuillesDeRoute[0]
        expect(syntheseFeuilleDeRoute1.coFinancement).toBe(40_000)

        const syntheseFeuilleDeRoute2 = synthese.feuillesDeRoute[1]
        expect(syntheseFeuilleDeRoute2.coFinancement).toBe(20_000)

        const syntheseFeuilleDeRoute3 = synthese.feuillesDeRoute[2]
        expect(syntheseFeuilleDeRoute3.coFinancement).toBe(6_000)

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

const actionAvecSubventionAccepteeCoFinancementsEtBeneficiares: Action = {
  beneficiaires: [{ uid: '1' }, { uid: '2' }, { uid: '3' }],
  budgetGlobal: 70_000,
  coFinancements: [
    {
      coFinanceur: { uid: 'coFinanceurId' },
      montant: 20_000,
    },
    {
      coFinanceur: { uid: 'coFinanceurOrangeId' },
      montant: 10_000,
    },
    {
      coFinanceur: { uid: 'coFinanceurId' },

      montant: 10_000,
    },
  ],
  subvention: {
    montants: {
      prestation: 20_000,
      ressourcesHumaines: 10_000,
    },
    statut: 'acceptee' as const,
  },
  uid: 'actionFooId1',
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
      coFinanceur: { uid: 'coFinanceurId2' },
      montant: 20_000,
    },
  ],
  uid: 'actionFooId3',
}

const actionAvecSubventionEtCoFinancementSansBeneficiaire: Action = {
  beneficiaires: [],
  budgetGlobal: 13_000,
  coFinancements: [
    {
      coFinanceur: { uid: 'coFinanceurId2' },
      montant: 6_000,
    },
  ],
  subvention: {
    montants: {
      prestation: 4_000,
      ressourcesHumaines: 3_000,
    },
    statut: 'refusee' as const,
  },
  uid: 'actionFooId4',
}
