import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('feuille de route', () => {
  it('quand je clique sur une feuille de route, alors un drawer s’ouvre avec les détails de la feuille de route', () => {
  // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 100_000,
          montantSubventionDemande: 115_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion 1',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
          totalActions: 3,
        },
      ],
    }))
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const feuilleDeRoute = screen.getByRole('button', { name: 'Feuille de route inclusion 1' })
    fireEvent.click(feuilleDeRoute)

    // THEN
    const drawer = screen.getByRole('dialog')
    const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Feuille de route inclusion 1' })
    expect(titreDrawer).toBeInTheDocument()
    const responsableLabel = within(drawer).getByText('Responsable de la feuille de route')
    expect(responsableLabel).toBeInTheDocument()
    const responsable = within(drawer).getAllByRole('link', { name: 'Préfecture du Rhône' })[0]
    expect(responsable).toBeInTheDocument()
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
    const beneficiairesDesSubventionsLabel = within(drawer).getByText('Bénéficiaires des subventions')
    expect(beneficiairesDesSubventionsLabel).toBeInTheDocument()
    const beneficiairesList = within(drawer).getAllByRole('list')[0]
    const beneficiairesListItems = within(beneficiairesList).getAllByRole('listitem')
    const premierBeneficiaireDesSubventions = within(beneficiairesListItems[0]).getByRole('link', { name: 'Préfecture du Rhône' })
    expect(premierBeneficiaireDesSubventions).toHaveAttribute('href', '/')
    const secondBeneficiaireDesSubventions = within(beneficiairesListItems[1]).getByRole('link', { name: 'CC des Monts du Lyonnais' })
    expect(secondBeneficiaireDesSubventions).toHaveAttribute('href', '/')
    const montantDeLaSubventionFormationAccordeeLabel = within(drawer).getByText('Montant de la subvention formation accordée')
    expect(montantDeLaSubventionFormationAccordeeLabel).toBeInTheDocument()
    const montantDeLaSubventionFormationAccordee = within(drawer).getByText('5 000 €')
    expect(montantDeLaSubventionFormationAccordee).toBeInTheDocument()
    const beneficiaireDesSubventionsFormationLabel = within(drawer).getByText('Bénéficiaires des subventions formation')
    expect(beneficiaireDesSubventionsFormationLabel).toBeInTheDocument()
    const beneficiairesSubventionFormationList = within(drawer).getAllByRole('list')[1]
    const beneficiairesSubventionFormationListItems = within(beneficiairesSubventionFormationList).getAllByRole('listitem')
    const premierBeneficiaireDesSubventionsFormation = within(beneficiairesSubventionFormationListItems[0]).getByRole('link', { name: 'Préfecture du Rhône' })
    expect(premierBeneficiaireDesSubventionsFormation).toHaveAttribute('href', '/')
    const secondBeneficiaireDesSubventionsFormation = within(beneficiairesSubventionFormationListItems[1]).getByRole('link', { name: 'CC des Monts du Lyonnais' })
    expect(secondBeneficiaireDesSubventionsFormation).toHaveAttribute('href', '/')
    const buttonsList = within(drawer).getAllByRole('list')[2]
    const buttonsListItems = within(buttonsList).getAllByRole('listitem')
    const boutonPlusDeDetails = within(buttonsListItems[0]).getByRole('link', { name: 'Plus de détails' })
    expect(boutonPlusDeDetails).toHaveAttribute('href', '/')
    const boutonTelechargerPdf = within(buttonsListItems[1]).getByRole('button', { name: 'Télécharger le document PDF' })
    expect(boutonTelechargerPdf).toBeInTheDocument()
  })

  it('quand je suis dans le détail d’une feuille de route, s’il n’y a pas de bénéficiaire de subvention alors un tiret est affiché à la place de la liste des bénéficiaires et les labels sont au singulier', () => {
  // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 50_000,
          montantSubventionAccorde: 0,
          montantSubventionDemande: 15_000,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion 1',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
          totalActions: 1,
        },
      ],
    }))
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const feuilleDeRoute = screen.getByRole('button', { name: 'Feuille de route inclusion 1' })
    fireEvent.click(feuilleDeRoute)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Feuille de route inclusion 1' })
    const beneficiairesDesSubventionsLabel = within(drawer).getByText('Bénéficiaire des subventions')
    expect(beneficiairesDesSubventionsLabel).toBeInTheDocument()
    const beneficiaireDesSubventionsFormationLabel = within(drawer).getByText('Bénéficiaire des subventions formation')
    expect(beneficiaireDesSubventionsFormationLabel).toBeInTheDocument()
    const tirets = within(drawer).getAllByText('-')
    expect(tirets).toHaveLength(2)
  })
})
