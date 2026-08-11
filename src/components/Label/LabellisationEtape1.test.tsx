import { fireEvent, screen, within } from '@testing-library/react'
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
import { describe, expect, it } from 'vitest'

import LabellisationEtape1 from './LabellisationEtape1'
import * as mettreAJourStructureLabel from '@/app/api/actions/mettreAJourStructureLabelAction'
import * as rechercherUneEntreprise from '@/app/api/actions/rechercherUneEntrepriseAction'
import { renderComponent } from '@/components/testHelper'
import { LabellisationEtape1ViewModel } from '@/presenters/labellisationPresenter'
import { createDefaultLabellisationEtape1ViewModel } from '@/stories/Components/Label/LabellisationTestData'

describe('labellisation étape 1', () => {
  it('affiche le titre, le stepper, les informations de la structure et les contacts', () => {
    // WHEN
    afficherEtape1()

    // THEN
    expect(
      screen.getByRole('heading', { level: 1, name: 'Labellisez ma structure conseiller numérique' })
    ).toBeInTheDocument()
    expect(screen.getByText('Vérifiez vos informations, l’activation prend quelques minutes')).toBeInTheDocument()
    expect(screen.getByText('Étape 1 sur 2')).toBeInTheDocument()
    expect(screen.getByText('Emmaus Connect')).toBeInTheDocument()
    const lienSiret = screen.getByRole('link', { name: '79227291600034' })
    expect(lienSiret).toHaveAttribute('href', 'https://annuaire-entreprises.data.gouv.fr/etablissement/79227291600034')
    expect(screen.getByText('Association déclarée')).toBeInTheDocument()
    expect(screen.getByText('172 B route de Lyon, 42300 Roanne')).toBeInTheDocument()
    expect(screen.getByText('Auvergne-Rhône-Alpes')).toBeInTheDocument()
    expect(screen.getByText('Loire')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Contact référent de la structure' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quitter' })).toHaveAttribute('href', '/tableau-de-bord')
    expect(screen.getByRole('link', { name: 'Étape suivante' })).toHaveAttribute('href', '/label/attestation')
  })

  it('désactive l’étape suivante tant que la structure est en cours de modification', () => {
    // GIVEN
    afficherEtape1()

    // WHEN
    modifierMaStructure()

    // THEN
    expect(screen.queryByRole('link', { name: 'Étape suivante' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Étape suivante' })).toBeDisabled()

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))

    // THEN
    expect(screen.getByRole('link', { name: 'Étape suivante' })).toBeInTheDocument()
  })

  it('recherche une entreprise par SIRET puis l’enregistre et notifie le succès', async () => {
    // GIVEN
    vi.spyOn(rechercherUneEntreprise, 'rechercherUneEntrepriseAction').mockResolvedValueOnce(entrepriseTrouvee())
    vi.spyOn(mettreAJourStructureLabel, 'mettreAJourStructureLabelAction').mockResolvedValueOnce(['OK'])
    afficherEtape1()
    modifierMaStructure()

    // WHEN
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '79227291600034' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    await screen.findByText('Solidarnum')
    expect(rechercherUneEntreprise.rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '79227291600034' })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await screen.findByRole('status')
    expect(screen.getByText('Les informations de votre structure ont bien été mises à jour.')).toBeInTheDocument()
    expect(mettreAJourStructureLabel.mettreAJourStructureLabelAction).toHaveBeenCalledWith({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })
    expect(screen.getByRole('link', { name: 'Étape suivante' })).toBeInTheDocument()
  })

  it('affiche une erreur quand le SIRET n’est pas retrouvé', async () => {
    // GIVEN
    vi.spyOn(rechercherUneEntreprise, 'rechercherUneEntrepriseAction').mockResolvedValueOnce([
      'Aucune entreprise trouvée avec cet identifiant',
    ])
    afficherEtape1()
    modifierMaStructure()

    // WHEN
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '79227291600034' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    await screen.findByText('Le SIRET renseigné n’a pas pu être retrouvé. Vérifiez le numéro saisi.')
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  })

  it('notifie l’erreur renvoyée par l’enregistrement sans quitter le mode édition', async () => {
    // GIVEN
    vi.spyOn(rechercherUneEntreprise, 'rechercherUneEntrepriseAction').mockResolvedValueOnce(entrepriseTrouvee())
    vi.spyOn(mettreAJourStructureLabel, 'mettreAJourStructureLabelAction').mockResolvedValueOnce([
      'Adresse introuvable — vérifiez la saisie',
    ])
    afficherEtape1()
    modifierMaStructure()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '79227291600034' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rechercher' }))
    await screen.findByText('Solidarnum')

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // THEN
    await screen.findByRole('alert')
    expect(screen.getByText('Adresse introuvable — vérifiez la saisie')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Étape suivante' })).toBeDisabled()
  })
})

function afficherEtape1(viewModel: LabellisationEtape1ViewModel = createDefaultLabellisationEtape1ViewModel()): void {
  renderComponent(
    <PathnameContext.Provider value="/label">
      <LabellisationEtape1 viewModel={viewModel} />
    </PathnameContext.Provider>
  )
}

function modifierMaStructure(): void {
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Ma structure' })).getByRole('button', { name: 'Modifier' })
  )
}

function entrepriseTrouvee(): Readonly<{
  activitePrincipale: string
  activitePrincipaleLibelle: string
  adresse: string
  categorieJuridiqueCode: string
  categorieJuridiqueLibelle: string
  codeInsee: string
  codePostal: string
  commune: string
  denomination: string
  identifiant: string
  nomVoie: string
  numeroVoie: string
}> {
  return {
    activitePrincipale: '88.99B',
    activitePrincipaleLibelle: 'Action sociale sans hébergement n.c.a.',
    adresse: '172 B RTE DE LYON, 42300 ROANNE',
    categorieJuridiqueCode: '9220',
    categorieJuridiqueLibelle: 'Association déclarée',
    codeInsee: '42187',
    codePostal: '42300',
    commune: 'ROANNE',
    denomination: 'Solidarnum',
    identifiant: '79227291600034',
    nomVoie: 'RTE DE LYON',
    numeroVoie: '172',
  }
}
