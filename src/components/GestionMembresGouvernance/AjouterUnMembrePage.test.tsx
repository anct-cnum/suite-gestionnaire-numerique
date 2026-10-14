import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import AjouterUnMembrePage from './AjouterUnMembrePage'
import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import { renderComponent, stubbedServerAction } from '../testHelper'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    bfcacheId: '',
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: mockPush,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
}))

describe('rejoindre une gouvernance en tant que structure non membre', () => {
  it('quand j’accède au formulaire de candidature, alors ma structure est affichée sans recherche SIRET et le département est obligatoire', async () => {
    // WHEN
    afficherFormulaireCandidature()

    // THEN
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    const carteStructure = screen.getByRole('heading', { level: 4, name: 'Ma Structure' })
    expect(carteStructure).toBeInTheDocument()

    const selectDepartement = screen.getByRole('combobox', { name: 'Département' })
    expect(selectDepartement).toHaveValue('')
    await userEvent.click(selectDepartement)
    const optionAin = await screen.findByRole('option', { name: '01 - Ain' })
    expect(optionAin).toBeInTheDocument()
    const optionLoire = screen.getByRole('option', { name: '42 - Loire' })
    expect(optionLoire).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

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
    await userEvent.click(screen.getByRole('combobox', { name: 'Département' }))
    await userEvent.click(await screen.findByRole('option', { name: '42 - Loire' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Étape suivante' })).toBeEnabled()
    })
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
          type: 'nouveau',
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
    await userEvent.click(screen.getByRole('combobox', { name: 'Département' }))
    await userEvent.click(await screen.findByRole('option', { name: '42 - Loire' }))
    fireEvent.click(screen.getByRole('button', { name: 'Étape suivante' }))

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter ma structure' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : La structure est déjà membre de la gouvernance')
    expect(mockPush).not.toHaveBeenCalledWith('/tableau-de-bord')
  })
})

