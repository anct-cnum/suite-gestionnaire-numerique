import { render, waitFor } from '@testing-library/react'
import { ComponentProps, RefObject } from 'react'
import { Bar as ReactBar } from 'react-chartjs-2'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Bar from './Bar'

describe('histogramme', () => {
  afterEach(() => {
    vi.mocked(ReactBar).mockClear()

    document.documentElement.removeAttribute('data-fr-theme')
  })

  it('porte son nom accessible et lit les couleurs DSFR sur le canvas, pour suivre le thème', () => {
    // WHEN
    render(
      <Bar
        backgroundColor={['var(--blue-france-main-525)', '#000091']}
        data={[10, 20]}
        etiquettesValeurs={['10', '20']}
        labels={[['oct.'], ['nov.', '(en cours)']]}
        nomAccessible="Histogramme des accompagnements"
      />
    )

    // THEN
    const props = derniersProps()
    expect(props['aria-label']).toBe('Histogramme des accompagnements')
    const canvas = canvasAvecStyle({ '--blue-france-main-525': ' #6a6af4 ', color: 'rgb(58, 58, 58)' })
    const couleur = props.data.datasets[0].backgroundColor as (context: unknown) => string
    expect(couleur({ chart: { canvas }, dataIndex: 0 })).toBe('#6a6af4')
    expect(couleur({ chart: { canvas }, dataIndex: 1 })).toBe('#000091')
    expect(couleur({ chart: { canvas }, dataIndex: 2 })).toBe('')
  })

  it('écrit la valeur de chaque barre au-dessus d’elle, dans la couleur du texte du thème', () => {
    // GIVEN
    render(
      <Bar
        backgroundColor={['#6a6af4', '#000091']}
        data={[10, 20]}
        etiquettesValeurs={['10', '1 234']}
        labels={['oct.', 'nov.']}
      />
    )
    const [plugin] = derniersProps().plugins ?? []
    const ctx = {
      fillText: vi.fn<(texte: string, abscisse: number, ordonnee: number) => void>(),
      restore: vi.fn<() => void>(),
      save: vi.fn<() => void>(),
    } as Record<string, unknown>
    const canvas = canvasAvecStyle({ color: 'rgb(206, 206, 206)' })
    const chart = {
      canvas,
      ctx,
      getDatasetMeta: () => ({
        data: [barre(10, 100), barre(30, 50), barre(50, 20)],
      }),
    }

    // WHEN
    // @ts-expect-error graphique simulé : seules les propriétés lues par le plugin sont fournies
    plugin.afterDatasetsDraw?.(chart, {}, {})

    // THEN
    expect(ctx.fillStyle).toBe('rgb(206, 206, 206)')
    expect(ctx.fillText).toHaveBeenNthCalledWith(1, '10', 10, 96)
    expect(ctx.fillText).toHaveBeenNthCalledWith(2, '1 234', 30, 46)
    expect(ctx.fillText).toHaveBeenNthCalledWith(3, '', 50, 16)
  })

  it('sans valeurs à écrire ni nom, garde le rendu d’origine', () => {
    // WHEN
    render(<Bar backgroundColor={['#6a6af4']} data={[10]} labels={['oct.']} />)

    // THEN
    const props = derniersProps()
    expect(props.plugins).toStrictEqual([])
    expect(props['aria-label']).toBeUndefined()
  })

  it('se redessine quand le thème DSFR change, puis cesse d’observer une fois retiré', async () => {
    // GIVEN
    const { unmount } = render(<Bar backgroundColor={['#6a6af4']} data={[10]} labels={['oct.']} />)
    const update = vi.fn<() => void>()
    const ref = (derniersProps() as unknown as Readonly<{ ref: RefObject<unknown> }>).ref
    ref.current = { update }

    // WHEN

    document.documentElement.setAttribute('data-fr-theme', 'dark')

    // THEN
    await waitFor(() => {
      expect(update).toHaveBeenCalledTimes(1)
    })

    // WHEN
    unmount()

    document.documentElement.setAttribute('data-fr-theme', 'light')

    // THEN
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    expect(update).toHaveBeenCalledTimes(1)
  })
})

function derniersProps(): ComponentProps<typeof ReactBar> {
  return vi.mocked(ReactBar).mock.lastCall?.[0] as ComponentProps<typeof ReactBar>
}

function barre(abscisse: number, ordonnee: number): Readonly<Record<string, number>> {
  // Chart.js nomme les coordonnées d’une barre x et y
  return Object.fromEntries([
    ['x', abscisse],
    ['y', ordonnee],
  ])
}

function canvasAvecStyle(style: Readonly<Record<string, string>>): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  Object.entries(style).forEach(([propriete, valeur]) => {
    canvas.style.setProperty(propriete, valeur)
  })
  return canvas
}
