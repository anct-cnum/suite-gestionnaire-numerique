import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { actionViewModelFactory } from '@/presenters/testHelper'
import { expectNot } from '@/shared/testHelper'

describe('faire une demande de subvention', () => {
  describe('étant donné que je me trouve sur le formulaire d’action', () => {
    it('et que je n’ai pas saisi de budget global, alors le bouton de demande de subvention est inactif', () => {
      // GIVEN
      const budgetGlobal = 0

      // WHEN
      jAfficheLeFormulaireAction(budgetGlobal)

      // THEN
      const boutonDemandeDeSubvention = screen.getByRole('button', {
        description: 'Faire une demande de subvention',
        name: 'Demander une subvention',
      })
      expect(boutonDemandeDeSubvention).toBeDisabled()
    })

    it('et que j’ai saisi un budget global valide, alors le bouton de demande de subvention est actif', () => {
      // GIVEN
      const budgetGlobal = 1

      // WHEN
      jAfficheLeFormulaireAction(budgetGlobal)

      // THEN
      const boutonDemandeDeSubvention = screen.getByRole('button', {
        description: 'Faire une demande de subvention',
        name: 'Demander une subvention',
      })
      expect(boutonDemandeDeSubvention).toBeEnabled()
    })

    it(
      'et que j’ai saisi un budget global valide, quand je clique sur "Demander une subvention", alors le' +
        ' sous-formulaire de demande de subvention s’affiche sans enveloppe sélectionnée, indiquant le maximum' +
        ' autorisé pour cette action correspondant au budget global préalablement saisi, avec des champs de saisie de' +
        ' montants et un bouton de soumission désactivés',
      () => {
        // GIVEN
        jAfficheLeFormulaireAction(42_500)

        // WHEN
        jOuvreLeSousFormulaireDeDemandeDeSubvention()

        // THEN
        const drawer = sousFormulaireDemandeSubvention()
        expect(drawer).toHaveAttribute('id', 'drawerDemanderUneSubventionId')

        const titre = within(drawer).getByRole('heading', {
          level: 1,
          name: 'Demander une subvention',
        })
        expect(titre).toBeInTheDocument()

        expect(sousTitre('42 500')).toBeInTheDocument()

        const selecteurEnveloppes = within(drawer).getByRole('combobox', {
          name: 'Enveloppe de financement concernée',
        })
        const enveloppes = within(selecteurEnveloppes).getAllByRole('option', { hidden: true })
        expect(enveloppes).toHaveLength(5)
        expect(enveloppes[0].textContent).toBe('Choisir')
        expect(enveloppes[0].hidden).toBe(true)
        expect(enveloppes[1].textContent).toBe('Conseiller Numérique - 2024')
        expect(enveloppes[1].hidden).toBe(false)
        expect(enveloppes[2].textContent).toBe('Conseiller Numérique - Plan France Relance')
        expect(enveloppes[2].hidden).toBe(false)
        expect(enveloppes[3].textContent).toBe('Formation Aidant Numérique/Aidants Connect - 2024')
        expect(enveloppes[3].hidden).toBe(false)
        expect(enveloppes[4].textContent).toBe('Ingénierie France Numérique Ensemble - 2024')
        expect(enveloppes[4].hidden).toBe(false)

        const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
        expect(champSaisieMontantPrestation).toHaveAttribute('min', '0')
        expect(champSaisieMontantPrestation).toHaveAttribute('max', '42500')
        expect(champSaisieMontantPrestation).toBeDisabled()
        expect(champSaisieMontantRh).toHaveAttribute('min', '0')
        expect(champSaisieMontantRh).toHaveAttribute('max', '42500')
        expect(champSaisieMontantRh).toBeDisabled()

        const abbreviationEtp = within(drawer).getByText('ETP', { selector: 'abbr' })
        expect(abbreviationEtp).toHaveAttribute('title', 'Équivalent temps plein')

        const recapItems = recapMontants()
        expect(recapItems).toHaveLength(1)
        expect(recapItems[0].textContent).toBe('Maximum autorisé pour cette action 42 500 €')
        expect(boutonSoumissionFormulaire()).toBeDisabled()
      }
    )
  })

  describe('étant donné que je me trouve sur le sous-formulaire de demande de subvention', () => {
    it('quand je clique sur le bouton de fermeture, alors le sous-formulaire se ferme', () => {
      // GIVEN
      jAfficheLeFormulaireAction(42_500)

      // WHEN
      jOuvreLeSousFormulaireDeDemandeDeSubvention()
      const drawer = sousFormulaireDemandeSubvention()
      const boutonFermer = within(drawer).getByRole('button', {
        name: 'Fermer la demande de subvention',
      })
      fireEvent.click(boutonFermer)

      // THEN
      expect(drawer).not.toBeVisible()
      expect(boutonFermer).toHaveAttribute('aria-controls', 'drawerDemanderUneSubventionId')
    })

    describe('quand je sélectionne une enveloppe de financement', () => {
      it.each([
        {
          enveloppeId: '2',
          expectedDroitsDeSubventionAffiches: '100 000',
          expectedLimiteAffichee: '42 500',
          precision0: 'dont le montant est supérieur ou égal à celui du budget global de l’action',
          precision1: '',
        },
        {
          enveloppeId: '4',
          expectedDroitsDeSubventionAffiches: '10 000',
          expectedLimiteAffichee: '10 000',
          precision0: 'dont le montant est inférieur à celui du budget global de l’action',
          precision1: ', et en tant que limite de la subvention que je peux demander,',
        },
      ])(
        '$precision0, alors son montant s’affiche en tant que droits de subvention$precision1 et les champs de' +
          ' saisie de montants deviennent actifs',
        ({ enveloppeId, expectedDroitsDeSubventionAffiches, expectedLimiteAffichee }) => {
          // GIVEN
          jAfficheLeFormulaireAction(42_500)

          // WHEN
          jOuvreLeSousFormulaireDeDemandeDeSubvention()
          jeSelectionneLEnveloppe(enveloppeId)

          // THEN
          const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
          const recapItems = recapMontants()

          expect(champSaisieMontantPrestation).toBeEnabled()
          expect(champSaisieMontantRh).toBeEnabled()
          expect(recapItems).toHaveLength(2)
          expect(recapItems[0].textContent).toBe(
            `Vos droits de subvention ${expectedDroitsDeSubventionAffiches} €`
          )
          expect(recapItems[1].textContent).toBe('Maximum autorisé pour cette action 42 500 €')
          expect(sousTitre(expectedLimiteAffichee)).toBeInTheDocument()
        }
      )
    })

    describe('et que j’ai sélectionné une enveloppe de financement, quand je saisis des montants', () => {
      describe(
        'dont la somme excède le montant de l’enveloppe qui est inférieur au budget maximal de l’action, alors' +
          ' je ne peux soumettre ma demande et un message d’erreur m’en informe',
        () => {
          it.each([
            {
              enveloppeDeRemplacementId: '3',
              enveloppeInitialeId: '3',
              erreurMontantPrestation: { expectation: expect, message: 'Constraints not satisfied' },
              erreurMontantRh: { expectation: expectNot, message: '' },
              expectedLimiteAffichee: '30 000',
              expectedTotalAffiche: '30 001',
              montantPrestation: 30_001,
              montantRh: 0,
              raison: 'car le montant en prestation de service excède celui de l’enveloppe',
            },
            {
              enveloppeDeRemplacementId: '3',
              enveloppeInitialeId: '3',
              erreurMontantPrestation: { expectation: expectNot, message: '' },
              erreurMontantRh: { expectation: expect, message: 'Constraints not satisfied',
              },
              expectedLimiteAffichee: '30 000',
              expectedTotalAffiche: '30 001',
              montantPrestation: 0,
              montantRh: 30_001,
              raison: 'car le montant en ressources humaines excède celui de l’enveloppe',
            },
            {
              enveloppeDeRemplacementId: '3',
              enveloppeInitialeId: '3',
              erreurMontantPrestation: { expectation: expect, message: 'Constraints not satisfied' },
              erreurMontantRh: { expectation: expect, message: 'Constraints not satisfied' },
              expectedLimiteAffichee: '30 000',
              expectedTotalAffiche: '30 001',
              montantPrestation: 29_999,
              montantRh: 2,
              raison:
                'car l’un des montants est saisi correctement mais l’autre résulte en une somme qui excède celui' +
                ' de l’enveloppe',
            },
            {
              enveloppeDeRemplacementId: '4',
              enveloppeInitialeId: '3',
              erreurMontantPrestation: { expectation: expect, message: 'Constraints not satisfied' },
              erreurMontantRh: { expectation: expectNot, message: '' },
              expectedLimiteAffichee: '10 000',
              expectedTotalAffiche: '10 001',
              montantPrestation: 10_000,
              montantRh: 1,
              raison:
                'car les deux montants sont saisis correctement mais que j’opte ensuite pour une enveloppe dont' +
                ' le montant est inférieur à la somme des montants saisis',
            },
          ])(
            '$raison',
            ({
              enveloppeDeRemplacementId,
              enveloppeInitialeId,
              erreurMontantPrestation,
              erreurMontantRh,
              expectedLimiteAffichee,
              expectedTotalAffiche,
              montantPrestation,
              montantRh,
            }) => {
              // GIVEN
              jAfficheLeFormulaireAction(42_500)

              // WHEN
              jOuvreLeSousFormulaireDeDemandeDeSubvention()
              jeSelectionneLEnveloppe(enveloppeInitialeId)
              jeSaisisLesMontants(montantPrestation, montantRh)
              jeSelectionneLEnveloppe(enveloppeDeRemplacementId)

              // THEN
              const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
              expect(champSaisieMontantPrestation).toHaveAccessibleDescription(
                erreurMontantPrestation.message
              )
              erreurMontantPrestation
                .expectation(champSaisieMontantPrestation)
                .toHaveAttribute('aria-describedby')
              expect(champSaisieMontantRh).toHaveAccessibleDescription(erreurMontantRh.message)
              erreurMontantRh.expectation(champSaisieMontantRh).toHaveAttribute('aria-describedby')

              const recapItems = recapMontants()
              expect(recapItems).toHaveLength(3)
              expect(recapItems[2].textContent).toBe(
                `Total subventions demandées ${expectedTotalAffiche} €`
              )

              expect(sousTitre(expectedLimiteAffichee)).toBeInTheDocument()
              expect(boutonSoumissionFormulaire()).toBeDisabled()
            }
          )
        }
      )

      describe(
        'dont la somme excède le budget maximal de l’action qui est inférieur au montant de l’enveloppe,' +
          ' alors je ne peux soumettre ma demande et un message d’erreur m’en informe',
        () => {
          it.each([
            {
              erreurMontantPrestation: { expectation: expectNot, message: '' },
              erreurMontantRh: {  expectation: expect, message: 'Constraints not satisfied' },
              montantPrestation: 0,
              montantRh: 42_501,
              raison: 'car le montant en ressources humaines excède le budget maximal de l’action',
            },
            {
              erreurMontantPrestation: { expectation: expect, message: 'Constraints not satisfied' },
              erreurMontantRh: { expectation: expectNot, message: '' },
              montantPrestation: 42_501,
              montantRh: 0,
              raison:
                'car le montant en prestation de service excède le budget maximal de l’action',
            },
            {
              erreurMontantPrestation: { expectation: expect, message: 'Constraints not satisfied' },
              erreurMontantRh: { expectation: expect,  message: 'Constraints not satisfied' },
              montantPrestation: 2,
              montantRh: 42_499,
              raison:
                'car l’un des montants est saisi correctement mais l’autre résulte en une somme qui excède' +
                ' le budget maximal de l’action',
            },
          ])(
            '$raison',
            ({ erreurMontantPrestation, erreurMontantRh, montantPrestation, montantRh }) => {
              // GIVEN
              jAfficheLeFormulaireAction(42_500)

              // WHEN
              jOuvreLeSousFormulaireDeDemandeDeSubvention()
              jeSelectionneLEnveloppe('2')
              jeSaisisLesMontants(montantPrestation, montantRh)

              // THEN
              const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
              expect(champSaisieMontantPrestation).toHaveAccessibleDescription(
                erreurMontantPrestation.message
              )
              erreurMontantPrestation
                .expectation(champSaisieMontantPrestation)
                .toHaveAttribute('aria-describedby')
              expect(champSaisieMontantRh).toHaveAccessibleDescription(erreurMontantRh.message)
              erreurMontantRh.expectation(champSaisieMontantRh).toHaveAttribute('aria-describedby')

              const recapItems = recapMontants()
              expect(recapItems).toHaveLength(3)
              expect(recapItems[2].textContent).toBe('Total subventions demandées 42 501 €')

              expect(boutonSoumissionFormulaire()).toBeDisabled()
            }
          )
        }
      )

      describe(
        'dont la somme excède le montant de l’enveloppe ou le budget maximal de l’action, puis que je corrige' +
          ' ma saisie de manière à ce que la somme n’excède aucune des deux limites, alors je peux soumettre ma' +
          ' demande',
        () => {
          it.each([
            {
              desc: 'rectification du montant en ressources humaines',
              montantPrestationInitial: 9_999,
              montantPrestationRectifie: 9_999,
              montantRhInitial: 2,
              montantRhRectifie: 1,
            },
            {
              desc: 'rectification du montant en prestation de service',
              montantPrestationInitial: 10_000,
              montantPrestationRectifie: 9_999,
              montantRhInitial: 1,
              montantRhRectifie: 1,
            },
          ])(
            '$desc',
            ({
              montantPrestationInitial,
              montantPrestationRectifie,
              montantRhInitial,
              montantRhRectifie,
            }) => {
              // GIVEN
              jAfficheLeFormulaireAction(42_500)

              // WHEN
              jOuvreLeSousFormulaireDeDemandeDeSubvention()
              jeSelectionneLEnveloppe('4')
              jeSaisisLesMontants(montantPrestationInitial, montantRhInitial)
              jeSaisisLesMontants(montantPrestationRectifie, montantRhRectifie)

              // THEN
              const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
              expect(champSaisieMontantPrestation).not.toHaveAccessibleDescription()
              expect(champSaisieMontantPrestation).not.toHaveAttribute('aria-describedby')
              expect(champSaisieMontantRh).not.toHaveAccessibleDescription()
              expect(champSaisieMontantRh).not.toHaveAttribute('aria-describedby')

              const recapItems = recapMontants()
              expect(recapItems).toHaveLength(3)
              expect(recapItems[2].textContent).toBe('Total subventions demandées 10 000 €')

              expect(boutonSoumissionFormulaire()).toBeEnabled()
            }
          )
        }
      )

      describe('dont la somme n’excède ni le montant de l’enveloppe, ni celui du budget total de l’action', () => {
        describe(
          'alors la somme s’affiche en tant que total des subventions demandées et je peux soumettre ma' +
            ' demande, le bouton de soumission s’activant',
          () => {
            it.each([
              {
                expected: 'Total subventions demandées 5 000 €',
                montantPrestation: 5_000,
                montantRh: 0,
                precision: 'saisie d’un montant en prestation de service',
              },
              {
                expected: 'Total subventions demandées 2 €',
                montantPrestation: 0,
                montantRh: 2,
                precision: 'saisie d’un montant en ressources humaines',
              },
              {
                expected: 'Total subventions demandées 4 100 €',
                montantPrestation: 800,
                montantRh: 3_300,
                precision:
                  'saisie d’un montant en prestation de service et d’un montant en ressources humaines',
              },
            ])('$precision', ({ expected, montantPrestation, montantRh }) => {
              // GIVEN
              jAfficheLeFormulaireAction(42_500)

              // WHEN
              jOuvreLeSousFormulaireDeDemandeDeSubvention()
              jeSelectionneLEnveloppe('4')
              jeSaisisLesMontants(montantPrestation, montantRh)

              // THEN
              const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
              expect(champSaisieMontantPrestation).not.toHaveAccessibleDescription()
              expect(champSaisieMontantPrestation).not.toHaveAttribute('aria-describedby')
              expect(champSaisieMontantRh).not.toHaveAccessibleDescription()
              expect(champSaisieMontantRh).not.toHaveAttribute('aria-describedby')

              const recapItems = recapMontants()
              expect(recapItems).toHaveLength(3)
              expect(recapItems[2].textContent).toBe(expected)

              expect(boutonSoumissionFormulaire()).toBeEnabled()
            })
          }
        )

        it('et que je soumets ma demande, alors le sous-formulaire se ferme', () => {
          // GIVEN
          jAfficheLeFormulaireAction(42_500)

          // WHEN
          jOuvreLeSousFormulaireDeDemandeDeSubvention()
          const drawer = screen.getByRole('dialog', {
            hidden: false,
            name: 'Demander une subvention',
          })
          jeSelectionneLEnveloppe('4')
          jeSaisisLesMontants(800, 3_300)
          fireEvent.click(boutonSoumissionFormulaire())

          // THEN
          expect(drawer).not.toBeVisible()
        })
      })
    })
  })
})

