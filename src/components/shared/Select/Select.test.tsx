import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Select from './Select'
import { renderComponent } from '@/components/testHelper'

describe('select', () => {
  it('affiche un label associé au champ', () => {
    // GIVEN
    renderComponent(
      <Select id="departement" options={options}>
        Département
      </Select>
    )

    // THEN
    const select = screen.getByRole('combobox', { name: 'Département' })
    expect(select).toBeInTheDocument()
  })

  it('appelle onChange avec l’option choisie quand je sélectionne une option', async () => {
    // GIVEN
    const onChange = vi.fn<(option: null | Readonly<{ label: string; value: string }>) => void>()
    renderComponent(
      <Select id="departement" onChange={onChange} options={options}>
        Département
      </Select>
    )

    // WHEN
    await userEvent.click(screen.getByRole('combobox', { name: 'Département' }))
    await userEvent.click(await screen.findByRole('option', { name: '42 - Loire' }))

    // THEN
    expect(onChange).toHaveBeenCalledWith({ label: '42 - Loire', value: '42' })
  })

  it('affiche l’option marquée isSelected quand le champ n’est pas contrôlé', () => {
    // GIVEN
    renderComponent(
      <Select
        id="departement"
        options={[
          { label: '01 - Ain', value: '01' },
          { isSelected: true, label: '42 - Loire', value: '42' },
        ]}
      >
        Département
      </Select>
    )

    // THEN
    const valeurAffichee = screen.getByText('42 - Loire')
    expect(valeurAffichee).toBeInTheDocument()
  })

  it('affiche l’option correspondant à la valeur quand le champ est contrôlé', () => {
    // GIVEN
    renderComponent(
      <Select id="departement" options={options} value="01">
        Département
      </Select>
    )

    // THEN
    const valeurAffichee = screen.getByText('01 - Ain')
    expect(valeurAffichee).toBeInTheDocument()
  })

  it('affiche le placeholder quand la valeur contrôlée ne correspond à aucune option', () => {
    // GIVEN
    renderComponent(
      <Select id="departement" options={options} placeholder="Sélectionnez un département" value="">
        Département
      </Select>
    )

    // THEN
    const placeholder = screen.getByText('Sélectionnez un département')
    expect(placeholder).toBeInTheDocument()
  })

  it('désactive le champ quand disabled est vrai', () => {
    // GIVEN
    renderComponent(
      <Select disabled={true} id="departement" options={options}>
        Département
      </Select>
    )

    // THEN
    const select = screen.getByLabelText('Département')
    expect(select).toBeDisabled()
  })

  it('rend un input caché portant le name pour la soumission de formulaire', async () => {
    // GIVEN
    renderComponent(
      <Select id="departement" name="departement" options={options}>
        Département
      </Select>
    )

    // WHEN
    await userEvent.click(screen.getByRole('combobox', { name: 'Département' }))
    await userEvent.click(await screen.findByRole('option', { name: '42 - Loire' }))

    // THEN
    const inputCache = screen.getByDisplayValue('42')
    expect(inputCache).toHaveAttribute('name', 'departement')
  })

  it('affiche « Pas de résultat » quand la recherche ne correspond à aucune option', async () => {
    // GIVEN
    renderComponent(
      <Select id="departement" options={options}>
        Département
      </Select>
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Département' }), 'zzz')

    // THEN
    const aucunResultat = await screen.findByText('Pas de résultat')
    expect(aucunResultat).toBeInTheDocument()
  })
})

const options = [
  { label: '01 - Ain', value: '01' },
  { label: '42 - Loire', value: '42' },
]
