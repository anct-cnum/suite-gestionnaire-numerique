import { fireEvent, screen, within } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { renderComponent } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('feuille de route', () => {
  it('quand je clique sur une feuille de route, alors un drawer s’ouvre avec les détails de la feuille de route', () => {
    // GIVEN
    afficherUneGouvernance({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionAccordee: [
            { nom: 'Préfecture du Rhône', uid: '0' },
            { nom: 'CC des Monts du Lyonnais', uid: '1' },
          ],
          beneficiairesSubventionFormation: [],
          beneficiairesSubventionFormationAccordee: [
            { nom: 'Préfecture du Rhône', uid: '0'  },
            { nom: 'CC des Monts du Lyonnais', uid: '1' }],
          budgetGlobal: 145_000,
          montantSubventionAccordee: 100_000,
          montantSubventionDemandee: 115_000,
          montantSubventionFormationAccordee: 5_000,
          nom: 'Feuille de route inclusion',
          pieceJointe: {
            apercu: '',
            emplacement: '',
            metadonnees: {
              format: 'pdf',
              taille: '25 Mo',
              upload: epochTime,
            },
            nom: 'feuille-de-route-fake.pdf',
          },
          porteur: { nom: 'Préfecture du Rhône', uid: '0' },
          totalActions: 3,
          uid: 'feuilleDeRouteFooId',
        },
      ],
    })

    // WHEN
    jOuvreLesDetailsDUneFeuilleDeRoute()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Feuille de route inclusion' })
    const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Feuille de route inclusion' })
    expect(titreDrawer).toBeInTheDocument()
    const responsableLabel = within(drawer).getByText('Responsable de la feuille de route')
    expect(responsableLabel).toBeInTheDocument()
    const responsable = within(drawer).getAllByRole('link', { name: 'Préfecture du Rhône' })[0]
    expect(responsable).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/0')
    const budgetGlobalLabel = within(drawer).getByText('Budget total des actions')
    expect(budgetGlobalLabel).toBeInTheDocument()
    const budgetGlobal = within(drawer).getByText('145 000 €')
    expect(budgetGlobal).toBeInTheDocument()
    const montantDeLaSubventionDemandeeLabel = within(drawer).getByText('Montant de la subvention demandée')
    expect(montantDeLaSubventionDemandeeLabel).toBeInTheDocument()
    const montantDeLaSubventionDemandee = within(drawer).getByText('115 000 €')
    expect(montantDeLaSubventionDemandee).toBeInTheDocument()
    const montantDeLaSubventionAccordeeLabel = within(drawer).getByText('Montant de la subvention accordée')
    expect(montantDeLaSubventionAccordeeLabel).toBeInTheDocument()
    const montantDeLaSubventionAccordee = within(drawer).getByText('100 000 €')
    expect(montantDeLaSubventionAccordee).toBeInTheDocument()
    const beneficiairesDesSubventionsLabel = within(drawer).getByText('Bénéficiaire des subventions accordées')
    expect(beneficiairesDesSubventionsLabel).toBeInTheDocument()
    const beneficiairesList = within(drawer).getAllByRole('list')[0]
    const beneficiairesListItems = within(beneficiairesList).getAllByRole('listitem')
    const premierBeneficiaireDesSubventions = within(beneficiairesListItems[0]).getByRole('link', { name: 'Préfecture du Rhône' })
    expect(premierBeneficiaireDesSubventions).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/0')
    const secondBeneficiaireDesSubventions = within(beneficiairesListItems[1]).getByRole('link', { name: 'CC des Monts du Lyonnais' })
    expect(secondBeneficiaireDesSubventions).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/1')
    const montantDeLaSubventionFormationAccordeeLabel = within(drawer).getByText('Montant de la subvention formation accordée')
    expect(montantDeLaSubventionFormationAccordeeLabel).toBeInTheDocument()
    const montantDeLaSubventionFormationAccordee = within(drawer).getByText('5 000 €')
    expect(montantDeLaSubventionFormationAccordee).toBeInTheDocument()
    const beneficiaireDesSubventionsFormationLabel = within(drawer).getByText('Bénéficiaire des subventions formation accordées')
    expect(beneficiaireDesSubventionsFormationLabel).toBeInTheDocument()
    const beneficiairesSubventionFormationList = within(drawer).getAllByRole('list')[1]
    const beneficiairesSubventionFormationListItems = within(beneficiairesSubventionFormationList).getAllByRole('listitem')
    const premierBeneficiaireDesSubventionsFormation = within(beneficiairesSubventionFormationListItems[0]).getByRole('link', { name: 'Préfecture du Rhône' })
    expect(premierBeneficiaireDesSubventionsFormation).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/0')
    const secondBeneficiaireDesSubventionsFormation = within(beneficiairesSubventionFormationListItems[1]).getByRole('link', { name: 'CC des Monts du Lyonnais' })
    expect(secondBeneficiaireDesSubventionsFormation).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/1')
    const buttonsList = within(drawer).getAllByRole('list')[2]
    const buttonsListItems = within(buttonsList).getAllByRole('listitem')
    const boutonPlusDeDetails = within(buttonsListItems[0]).getByRole('link', { name: 'Plus de détails' })
    expect(boutonPlusDeDetails).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId')
    const linkOuvrirPdf = within(buttonsListItems[1]).getByRole('link', { name: 'Ouvrir le document pdf' })
    expect(linkOuvrirPdf).toHaveAttribute('href', '/api/document-feuille-de-route/feuille-de-route-fake.pdf')
    expect(linkOuvrirPdf).toHaveAttribute('title', 'Ouvrir le document pdf - nouvelle fenêtre')
    expect(linkOuvrirPdf).toBeInTheDocument()
  })

  it('quand je suis dans le détail d’une feuille de route, s’il n’y a pas de porteur alors un tiret est affiché à la place', () => {
    // GIVEN
    afficherUneGouvernance({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{
            nom: 'Préfecture du Rhône',
            uid: '0',
          }, {
            nom: 'CC des Monts du Lyonnais',
            uid: '1',
          }],
          beneficiairesSubventionAccordee: [],
          beneficiairesSubventionFormation: [{
            nom: 'Préfecture du Rhône',
            uid: '0',
          },
          {
            nom: 'CC des Monts du Lyonnais',
            uid: '1',
          }],
          beneficiairesSubventionFormationAccordee: [],
          budgetGlobal: 50_000,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 15_000,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion',
          porteur: undefined,
          totalActions: 1,
          uid: 'feuilleDeRouteFooId',
        },
      ],
    })

    // WHEN
    jOuvreLesDetailsDUneFeuilleDeRoute()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Feuille de route inclusion' })
    const divResposable = within(drawer).getByTitle('Aucun responsable')
    expect(divResposable).toBeInTheDocument()
  })

  it('quand je suis dans le détail d’une feuille de route, s’il n’y a pas de bénéficiaire de subvention alors un tiret est affiché à la place de la liste des bénéficiaires et les labels sont au singulier', () => {
    // GIVEN
    afficherUneGouvernance({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionAccordee: [],
          beneficiairesSubventionFormation: [],
          beneficiairesSubventionFormationAccordee: [],
          budgetGlobal: 50_000,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 15_000,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', uid: '0' },
          totalActions: 1,
          uid: 'feuilleDeRouteFooId',
        },
      ],
    })

    // WHEN
    jOuvreLesDetailsDUneFeuilleDeRoute()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Feuille de route inclusion' })
    const beneficiairesDesSubventionsLabel = within(drawer).getByText('Bénéficiaire des subventions accordées')
    expect(beneficiairesDesSubventionsLabel).toBeInTheDocument()
    const beneficiaireDesSubventionsFormationLabel = within(drawer).getByText('Bénéficiaire des subventions formation accordées')
    expect(beneficiaireDesSubventionsFormationLabel).toBeInTheDocument()
    const tirets = within(drawer).getAllByText('-')
    expect(tirets).toHaveLength(2)
  })

  it('quand je suis dans le détail d’une feuille de route, s’il n’y a pas de pièce jointe alors le bouton "Ouvrir le document pdf" n’est pas affichée', () => {
    // GIVEN
    afficherUneGouvernance({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionAccordee: [],
          beneficiairesSubventionFormation: [],
          beneficiairesSubventionFormationAccordee: [],
          budgetGlobal: 50_000,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 15_000,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', uid: '0' },
          totalActions: 1,
          uid: 'feuilleDeRouteFooId',
        },
      ],
    })

    // WHEN
    jOuvreLesDetailsDUneFeuilleDeRoute()

    // THEN
    const linkOuvrirPdf = screen.queryByRole('link', { name: 'Ouvrir le document pdf' })
    expect(linkOuvrirPdf).not.toBeInTheDocument()
  })

  it('quand je clique sur une feuille de route puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherUneGouvernance()

    // WHEN
    jOuvreLesDetailsDUneFeuilleDeRoute()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Feuille de route inclusion' })
    const fermer = jeFermeLesDetailsDUneFeuilleDeRoute()

    // THEN
    expect(fermer).toHaveAttribute('aria-controls', 'drawerFeuilleDeRouteId')
    expect(drawer).not.toBeVisible()
  })

  function jOuvreLesDetailsDUneFeuilleDeRoute(): void {
    presserLeBouton('Feuille de route inclusion')
  }

  function jeFermeLesDetailsDUneFeuilleDeRoute(): HTMLElement {
    return presserLeBouton('Fermer les détails de la feuille de route')
  }

  function afficherUneGouvernance(override?: Partial<Parameters<typeof gouvernanceReadModelFactory>[0]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(override), epochTime)
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }
})
