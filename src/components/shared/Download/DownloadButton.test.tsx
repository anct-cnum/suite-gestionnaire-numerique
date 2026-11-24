import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DownloadButton } from './DownloadButton'
import { renderComponent } from '../../testHelper'
import * as downloadHelp from '@/shared/DownloadHelp'

describe('lien de téléchargement d’un graphique (RGAA 7.1)', () => {
  beforeEach(() => {
    // jsdom n'implémente pas les URL d'objets (blob:)
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: () => '' })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined })
  })

  it('est un lien <a download> nommé par le graphique et son format, sans title qui double son nom', () => {
    // WHEN
    renderComponent(
      <DownloadButton
        cible={createRef<HTMLElement>()}
        nomFichier="lieux-en-territoires-prioritaires.png"
        title="Lieux en territoires prioritaires"
      />
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Télécharger le graphique Lieux en territoires prioritaires (PNG)' })
    expect(lien.tagName).toBe('A')
    expect(lien.getAttribute('download')).toBe('lieux-en-territoires-prioritaires.png')
    expect(lien.textContent).toBe('Télécharger le graphique Lieux en territoires prioritaires (PNG)')
    expect(lien.getAttribute('title')).toBeNull()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('au clic, génère l’image du graphique et la télécharge par le lien, sans changer de page, puis libère l’image', async () => {
    // GIVEN
    const image = new Blob(['png'], { type: 'image/png' })
    const capture = vi.spyOn(downloadHelp, 'capturerEnPng').mockResolvedValueOnce(image)
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:http://localhost/graphique')
    const liberation = vi.spyOn(URL, 'revokeObjectURL')
    const hrefsTelecharges: Array<null | string> = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementationOnce(function (this: HTMLAnchorElement) {
      hrefsTelecharges.push(this.getAttribute('href'))
    })
    const graphique = createRef<HTMLDivElement>()
    const { unmount } = renderComponent(
      <>
        <div ref={graphique} />
        <DownloadButton cible={graphique} nomFichier="niveau-de-formation.png" title="Niveau de formation" />
      </>
    )
    const lien = screen.getByRole('link', { name: 'Télécharger le graphique Niveau de formation (PNG)' })

    // WHEN
    const navigationParDefaut = fireEvent.click(lien)

    // THEN
    expect(navigationParDefaut).toBe(false)
    await waitFor(() => {
      expect(hrefsTelecharges).toStrictEqual(['blob:http://localhost/graphique'])
    })
    expect(capture).toHaveBeenCalledWith(graphique.current)
    expect(lien.getAttribute('download')).toBe('niveau-de-formation.png')
    unmount()
    expect(liberation).toHaveBeenCalledWith('blob:http://localhost/graphique')
  })

  it('si la génération de l’image échoue, rien n’est téléchargé', async () => {
    // GIVEN
    const capture = vi.spyOn(downloadHelp, 'capturerEnPng').mockResolvedValueOnce(null)
    const clicProgramme = vi.spyOn(HTMLAnchorElement.prototype, 'click')
    const graphique = createRef<HTMLDivElement>()
    renderComponent(
      <>
        <div ref={graphique} />
        <DownloadButton cible={graphique} nomFichier="niveau-de-formation.png" title="Niveau de formation" />
      </>
    )

    // WHEN
    fireEvent.click(screen.getByRole('link', { name: 'Télécharger le graphique Niveau de formation (PNG)' }))

    // THEN
    await waitFor(() => {
      expect(capture).toHaveBeenCalledTimes(1)
    })
    expect(clicProgramme).not.toHaveBeenCalled()
  })
})
