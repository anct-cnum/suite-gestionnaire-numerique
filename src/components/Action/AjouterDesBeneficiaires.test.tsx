import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { actionViewModelFactory } from '@/presenters/testHelper'
import { epochTime } from '@/shared/testHelper'
// eslint-disable-next-line import/no-restricted-paths
import { MembreAvecRoleDansLaGouvernance } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'
// eslint-disable-next-line import/no-restricted-paths
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('ajout des bénéficiaires', () => {
  it('quand il n’y a pas de bénéficiaire alors le bouton ajouter un bénéficiaire s’affiche', () => {
    // WHEN
    afficherLeFormulaireAction({
      demandeDeSubvention: {
        enveloppeId: '1',
        montantPrestation: 10,
        montantRh: 10,
        total: 20,
      },
      destinataires: [],
    })

    // THEN
    const bouton = screen.getByRole('button', { description: 'Ajouter des bénéficiaires de la subvention', name: 'Ajouter' })
    expect(bouton).toBeEnabled()
    expect(bouton).toHaveAttribute('type', 'button')
  })

  it('quand il y un bénéficiaire alors tag du bénéficiaire s’affiche sur l action', () => {
    // GIVEN
    afficherLeFormulaireAction({
      demandeDeSubvention: {
        enveloppeId: '1',
        montantPrestation: 10,
        montantRh: 10,
        total: 20,
      },
      destinataires: [
      ],
    }, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions : [
        { nom: 'Rhône (69) Co-porteur', roles: [], uid: 'rhone_69_id' } as MembreAvecRoleDansLaGouvernance,
        { nom: 'CC des Monts du Lyonnais Co-porteur', roles: [], uid: 'cc_mont_du_lyonnais_id' } as MembreAvecRoleDansLaGouvernance,
      ],
    })

    // WHEN
    presserLeBouton('Ajouter', 'Ajouter des bénéficiaires de la subvention')

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
    expect(drawer).toHaveAttribute('id', 'drawerAjouterDesBeneficiairesId')
    const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) bénéficiaire(s)' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText(matchWithoutMarkup('Sélectionnez un ou plusieurs bénéficiaires de la subvention pour cette action. Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en cliquant ici.'), { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: 'cliquant ici' })
    expect(lien).toHaveAttribute('href', '/gouvernance/11')

    const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires de la subvention' })

    const membre1 = within(fieldset).getByRole('checkbox', { checked: false, name: 'Rhône (69) Co-porteur' })
    expect(membre1).not.toBeRequired()
    const membre2 = within(fieldset).getByRole('checkbox', { checked: false, name: 'CC des Monts du Lyonnais Co-porteur' })
    expect(membre2).not.toBeRequired()

    fireEvent.click(membre1)
    const enregistrer = within(fieldset).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).toBeEnabled()
    expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
    expect(enregistrer).toHaveAttribute('type', 'button')
    fireEvent.click(enregistrer)
    const beneficiaireTag = screen.getByRole('link', { name: 'Rhône (69) Co-porteur' })
    expect(beneficiaireTag).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/rhone_69_id')
    expect(beneficiaireTag).toHaveAttribute('target', '_blank')
  })

  describe('quand je clique sur modifier,', () => {
    it('alors le formulaire pour ajouter des bénéficiaires s’affiche', () => {
      // GIVEN
      afficherLeFormulaireAction({
        demandeDeSubvention: {
          enveloppeId: '1',
          montantPrestation: 10,
          montantRh: 10,
          total: 20,
        },
        destinataires: [
          { id: 'rhone_69_id', link: '', nom: 'Rhône (69) Co-porteur', roles: [] },
        ],
      }, {
        porteursPotentielsNouvellesFeuillesDeRouteOuActions : [
          { nom: 'Rhône (69) Co-porteur', roles: [], uid: 'rhone_69_id' } as MembreAvecRoleDansLaGouvernance,
          { nom: 'CC des Monts du Lyonnais Co-porteur', roles: [], uid: 'cc_mont_du_lyonnais_id' } as MembreAvecRoleDansLaGouvernance,
        ],
      })

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires de la subvention')

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterDesBeneficiairesId')
      const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(titre).toBeInTheDocument()
      const sousTitre = screen.getByText(matchWithoutMarkup('Sélectionnez un ou plusieurs bénéficiaires de la subvention pour cette action. Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en cliquant ici.'), { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const lien = screen.getByRole('link', { name: 'cliquant ici' })
      expect(lien).toHaveAttribute('href', '/gouvernance/11')

      const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires de la subvention' })

      const membre1 = within(fieldset).getByRole('checkbox', { checked: true, name: 'Rhône (69) Co-porteur' })
      expect(membre1).not.toBeRequired()
      const membre2 = within(fieldset).getByRole('checkbox', { checked: false, name: 'CC des Monts du Lyonnais Co-porteur' })
      expect(membre2).not.toBeRequired()

      const enregistrer = within(fieldset).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
      expect(enregistrer).toHaveAttribute('type', 'button')
      const effacer = within(fieldset).getByRole('button', { name: 'Tout effacer' })
      expect(effacer).toBeEnabled()
      expect(effacer).toHaveAttribute('type', 'button')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLeFormulaireAction({
        demandeDeSubvention: {
          enveloppeId: '1',
          montantPrestation: 10,
          montantRh: 10,
          total: 20,
        },
        destinataires: [
          { id: 'testUID', link: '', nom: 'monFakeNon', roles: [] },
        ],
      }, {
        porteursPotentielsNouvellesFeuillesDeRouteOuActions : [
          { nom: 'monFakeNon', roles: [], uid: 'testUID' } as MembreAvecRoleDansLaGouvernance,
        ],
      })

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires de la subvention')
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      const fermer = presserLeBouton('Fermer l’ajout des bénéficiaires de la subvention')

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je clique sur tout effacer, alors le formulaire se vide', () => {
      // GIVEN
      afficherLeFormulaireAction({
        demandeDeSubvention: {
          enveloppeId: '1',
          montantPrestation: 10,
          montantRh: 10,
          total: 20,
        },
          
        destinataires: [
          { id: 'testUID', link: '', nom: 'monFakeNon', roles: [] },
        ],
      }, {
        porteursPotentielsNouvellesFeuillesDeRouteOuActions : [
          { nom: 'monFakeNon', roles: [], uid: 'testUID' } as MembreAvecRoleDansLaGouvernance,
        ],
      })
      // WHEN
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires de la subvention')
      presserLeBouton('Tout effacer')

      // THEN
      const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires de la subvention' })
      const checkboxes = within(fieldset).getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  function presserLeBouton(name: string, description?: string): HTMLElement {
    const button = screen.getByRole('button', { description, name })
    fireEvent.click(button)
    return button
  }

  function afficherLeFormulaireAction(
    overrides: Partial<ActionViewModel> = {}, override?: Partial<UneGouvernanceReadModel>
  ): void {
    const gouvernanceViewModel = gouvernancePresenter(
      gouvernanceReadModelFactory(override),
      epochTime
    )
    renderComponent(
      <FormulaireAction
        action={actionViewModelFactory(overrides)}
        ajouterDemandeDeSubvention={vi.fn<() => void>()}
        demandeDeSubvention={overrides.demandeDeSubvention}
        label="Ajouter une action"
        validerFormulaire={vi.fn<() => Promise<void>>()}
      >
        vide
      </FormulaireAction>,
      undefined,
      gouvernanceViewModel
    )
  }
})