describe('ajouter un membre à une gouvernance en tant que gestionnaire', () => {
  it('étant donné un SIRET inconnu en base, quand je recherche la structure, alors aucun contact n’est récupéré et je dois en ajouter un', async () => {
    // GIVEN
    afficherFormulaireAjoutMembre(entrepriseViewModelFactory())

    // WHEN
    await rechercherLeSiret()

    // THEN
    const aucunContact = await screen.findByText(
      'Aucun contact connu pour cette structure. Ajoutez au moins un contact.'
    )
    expect(aucunContact).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Étape suivante' })).toBeDisabled()
  })

  it('étant donné un SIRET inconnu en base, quand j’ajoute, modifie puis supprime des contacts, alors seuls les contacts restants sont envoyés à l’ajout du membre', async () => {
    // GIVEN
    const ajouterUnMembreAction = stubbedServerAction(['OK'])
    afficherFormulaireAjoutMembre(entrepriseViewModelFactory(), ajouterUnMembreAction)
    await rechercherLeSiret()
    await ajouterUnContact({ email: 'jean.dupont@example.com', fonction: 'Directeur', nom: 'Dupont', prenom: 'Jean' })
    await ajouterUnContact({ email: 'lea.durand@example.com', fonction: 'Chargée', nom: 'Durand', prenom: 'Léa' })

    // WHEN
    const contactJean = screen.getByRole('article', { name: 'Contact Jean Dupont' })
    fireEvent.click(within(contactJean).getByRole('button', { name: 'Modifier' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Fonction *' }), { target: { value: 'Président' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le contact' }))
    const contactLea = screen.getByRole('article', { name: 'Contact Léa Durand' })
    fireEvent.click(within(contactLea).getByRole('button', { name: 'Supprimer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Étape suivante' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter cette structure' }))

    // THEN
    await waitFor(() => {
      expect(ajouterUnMembreAction).toHaveBeenCalledWith(
        expect.objectContaining({
          contact: undefined,
          contacts: {
            aAjouter: [{ email: 'jean.dupont@example.com', fonction: 'Président', nom: 'Dupont', prenom: 'Jean' }],
            aModifier: [],
            aSupprimer: [],
          },
          contactTechnique: undefined,
        })
      )
    })
  })

  it('étant donné un SIRET connu en base, quand je recherche la structure, alors ses contacts sont récupérés et modifiables', async () => {
    // GIVEN
    afficherFormulaireAjoutMembre({ ...entrepriseViewModelFactory(), contactsExistants })

    // WHEN
    await rechercherLeSiret()

    // THEN
    const contactMarie = await screen.findByRole('article', { name: 'Contact Marie Martin' })
    expect(within(contactMarie).getByRole('button', { name: 'Modifier' })).toBeInTheDocument()
    expect(within(contactMarie).getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Contact Paul Bernard' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Nom *' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Étape suivante' })).toBeEnabled()
  })

  it('étant donné un SIRET connu en base, quand je modifie, supprime et ajoute des contacts, alors le récapitulatif les liste et les modifications sont envoyées à l’ajout du membre', async () => {
    // GIVEN
    const ajouterUnMembreAction = stubbedServerAction(['OK'])
    afficherFormulaireAjoutMembre({ ...entrepriseViewModelFactory(), contactsExistants }, ajouterUnMembreAction)
    await rechercherLeSiret()
    const contactMarie = await screen.findByRole('article', { name: 'Contact Marie Martin' })
    fireEvent.click(within(contactMarie).getByRole('button', { name: 'Modifier' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Fonction *' }), { target: { value: 'Présidente' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le contact' }))
    const contactPaul = screen.getByRole('article', { name: 'Contact Paul Bernard' })
    fireEvent.click(within(contactPaul).getByRole('button', { name: 'Supprimer' }))
    await ajouterUnContact({ email: 'jean.dupont@example.com', fonction: 'Directeur', nom: 'Dupont', prenom: 'Jean' })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Étape suivante' }))

    // THEN
    expect(screen.getByRole('list', { name: 'Contact Marie Martin' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Contact Jean Dupont' })).toBeInTheDocument()
    expect(screen.getByText('Ces contacts seront supprimés définitivement :')).toBeInTheDocument()
    expect(screen.getByText('Paul Bernard (paul.bernard@example.com)')).toBeInTheDocument()

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter cette structure' }))

    // THEN
    await waitFor(() => {
      expect(ajouterUnMembreAction).toHaveBeenCalledWith(
        expect.objectContaining({
          codeDepartement: '42',
          contacts: {
            aAjouter: [{ email: 'jean.dupont@example.com', fonction: 'Directeur', nom: 'Dupont', prenom: 'Jean' }],
            aModifier: [
              { email: 'marie.martin@example.com', fonction: 'Présidente', id: 1, nom: 'Martin', prenom: 'Marie' },
            ],
            aSupprimer: [2],
          },
        })
      )
    })
  })
})

const contactsExistants = [
  { email: 'marie.martin@example.com', fonction: 'Directrice', id: 1, nom: 'Martin', prenom: 'Marie' },
  { email: 'paul.bernard@example.com', fonction: 'Trésorier', id: 2, nom: 'Bernard', prenom: 'Paul' },
]

function afficherFormulaireAjoutMembre(
  entrepriseTrouvee: EntrepriseViewModel,
  ajouterUnMembreAction = stubbedServerAction(['OK'])
): void {
  mockPush.mockClear()
  renderComponent(<AjouterUnMembrePage codeDepartement="42" />, {
    ajouterUnMembreAction,
    rechercherUneEntrepriseAction: vi.fn<() => Promise<EntrepriseViewModel>>().mockResolvedValueOnce(entrepriseTrouvee),
  })
}

async function rechercherLeSiret(): Promise<void> {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '12345678901234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Rechercher' }))
  await screen.findByRole('heading', { level: 4, name: 'Ma Structure' })
}

async function ajouterUnContact(
  contact: Readonly<{ email: string; fonction: string; nom: string; prenom: string }>
): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Ajouter un contact' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Nom *' }), { target: { value: contact.nom } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Prénom *' }), { target: { value: contact.prenom } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Adresse électronique *' }), {
    target: { value: contact.email },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Fonction *' }), { target: { value: contact.fonction } })
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le contact' }))
  await screen.findByRole('article', { name: `Contact ${contact.prenom} ${contact.nom}` })
}

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
