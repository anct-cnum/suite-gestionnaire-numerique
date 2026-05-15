import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RapportsForm from './RapportsForm'

describe('formulaire de génération de rapport', () => {
  beforeEach(() => {
    Object.defineProperty(window.URL, 'createObjectURL', { configurable: true, value: () => '' })
    Object.defineProperty(window.URL, 'revokeObjectURL', { configurable: true, value: () => undefined })
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:rapport')
    vi.spyOn(window.URL, 'revokeObjectURL').mockReturnValue(undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockReturnValue(undefined)
  })

  it('quand j’affiche le formulaire, alors National et Word sont sélectionnés par défaut', () => {
    // WHEN
    afficherLeFormulaire()

    // THEN
    expect(screen.getByRole('heading', { name: 'Paramètres du rapport' })).toBeInTheDocument()
    const echelon = screen.getByRole('combobox', { name: 'Échelon géographique' })
    expect(echelon).toHaveValue('national')
    expect(screen.getByRole('radio', { name: 'Word (.docx)' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'PDF' })).not.toBeChecked()
  })

  it('quand je génère un rapport national au format Word, alors l’API est appelée et le fichier est téléchargé', async () => {
    // GIVEN
    const fetchSpy = stubFetchOk()
    afficherLeFormulaire()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Générer le rapport' }))

    // THEN
    expect(fetchSpy).toHaveBeenCalledWith('/api/rapport?format=docx&type=national')
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('quand je choisis une région et le format PDF, alors l’API est appelée avec le périmètre régional', async () => {
    // GIVEN
    const fetchSpy = stubFetchOk()
    afficherLeFormulaire()

    // WHEN
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Échelon géographique' }), 'region:84')
    await userEvent.click(screen.getByRole('radio', { name: 'PDF' }))
    await userEvent.click(screen.getByRole('button', { name: 'Générer le rapport' }))

    // THEN
    expect(fetchSpy).toHaveBeenCalledWith('/api/rapport?format=pdf&type=region&code=84')
  })

  it('quand l’API échoue, alors un message d’erreur est affiché', async () => {
    // GIVEN
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false, status: 500 } as Response)
    afficherLeFormulaire()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Générer le rapport' }))

    // THEN
    const alerte = await screen.findByRole('alert')
    expect(alerte.textContent).toBe('La génération du rapport a échoué. Veuillez réessayer.')
  })
})

function stubFetchOk() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    blob: async () => Promise.resolve(new Blob(['contenu'])),
    headers: { get: () => 'attachment; filename="rapport-le-territoire-national.docx"' },
    ok: true,
    status: 200,
  } as unknown as Response)
}

function afficherLeFormulaire(): void {
  render(<RapportsForm departements={[{ code: '01', nom: 'Ain' }]} regions={[{ code: '84', nom: 'Auvergne' }]} />)
}