function jAfficheLeFormulaireAction(budgetGlobal: number): void {
  renderComponent(
    <FormulaireAction
      action={actionViewModelFactory({ budgetGlobal })}
      ajouterDemandeDeSubvention={vi.fn<() => void>()}
      demandeDeSubvention={undefined}
      label="label"
      supprimerUneDemandeDeSubvention={vi.fn<() => void>()}
      validerFormulaire={vi.fn<() => Promise<void>>()}
    />
  )
}

function jOuvreLeSousFormulaireDeDemandeDeSubvention(): void {
  const button = screen.getByRole('button', { name: 'Demander une subvention' })
  fireEvent.click(button)
}

function jeSelectionneLEnveloppe(enveloppeId: string): void {
  const selecteurEnveloppes = within(sousFormulaireDemandeSubvention()).getByRole('combobox', {
    name: 'Enveloppe de financement concernée',
  })
  fireEvent.change(selecteurEnveloppes, { target: { value: enveloppeId } })
}

function jeSaisisLesMontants(montantPrestation: number, montantRh: number): void {
  const [champSaisieMontantPrestation, champSaisieMontantRh] = champsSaisieMontants()
  fireEvent.input(champSaisieMontantPrestation, { target: { value: montantPrestation } })
  fireEvent.input(champSaisieMontantRh, { target: { value: montantRh } })
}

