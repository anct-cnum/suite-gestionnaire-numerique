import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DownloadButton } from './DownloadButton'
import { renderComponent } from '../../testHelper'

describe('bouton de téléchargement d’un graphique', () => {
  it('son intitulé sépare « Télécharger le graphique » du titre du graphique par une espace', () => {
    // WHEN
    renderComponent(<DownloadButton onClick={vi.fn<() => void>()} title="Lieux d'inclusion numérique" />)

    // THEN
    const bouton = screen.getByRole('button', { name: "Télécharger le graphique Lieux d'inclusion numérique" })
    expect(bouton.textContent).toBe("Télécharger le graphique Lieux d'inclusion numérique")
  })
})
