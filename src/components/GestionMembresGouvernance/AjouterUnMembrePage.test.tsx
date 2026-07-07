import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AjouterUnMembrePage from './AjouterUnMembrePage'
import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import { renderComponent, stubbedServerAction } from '../testHelper'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: mockPush,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
}))

describe('rejoindre une gouvernance en tant que structure non membre', () => {
  it('quand j’accède au formulaire de candidature, alors ma structure est affichée sans recherche SIRET et le département est obligatoire', () => {
    // WHEN
    afficherFormulaireCandidature()

    // THEN
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    const carteStructure = screen.getByRole('heading', { level: 4, name: 'Ma Structure' })
    expect(carteStructure).toBeInTheDocument()

    const selectDepartement = screen.getByRole('combobox', { name: 'Département' })
    expect(selectDepartement).toHaveValue('')
    const optionAin = screen.getByRole('option', { name: '01 - Ain' })
    expect(optionAin).toBeInTheDocument()
    const optionLoire = screen.getByRole('option', { name: '42 - Loire' })
    expect(optionLoire).toBeInTheDocument()

    const contactReferent = screen.getByRole('heading', { level: 3, name: 'Contact référent de la structure' })
    expect(contactReferent).toBeInTheDocument()

    const etapeSuivante = screen.getByRole('button', { name: 'Étape suivante' })
    expect(etapeSuivante).toBeDisabled()
  })

  it('quand le contact est renseigné mais pas le département, alors je ne peux pas passer à l’étape suivante', () => {
    // GIVEN
    afficherFormulaireCandidature()

    // WHEN
    remplirContact()

    // THEN
    const etapeSuivante = screen.getByRole('button', { name: 'Étape suivante' })
    expect(etapeSuivante).toBeDisabled()
  })

  it('quand je valide le récapitulatif, alors ma candidature est envoyée avec le département et je suis redirigé vers le tableau de bord', async () => {
    // GIVEN
    const rejoindreUneGouvernanceAction = stubbedServerAction(['OK'])
    afficherFormulaireCandidature(rejoindreUneGouvernanceAction)
    remplirContact()
    fireEvent.change(screen.getByRole('combobox', { name: 'Département' }), { target: { value: '42' } })
    fireEvent.click(screen.getByRole('button', { name: 'Étape suivante' }))

    // WHEN
    const recapitulatifGouvernance = screen.getByRole('heading', { level: 3, name: 'Votre gouvernance' })
    expect(recapitulatifGouvernance).toBeInTheDocument()
    expect(screen.getByText('42 - Loire')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter ma structure' }))

    // THEN
    await waitFor(() => {
      expect(rejoindreUneGouvernanceAction).toHaveBeenCalledWith({
        codeDepartement: '42',
        contact: {
          email: 'jean.dupont@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: undefined,
        path: '/',
      })
    })
    expect(mockPush).toHaveBeenCalledWith('/tableau-de-bord')
  })

  it('quand la candidature échoue, alors une notification d’erreur est affichée et je reste sur le formulaire', async () => {
    // GIVEN
    const rejoindreUneGouvernanceAction = stubbedServerAction(['La structure est déjà membre de la gouvernance'])
    afficherFormulaireCandidature(rejoindreUneGouvernanceAction)
    remplirContact()
    fireEvent.change(screen.getByRole('combobox', { name: 'Département' }), { target: { value: '42' } })
    fireEvent.click(screen.getByRole('button', { name: 'Étape suivante' }))

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter ma structure' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : La structure est déjà membre de la gouvernance')
    expect(mockPush).not.toHaveBeenCalledWith('/tableau-de-bord')
  })
})

function afficherFormulaireCandidature(rejoindreUneGouvernanceAction = stubbedServerAction(['OK'])): void {
  mockPush.mockClear()
  renderComponent(
    <AjouterUnMembrePage
      candidature={{
        departements: [
          { label: '01 - Ain', value: '01' },
          { label: '42 - Loire', value: '42' },
        ],
        entreprise: entrepriseViewModelFactory(),
      }}
    />,
    { rejoindreUneGouvernanceAction }
  )
}

function remplirContact(): void {
  fireEvent.change(screen.getByRole('textbox', { name: 'Nom *' }), { target: { value: 'Dupont' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Prénom *' }), { target: { value: 'Jean' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Adresse électronique *' }), {
    target: { value: 'jean.dupont@example.com' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Fonction *' }), { target: { value: 'Directeur' } })
}

function entrepriseViewModelFactory(): EntrepriseViewModel {
  return {
    activitePrincipale: '85.59A',
    activitePrincipaleLibelle: 'Formation continue d’adultes (85.59A)',
    adresse: '123 rue de la Paix 75001 Paris',
    categorieJuridiqueCode: '5710',
    categorieJuridiqueLibelle: 'SAS, société par actions simplifiée',
    codeInsee: '',
    codePostal: '',
    commune: '',
    denomination: 'Ma Structure',
    identifiant: '12345678901234',
    nomVoie: '',
    numeroVoie: '',
  }
}
