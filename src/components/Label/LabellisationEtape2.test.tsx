import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import LabellisationEtape2 from './LabellisationEtape2'
import { renderComponent } from '@/components/testHelper'
import { LabellisationEtape2ViewModel } from '@/presenters/labellisationPresenter'
import { createDefaultLabellisationEtape2ViewModel } from '@/stories/Components/Label/LabellisationTestData'

describe('labellisation étape 2', () => {
  afterEach(() => {
    delete (globalThis as { print?: unknown }).print
  })

  it('affiche le titre, le stepper, l’attestation et la structure porteuse du label', () => {
    // WHEN
    afficherEtape2()

    // THEN
    expect(
      screen.getByRole('heading', { level: 1, name: 'Labellisez votre structure conseiller numérique' })
    ).toBeInTheDocument()
    expect(screen.getByText('Vérifiez vos informations, l’activation prend quelques minutes')).toBeInTheDocument()
    expect(screen.getByText('Étape 2 sur 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Attestation sur l’honneur' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ce que le label reconnaît' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ce que votre structure atteste' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ce à quoi votre structure s’engage' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Détail sur le fonctionnement du label' })).toBeInTheDocument()
    expect(screen.getByText('Structure porteuse du label')).toBeInTheDocument()
    // Le nom de la structure apparaît dans le récapitulatif et dans la phrase d’introduction des attestations.
    expect(screen.getAllByText('Emmaus Connect')).toHaveLength(2)
    expect(screen.getByText('172 B route de Lyon, 42300 Roanne')).toBeInTheDocument()
    expect(screen.getByText('N°SIRET : 79227291600034')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Précédent' })).toHaveAttribute('href', '/label')
  })

  it('les deux attestations sont décochées par défaut et la confirmation est désactivée', () => {
    // WHEN
    afficherEtape2()

    // THEN
    const cases = screen.getAllByRole('checkbox')
    expect(cases).toHaveLength(2)
    expect(cases[0]).not.toBeChecked()
    expect(cases[1]).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Confirmer et activer le label' })).toBeDisabled()
  })

  it('la confirmation est possible uniquement quand les deux attestations sont cochées', () => {
    // GIVEN
    afficherEtape2()
    const [attestationActivite, attestationSignalement] = screen.getAllByRole('checkbox')

    // WHEN
    fireEvent.click(attestationActivite)

    // THEN
    expect(screen.getByRole('button', { name: 'Confirmer et activer le label' })).toBeDisabled()

    // WHEN
    fireEvent.click(attestationSignalement)

    // THEN
    expect(screen.getByRole('button', { name: 'Confirmer et activer le label' })).toBeEnabled()

    // WHEN
    fireEvent.click(attestationActivite)

    // THEN
    expect(screen.getByRole('button', { name: 'Confirmer et activer le label' })).toBeDisabled()
  })

  it('ouvre l’impression du navigateur au clic sur imprimer', () => {
    // GIVEN
    const print = vi.fn<() => void>()
    Object.assign(globalThis, { print })
    afficherEtape2()

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Imprimer' }))

    // THEN
    expect(print).toHaveBeenCalledTimes(1)
  })
})

function afficherEtape2(viewModel: LabellisationEtape2ViewModel = createDefaultLabellisationEtape2ViewModel()): void {
  renderComponent(<LabellisationEtape2 viewModel={viewModel} />)
}
