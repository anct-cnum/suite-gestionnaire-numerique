import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BoutonsZoom from './BoutonsZoom'
import { renderComponent } from '@/components/testHelper'

describe('boutons de zoom d’une carte', () => {
  it('affiche deux boutons DSFR nommés en français, avec une infobulle identique au nom', () => {
    // WHEN
    renderComponent(<BoutonsZoom onDezoomer={vi.fn<() => void>()} onZoomer={vi.fn<() => void>()} />)

    // THEN
    const zoomer = screen.getByRole('button', { name: 'Zoomer' })
    expect(zoomer.getAttribute('title')).toBe('Zoomer')
    expect(zoomer.getAttribute('type')).toBe('button')
    expect(zoomer.className).toBe('fr-btn fr-btn--tertiary fr-btn--sm fr-icon-add-line')
    const dezoomer = screen.getByRole('button', { name: 'Dézoomer' })
    expect(dezoomer.getAttribute('title')).toBe('Dézoomer')
    expect(dezoomer.getAttribute('type')).toBe('button')
    expect(dezoomer.className).toBe('fr-btn fr-btn--tertiary fr-btn--sm fr-icon-subtract-line')
  })

  it('les boutons restent atteignables au clavier : ni masqués aux aides techniques ni retirés de la tabulation', () => {
    // WHEN
    renderComponent(<BoutonsZoom onDezoomer={vi.fn<() => void>()} onZoomer={vi.fn<() => void>()} />)

    // THEN (getByRole ignore les éléments masqués aux aides techniques)
    expect(screen.getByRole('button', { name: 'Zoomer' }).tabIndex).toBe(0)
    expect(screen.getByRole('button', { name: 'Dézoomer' }).tabIndex).toBe(0)
  })

  it('quand on clique sur « Zoomer » alors la carte zoome', async () => {
    // GIVEN
    const onZoomer = vi.fn<() => void>()
    const onDezoomer = vi.fn<() => void>()
    renderComponent(<BoutonsZoom onDezoomer={onDezoomer} onZoomer={onZoomer} />)

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Zoomer' }))

    // THEN
    expect(onZoomer).toHaveBeenCalledTimes(1)
    expect(onDezoomer).not.toHaveBeenCalled()
  })

  it('quand on active « Dézoomer » au clavier alors la carte dézoome', async () => {
    // GIVEN
    const onZoomer = vi.fn<() => void>()
    const onDezoomer = vi.fn<() => void>()
    renderComponent(<BoutonsZoom onDezoomer={onDezoomer} onZoomer={onZoomer} />)

    // WHEN
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    // THEN
    expect(onDezoomer).toHaveBeenCalledTimes(1)
    expect(onZoomer).not.toHaveBeenCalled()
  })
})