function sousFormulaireDemandeSubvention(): HTMLElement {
  return screen.getByRole('dialog', { hidden: false, name: 'Demander une subvention' })
}

function sousTitre(limite: string): HTMLElement {
  return within(sousFormulaireDemandeSubvention()).getByText(
    matchWithoutMarkup(
      `Saisissez le montant de la subvention que vous souhaitez obtenir de l’état. Dans la limite de ${limite} €.`
    ),
    { selector: 'p' }
  )
}

function champsSaisieMontants(): Readonly<[HTMLElement, HTMLElement]> {
  const sousFormulaire = sousFormulaireDemandeSubvention()
  return [
    within(sousFormulaire).getByRole('spinbutton', { name: 'Montant en prestation de service' }),
    within(sousFormulaire).getByRole('spinbutton', {
      name:
        'Montant en ressources humaines Il s’agit d’une ressource humaine interne à la structure employeuse' +
        ' faisant partie de la gouvernance et récipiendaire des fonds. Format attendu : Montant ETP en euros',
    }),
  ]
}

function recapMontants(): ReadonlyArray<HTMLElement> {
  const recap = within(sousFormulaireDemandeSubvention()).getByRole('list')
  return within(recap).getAllByRole('listitem')
}

function boutonSoumissionFormulaire(): HTMLElement {
  return within(sousFormulaireDemandeSubvention()).getByRole('button', { name: 'Enregistrer' })
}
